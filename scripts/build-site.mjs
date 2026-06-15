import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;

const legacyMaterials = new Map([
  [
    '0-素材边界',
    [
      {
        src: '../../assets/class-images/03-003_aJR6Tk-01.jpg',
        title: '课程资料封面',
        caption: '商业内生增长心法 / AI时代的商业升级与落地实战。',
      },
    ],
  ],
  [
    '3-术法道器势总表',
    [
      {
        src: '../../assets/class-images/01-001_WadRXb-01.jpg',
        title: '课堂投影：成功公式',
        caption: '底层规律、方法论、执行关键三组结构，对应“术法道器势”的主框架。',
      },
    ],
  ],
  [
    '4-3-第三层-成功公式',
    [
      {
        src: '../../assets/class-images/08-008_2irXy8-01.jpg',
        title: '课堂资料：创业进阶里程碑与成功公式',
        caption: '成功=底层规律×系统方法×长期主义。',
      },
    ],
  ],
  [
    '5-12-未来商业黄金三角-ai-ip-流量',
    [
      {
        src: '../../assets/class-images/09-009_4YSOi6-01.jpg',
        title: '课堂资料：未来商业黄金三角',
        caption: '用 AI 提升效率，用 IP 建立信任，用流量扩大覆盖。',
      },
    ],
  ],
  [
    '10-关键人物与资源',
    [
      {
        src: '../../assets/class-images/04-004_N9x3aV-01.jpg',
        title: '课堂资料：岗位与指标',
        caption: '把业务增长拆到岗位、动作和可衡量指标上。',
      },
      {
        src: '../../assets/class-images/05-005_ZB1Yt8-01.jpg',
        title: '课堂资料：团队协作',
        caption: '商业落地不是一个人的灵感，而是组织内不同角色的协同。',
      },
      {
        src: '../../assets/class-images/06-006_hrgnBL-01.jpg',
        title: '课堂资料：资源盘点',
        caption: '能力、资源、时间和现金流都要进入创业判断。',
      },
    ],
  ],
  [
    '11-课堂资料补全清单',
    [
      {
        src: '../../assets/class-images/02-002_FPxXcR-01.jpg',
        title: '课堂资料：AI 时代商业升级',
        caption: '围绕 AI、IP、流量与商业结果搭建业务系统。',
      },
      {
        src: '../../assets/class-images/07-007_IG4eG7-01.jpg',
        title: '课堂资料：行动路径',
        caption: '从认知框架进入执行动作，减少只听不做。',
      },
    ],
  ],
]);

const notes = [
  {
    id: '1912868579112712840',
    title: '洋哥商业心法 · 术法道器势深度拆解',
    shortTitle: '商业心法总纲',
    subtitle: 'AI 创业、商业增长、IP、流量与长期主义的总框架。',
    duration: '31:56',
    sourceUrl: 'https://biji.ddmaster.com/note/1912868579112712840',
    markdownPath: path.join(root, 'analysis.md'),
    markdownHref: '../../analysis.md',
    heroImage: '../../assets/class-images/03-003_aJR6Tk-01.jpg',
    materials: legacyMaterials,
  },
  {
    id: '1912879659054594696',
    shortTitle: '商业预判',
    subtitle: '用调研、赛道筛选和终局图谱，把创业从激情拉回科学决策。',
  },
  {
    id: '1912879694488601688',
    shortTitle: '第一性原理',
    subtitle: '用系统拆解、质疑、重构和单变量优化，训练商业判断能力。',
  },
  {
    id: '1912879709520320784',
    shortTitle: 'MVP 验证',
    subtitle: '用最低成本快速验证关键假设，让失败足够便宜。',
  },
  {
    id: '1912879720258402952',
    shortTitle: 'SWOT 与商业画布',
    subtitle: '从战略分析到客户细分、价值主张、渠道和收益闭环。',
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function renderInline(value) {
  let html = escapeHtml(value);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
  return html;
}

function renderQuoteInline(value) {
  return renderInline(value)
    .replaceAll('，', '，<br>')
    .replaceAll('。', '。<br>')
    .replaceAll('；', '；<br>');
}

function renderTable(rows) {
  const cells = rows.map((row) => row.split('|').slice(1, -1).map((cell) => cell.trim()));
  if (!cells.length) return '';
  const [head, separator, ...body] = cells;
  const headHtml = `<thead><tr>${head.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead>`;
  const bodyRows = (separator ? body : cells.slice(1)).map(
    (row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`,
  );
  return `<div class="table-wrap"><table>${headHtml}<tbody>${bodyRows.join('')}</tbody></table></div>`;
}

function renderMaterialFigure(item) {
  return `<figure class="inline-material">
  <a href="${item.src}" target="_blank" rel="noreferrer">
    <img src="${item.src}" alt="${escapeHtml(item.title)}" loading="lazy">
  </a>
  <figcaption><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.caption || '')}</span></figcaption>
</figure>`;
}

function renderInlineMaterialsFor(id, materials = new Map()) {
  const items = materials.get(id) || [];
  if (!items.length) return '';
  const className = items.length > 1 ? 'material-cluster' : 'material-single';
  return `<div class="${className}">
${items.map(renderMaterialFigure).join('\n')}
</div>`;
}

function parseImageLine(line) {
  const match = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
  if (!match) return null;
  return {
    title: match[1] || '课堂资料',
    src: match[2],
    caption: match[3] || match[1] || '',
  };
}

function markdownToHtml(markdown, materials = new Map()) {
  const lines = markdown
    .replace(/^---[\s\S]*?---\s*/, '')
    .split(/\r?\n/);
  const out = [];
  let listOpen = false;
  let codeOpen = false;
  let codeBuffer = [];
  let tableBuffer = [];
  let skippedDocumentTitle = false;

  function closeList() {
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
  }

  function flushTable() {
    if (tableBuffer.length) {
      closeList();
      out.push(renderTable(tableBuffer));
      tableBuffer = [];
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushTable();
      closeList();
      if (!codeOpen) {
        codeOpen = true;
        codeBuffer = [];
      } else {
        out.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeOpen = false;
      }
      continue;
    }
    if (codeOpen) {
      codeBuffer.push(line);
      continue;
    }

    if (/^\|.*\|$/.test(line.trim())) {
      tableBuffer.push(line.trim());
      continue;
    }
    flushTable();

    if (!line.trim()) {
      closeList();
      continue;
    }

    const image = parseImageLine(line.trim());
    if (image) {
      closeList();
      out.push(renderMaterialFigure(image));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      if (!skippedDocumentTitle && level === 1) {
        skippedDocumentTitle = true;
        continue;
      }
      out.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      const figures = renderInlineMaterialsFor(id, materials);
      if (figures) out.push(figures);
      continue;
    }

    const quote = line.match(/^>\s*(.+)$/);
    if (quote) {
      closeList();
      out.push(`<blockquote><p>${renderQuoteInline(quote[1])}</p></blockquote>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push(`<li>${renderInline(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (numbered) {
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push(`<li>${renderInline(numbered[1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${renderInline(line)}</p>`);
  }
  flushTable();
  closeList();
  return out.join('\n');
}

async function readMeta(note) {
  if (note.markdownPath) return note;
  const metaPath = path.join(root, 'notes', note.id, 'meta.json');
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  return {
    ...note,
    title: meta.title,
    duration: meta.duration,
    sourceUrl: meta.source_url,
    shareUrl: meta.share_url,
    markdownPath: path.join(root, 'notes', note.id, 'analysis.md'),
    markdownHref: 'analysis.md',
  };
}

function renderPageShell({ title, description, cssHref, body }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="${cssHref}">
</head>
<body>
${body}
</body>
</html>
`;
}

function renderHeader(prefix = '') {
  return `<header class="site-header">
    <nav>
      <a href="${prefix}index.html" class="brand">洋哥商业心法</a>
      <div>
        <a href="${prefix}index.html#notes">全部拆解</a>
        <a href="${prefix}index.html#framework">总框架</a>
        <a href="${prefix}README.md">仓库说明</a>
      </div>
    </nav>
  </header>`;
}

async function renderNotePage(note) {
  const markdown = await fs.readFile(note.markdownPath, 'utf8');
  const articleHtml = markdownToHtml(markdown, note.materials || new Map());
  const imageStyle = note.heroImage ? ` style="--hero-image: url('${note.heroImage}')"` : '';
  const body = `${renderHeader('../../')}
  <main id="top">
    <section class="article-hero"${imageStyle}>
      <div class="article-hero-copy">
        <a class="back-link" href="../../index.html">返回系列首页</a>
        <p class="meta">术法道器势 / ${escapeHtml(note.duration || '')}</p>
        <h1>${escapeHtml(note.title)}</h1>
        <p class="lead">${escapeHtml(note.subtitle || '基于智能总结、文字记录和课堂资料重新拆解。')}</p>
        <div class="actions">
          <a class="button primary" href="#1-如果只读-10-分钟">开始阅读</a>
          <a class="button ghost" href="${note.markdownHref}">Markdown 原稿</a>
        </div>
      </div>
    </section>

    <article class="content">
${articleHtml}
    </article>
  </main>`;
  const html = renderPageShell({
    title: `${note.title} · 术法道器势拆解`,
    description: note.subtitle || '基于妙记智能总结、文字记录和课堂资料整理的术法道器势拆解。',
    cssHref: '../../styles.css',
    body,
  });
  const outDir = path.join(root, 'notes', note.id);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8');
}

function renderHub(notesData) {
  const cards = notesData
    .map(
      (note, index) => `<a class="note-card" href="notes/${note.id}/">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(note.shortTitle || note.title)}</h3>
        <p>${escapeHtml(note.subtitle || '')}</p>
        <small>${escapeHtml(note.duration || '')} · ${escapeHtml(note.id)}</small>
      </a>`,
    )
    .join('\n');

  const body = `${renderHeader('')}
  <main id="top">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <p class="meta">AI创业 / 商业增长 / 系列拆解</p>
        <h1>洋哥商业心法<br>术法道器势<br>系列拆解</h1>
        <p class="lead">5 条妙记，5 个独立页面。<br>按“术法道器势”拆解，补上可执行模板。</p>
        <div class="actions">
          <a class="button primary" href="#notes">查看全部</a>
          <a class="button ghost" href="https://github.com/siuserxiaowei/yangge-business-mindset-pages" target="_blank" rel="noreferrer">GitHub 仓库</a>
        </div>
      </div>
    </section>

    <section class="summary-band" id="framework" aria-label="页面摘要">
      <div><span>素材</span><strong>5 条妙记 · 课堂图片 · 文字记录</strong></div>
      <div><span>框架</span><strong>术 / 法 / 道 / 器 / 势</strong></div>
      <div><span>输出</span><strong>独立页面 · 补充模板 · 课后作业</strong></div>
    </section>

    <section class="hub-section" id="notes">
      <div class="section-heading">
        <p class="meta">阅读入口</p>
        <h2>五篇独立拆解</h2>
      </div>
      <div class="note-grid">
${cards}
      </div>
    </section>
  </main>`;

  return renderPageShell({
    title: '洋哥商业心法 · 术法道器势系列拆解',
    description: '基于妙记智能总结、文字记录和课堂资料整理的术法道器势系列拆解。',
    cssHref: 'styles.css',
    body,
  });
}

async function main() {
  const notesData = [];
  for (const note of notes) {
    const hydrated = await readMeta(note);
    notesData.push(hydrated);
    await renderNotePage(hydrated);
  }
  await fs.writeFile(path.join(root, 'index.html'), renderHub(notesData), 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
