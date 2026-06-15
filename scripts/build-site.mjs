import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const mdSource = path.join(root, 'analysis.md');

const inlineMaterials = new Map([
  [
    '0-素材边界',
    [
      {
        src: 'assets/class-images/03-003_aJR6Tk-01.jpg',
        title: '课程资料封面',
        caption: '商业内生增长心法 / AI时代的商业升级与落地实战。',
      },
    ],
  ],
  [
    '3-术法道器势总表',
    [
      {
        src: 'assets/class-images/01-001_WadRXb-01.jpg',
        title: '课堂投影：成功公式',
        caption: '底层规律、方法论、执行关键三组结构，对应“道法术器势”的主框架。',
      },
    ],
  ],
  [
    '4-3-第三层-成功公式',
    [
      {
        src: 'assets/class-images/08-008_2irXy8-01.jpg',
        title: '课堂资料：创业进阶里程碑与成功公式',
        caption: '第一个 100 万、第一个 1000 万、第 N 个 1000 万，下面是成功=底层规律×系统方法×长期主义。',
      },
    ],
  ],
  [
    '5-12-未来商业黄金三角-ai-ip-流量',
    [
      {
        src: 'assets/class-images/09-009_4YSOi6-01.jpg',
        title: '课堂资料：未来商业黄金三角',
        caption: '用 AI 提升效率，用 IP 建立信任，用流量扩大覆盖。',
      },
    ],
  ],
  [
    '10-关键人物与资源',
    [
      {
        src: 'assets/class-images/04-004_N9x3aV-01.jpg',
        title: '课堂资料：讲师与战队机制',
        caption: '讲师介绍、影响力数据和战队破冰信息，相关数字按现场图片口径处理。',
      },
      {
        src: 'assets/class-images/05-005_ZB1Yt8-01.jpg',
        title: '课堂资料：破局生态',
        caption: '愿景、使命、价值观：坚信 AGI 时代、真诚、利他、聚焦。',
      },
      {
        src: 'assets/class-images/06-006_hrgnBL-01.jpg',
        title: '课堂资料：破局私塾目标',
        caption: '打造年入千万 AI 创业公司，提升品牌商业变现认知，迭代闭环商业生态模式。',
      },
    ],
  ],
  [
    '11-课堂资料补全清单',
    [
      {
        src: 'assets/class-images/02-002_FPxXcR-01.jpg',
        title: '课堂投影：对创业者的启示',
        caption: '先挖矿再盖楼、用模型驯服复杂、接受慢启动、拥抱 AI 但不迷信。',
      },
      {
        src: 'assets/class-images/07-007_IG4eG7-01.jpg',
        title: '课堂资料：勇攀高峰 / 商业 IP',
        caption: '把目标高度和商业 IP 打造放在同一条创业进阶路径里。',
      },
    ],
  ],
]);

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
  <figcaption><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.caption)}</span></figcaption>
</figure>`;
}

function renderInlineMaterialsFor(id) {
  const items = inlineMaterials.get(id) || [];
  if (!items.length) return '';
  const className = items.length > 1 ? 'material-cluster' : 'material-single';
  return `<div class="${className}">
${items.map(renderMaterialFigure).join('\n')}
</div>`;
}

function markdownToHtml(markdown) {
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
      const figures = renderInlineMaterialsFor(id);
      if (figures) out.push(figures);
      continue;
    }

    const quote = line.match(/^>\s*(.+)$/);
    if (quote) {
      closeList();
      out.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
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

async function main() {
  const markdown = await fs.readFile(mdSource, 'utf8');
  const articleHtml = markdownToHtml(markdown);
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>洋哥商业心法 · 术法道器势拆解</title>
  <meta name="description" content="基于妙记智能总结、文字记录和课堂资料整理的术法道器势拆解。">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <nav>
      <a href="#top" class="brand">洋哥商业心法</a>
      <div>
        <a href="#1-如果只读-10-分钟">速读</a>
        <a href="#3-术法道器势总表">框架</a>
        <a href="#5-深挖-12-个值得单独学的知识点">深挖</a>
        <a href="#6-我补充的内容">补充</a>
      </div>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <p class="meta">AI创业 / 商业增长 / 课堂复盘</p>
        <h1>洋哥商业心法<br>术法道器势<br>深度拆解</h1>
        <p class="lead">把智能总结、文字记录和课堂资料重新组织成一个可读、可复盘、可执行的在线长文。</p>
        <div class="actions">
          <a class="button primary" href="#1-如果只读-10-分钟">开始阅读</a>
          <a class="button ghost" href="analysis.md">Markdown 原稿</a>
        </div>
      </div>
    </section>

    <section class="summary-band" aria-label="页面摘要">
      <div><span>素材</span><strong>智能总结 · 文字记录 · 9 张课堂图</strong></div>
      <div><span>框架</span><strong>术 / 法 / 道 / 器 / 势</strong></div>
      <div><span>输出</span><strong>10 分钟速读 · 深挖 · 7 天作业</strong></div>
    </section>

    <article class="content">
${articleHtml}
    </article>
  </main>
</body>
</html>
`;
  await fs.writeFile(path.join(root, 'index.html'), html, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
