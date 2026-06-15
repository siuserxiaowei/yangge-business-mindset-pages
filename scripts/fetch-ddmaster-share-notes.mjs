import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const headers = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
  'Xi-App-Client-Source': 'getnote',
};

const defaultMapping = [
  ['1912879659054594696', 'rBzV4RYl342Q1'],
  ['1912879694488601688', '7gvWao4XZkzLL'],
  ['1912879709520320784', '6gBW134nLK4ly'],
  ['1912879720258402952', 'XJzooyjMxmkP6'],
];

function pad(value, width = 2) {
  return String(value).padStart(width, '0');
}

function formatMs(ms) {
  const totalSeconds = Math.floor(Number(ms || 0) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function safeJsonParse(value, fallback = null) {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function sanitizeForDisk(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeForDisk);
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === 'url' && typeof child === 'string' && /^https?:\/\//.test(child)) {
      out[key] = '[redacted-media-url]';
    } else {
      out[key] = sanitizeForDisk(child);
    }
  }
  return out;
}

async function requestJson(url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok || body?.h?.c !== 0) {
    throw new Error(`Request failed ${res.status}: ${url}`);
  }
  return body;
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(sanitizeForDisk(value), null, 2)}\n`, 'utf8');
}

async function downloadFile(url, filePath) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return buffer.length;
}

function collectImageRows(original, noteDir, pageNoteId) {
  const moments = original.c?.timeline_moments || [];
  const rows = [];
  for (let momentIndex = 0; momentIndex < moments.length; momentIndex += 1) {
    const moment = moments[momentIndex];
    for (let fileIndex = 0; fileIndex < (moment.files || []).length; fileIndex += 1) {
      const file = moment.files[fileIndex];
      const ext = String(file.ext || path.extname(file.name || '').slice(1) || 'jpg').replace(/^\./, '');
      const basename = `${pad(momentIndex + 1)}-${moment.id || `moment-${momentIndex + 1}`}-${pad(fileIndex + 1)}.${ext}`;
      const absPath = path.join(noteDir, 'assets', 'class-images', basename);
      rows.push({
        page_note_id: pageNoteId,
        moment_id: moment.id,
        action_time_ms: moment.action_time,
        file_id: file.file_id,
        source_name: file.name,
        local_file: path.relative(noteDir, absPath),
        absolute_file: absPath,
        source_size: file.size,
        source_url: file.url,
      });
    }
  }
  return rows;
}

async function runOcr(noteDir, rows) {
  if (!rows.length) return [];
  try {
    execFileSync('/opt/homebrew/bin/tesseract', ['--version'], { stdio: 'ignore' });
  } catch {
    return [];
  }
  const textDir = path.join(noteDir, 'sources', 'ocr-text');
  await fs.mkdir(textDir, { recursive: true });
  const results = [];
  for (const row of rows) {
    const txtName = `${path.basename(row.local_file, path.extname(row.local_file))}.txt`;
    const txtPath = path.join(textDir, txtName);
    let text = '';
    try {
      text = execFileSync(
        '/opt/homebrew/bin/tesseract',
        [row.absolute_file, 'stdout', '-l', 'chi_sim+eng', '--psm', '6'],
        { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
      ).trim();
    } catch {
      text = '';
    }
    await fs.writeFile(txtPath, `${text}\n`, 'utf8');
    const { source_url, absolute_file, ...publicRow } = row;
    results.push({
      ...publicRow,
      action_time: formatMs(row.action_time_ms),
      ocr_text_file: path.relative(noteDir, txtPath),
      text,
      char_count: text.length,
    });
  }
  return results;
}

function renderImageTable(rows) {
  if (!rows.length) return '_分享接口未提供课堂图片文件_';
  return [
    '| 时间 | 本地文件 | OCR 字符数 |',
    '|---|---|---:|',
    ...rows.map((row) => `| ${formatMs(row.action_time_ms)} | ${row.local_file} | ${row.char_count ?? 0} |`),
  ].join('\n');
}

async function writeNormalizedMaterials(noteDir, pageNoteId, shareId, detail, original, childrenCount, imageRows, ocrResults) {
  const note = detail.c.note;
  const transcript = safeJsonParse(original.c.content, { sentence_list: [] });
  const sentences = transcript.sentence_list || [];
  const audioAttachments = note.attachments || [];
  const ocrByFile = new Map(ocrResults.map((row) => [row.local_file, row]));
  const materialRows = imageRows.map(({ absolute_file, source_url, ...row }) => ({
    ...row,
    ...(ocrByFile.get(row.local_file) || {}),
  }));

  const lines = [
    '---',
    `page_note_id: "${pageNoteId}"`,
    `share_id: "${shareId}"`,
    `source_note_id: "${note.note_id}"`,
    `title: "${String(note.title || '').replaceAll('"', '\\"')}"`,
    `source_url: "https://biji.ddmaster.com/note/${pageNoteId}"`,
    `share_url: "https://biji.ddmaster.com/note/share_note/${shareId}"`,
    `generated_at: "${new Date().toISOString()}"`,
    '---',
    '',
    `# ${note.title}：清洗版素材库`,
    '',
    '## 0. 素材边界',
    '',
    `- 用户提供笔记 ID：${pageNoteId}`,
    `- 分享 ID：${shareId}`,
    `- 分享接口源笔记 ID：${note.note_id}`,
    `- 标题：${note.title}`,
    `- 类型：${note.note_type}`,
    `- 来源：${note.source}`,
    `- 妙记创建时间：${note.created_at || ''}`,
    `- 妙记更新时间：${note.updated_at || ''}`,
    `- 子笔记数量：${childrenCount.c?.total ?? 0}`,
    `- 智能总结字符数：${String(note.content || '').length}`,
    `- 文字记录句子数：${sentences.length}`,
    `- 课堂图片数量：${materialRows.length}`,
    '',
    '## 1. 智能总结（妙记原文）',
    '',
    note.content || '_无智能总结内容_',
    '',
    '## 2. 文字记录（逐句清洗）',
    '',
    ...sentences.flatMap((sentence, index) => [
      `### ${pad(index + 1)}. ${formatMs(sentence.start_time)}-${formatMs(sentence.end_time)} ${sentence.speaker_name || 'speaker'}`,
      '',
      sentence.text || '',
      '',
    ]),
    '## 3. 课堂资料',
    '',
    '### 3.1 音频附件元数据',
    '',
    audioAttachments.length
      ? [
          '| 类型 | 标题 | 时长 | 大小 | 备注 |',
          '|---|---|---:|---:|---|',
          ...audioAttachments.map(
            (item) =>
              `| ${item.type || ''} | ${item.title || ''} | ${formatMs(item.duration || 0)} | ${item.size || 0} | 音频二进制未落库，转写文本已保存 |`,
          ),
        ].join('\n')
      : '_无音频附件_',
    '',
    '### 3.2 图片资料索引',
    '',
    renderImageTable(materialRows),
    '',
    '### 3.3 OCR 结果（Tesseract，质量仅作辅助）',
    '',
    ...materialRows.flatMap((row, index) => [
      `#### ${index + 1}. ${formatMs(row.action_time_ms)} ${row.moment_id}`,
      '',
      `- 本地图片：${row.local_file}`,
      `- OCR 文件：${row.ocr_text_file || ''}`,
      '',
      '```text',
      row.text || '[未识别到文字]',
      '```',
      '',
    ]),
  ];
  await fs.writeFile(path.join(noteDir, 'sources', 'normalized-materials.md'), `${lines.join('\n')}\n`, 'utf8');
}

async function fetchOne(pageNoteId, shareId) {
  const noteDir = path.join(root, 'notes', pageNoteId);
  await fs.mkdir(path.join(noteDir, 'sources', 'raw'), { recursive: true });
  await fs.mkdir(path.join(noteDir, 'assets', 'class-images'), { recursive: true });

  const detail = await requestJson(`https://get-notes.luojilab.com/voicenotes/web/share/notes/${shareId}?acode=`);
  const original = await requestJson(`https://get-notes.luojilab.com/voicenotes/web/share/notes/${shareId}/original`);
  const childrenCount = await requestJson(`https://get-notes.luojilab.com/voicenotes/web/share/notes/${shareId}/children/count`);

  const rawImageRows = collectImageRows(original, noteDir, pageNoteId);
  const downloadedRows = [];
  for (const row of rawImageRows) {
    let downloadedSize = 0;
    try {
      downloadedSize = await downloadFile(row.source_url, row.absolute_file);
    } catch {
      downloadedSize = 0;
    }
    downloadedRows.push({ ...row, downloaded_size: downloadedSize });
  }
  const ocrResults = await runOcr(noteDir, downloadedRows);
  const imageIndex = downloadedRows.map(({ source_url, absolute_file, ...row }) => row);

  await writeJson(path.join(noteDir, 'sources', 'raw', 'raw-share-detail.json'), detail);
  await writeJson(path.join(noteDir, 'sources', 'raw', 'raw-share-original.json'), original);
  await writeJson(path.join(noteDir, 'sources', 'raw', 'raw-share-children-count.json'), childrenCount);
  await fs.writeFile(path.join(noteDir, 'sources', 'image-index.json'), `${JSON.stringify(imageIndex, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(noteDir, 'sources', 'ocr-results.json'), `${JSON.stringify(ocrResults, null, 2)}\n`, 'utf8');

  await writeNormalizedMaterials(noteDir, pageNoteId, shareId, detail, original, childrenCount, downloadedRows, ocrResults);

  const note = detail.c.note;
  const transcript = safeJsonParse(original.c.content, { sentence_list: [] });
  const durationMs =
    note.attachments?.find((item) => item.duration)?.duration ||
    (transcript.sentence_list || []).at(-1)?.end_time ||
    0;
  const meta = {
    id: pageNoteId,
    share_id: shareId,
    source_note_id: note.note_id,
    title: note.title,
    source_url: `https://biji.ddmaster.com/note/${pageNoteId}`,
    share_url: `https://biji.ddmaster.com/note/share_note/${shareId}`,
    created_at: note.created_at || '',
    updated_at: note.updated_at || '',
    duration: formatMs(durationMs),
    summary_chars: String(note.content || '').length,
    transcript_sentences: (transcript.sentence_list || []).length,
    class_images: imageIndex.length,
    generated_at: new Date().toISOString(),
  };
  await fs.writeFile(path.join(noteDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  return meta;
}

async function main() {
  const mapping = process.argv.slice(2).length
    ? process.argv.slice(2).map((item) => {
        const [noteId, shareId] = item.split(':');
        if (!noteId || !shareId) throw new Error(`Invalid mapping: ${item}`);
        return [noteId, shareId];
      })
    : defaultMapping;
  const metas = [];
  for (const [pageNoteId, shareId] of mapping) {
    const meta = await fetchOne(pageNoteId, shareId);
    metas.push(meta);
    console.log(`Fetched ${pageNoteId}: ${meta.title} (${meta.duration}, ${meta.class_images} image(s))`);
  }
  await fs.writeFile(
    path.join(root, 'notes', 'share-fetch-summary.json'),
    `${JSON.stringify({ fetched_at: new Date().toISOString(), notes: metas }, null, 2)}\n`,
    'utf8',
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
