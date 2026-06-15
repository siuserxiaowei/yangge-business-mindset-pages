# 洋哥商业心法 · 术法道器势系列拆解

这是一个 GitHub Pages 静态站点，用来承载「洋哥商业心法」系列妙记内容的结构化拆解。

项目把妙记里的智能总结、文字记录、课堂资料和补充分析拆成独立页面，再统一用「术 / 法 / 道 / 器 / 势」框架整理，方便直接在线阅读、复盘和二次扩展。

## 在线页面

- 系列首页：https://siuserxiaowei.github.io/yangge-business-mindset-pages/
- 素材核对报告：https://siuserxiaowei.github.io/yangge-business-mindset-pages/audit.html
- GitHub 仓库：https://github.com/siuserxiaowei/yangge-business-mindset-pages

## 页面目录

| 页面 | 拆解页 | 素材库页 | 主要内容 |
|---|---|---|---|
| 商业心法总纲 | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912868579112712840/ | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912868579112712840/materials.html | AI 创业、商业增长、IP、流量、长期主义和「术法道器势」总框架 |
| 商业预判 | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879659054594696/ | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879659054594696/materials.html | 创业预判、赛道筛选、终局图谱、P 型/L 型创业者、AI 时代培训行业变化 |
| 第一性原理 | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879694488601688/ | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879694488601688/materials.html | 战略取舍、系统拆解、质疑默认路径、单变量优化和 AI 自动化判断 |
| MVP 验证 | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879709520320784/ | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879709520320784/materials.html | 最小可行产品、低成本试错、关键假设验证、实验卡和验证流程 |
| SWOT 与商业画布 | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879720258402952/ | https://siuserxiaowei.github.io/yangge-business-mindset-pages/notes/1912879720258402952/materials.html | SWOT、商业画布、AI 创业赛道战略、客户细分、价值主张和收益闭环 |

## 拆解框架

每篇文章都按同一套结构处理：

- `术`：可以马上执行的动作，例如访谈、调研、预售、评分、单变量测试。
- `法`：可复用的方法论，例如商业预判五步法、第一性原理六步、MVP 实验流程。
- `道`：底层判断标准，例如长期整体最优、证据优先、低成本验证、先终局后当下。
- `器`：工具、模板和资源，例如访谈表、SWOT 表、商业画布、实验卡、AI 工作流。
- `势`：外部趋势和时机，例如 AI 降低执行成本、技能培训供给过剩、IP 与信任变稀缺。

## 素材边界

- 本仓库内容来自妙记分享页、智能总结、文字记录和可获取的课堂图片。
- `1912879659054594696` 这篇接口返回了 6 张课堂图片，已全部插入文章正文。
- 另外三篇新增内容的分享接口没有返回课堂图片，因此页面只基于智能总结和文字记录整理。
- 课程中涉及的 ROI、增长速度、分润比例等数字属于讲者现场口径，本仓库只做课程逻辑拆解，没有做外部独立核验。

## 仓库结构

```text
.
├── index.html
├── audit.html
├── styles.css
├── scripts/
│   ├── build-site.mjs
│   └── fetch-ddmaster-share-notes.mjs
├── notes/
│   ├── 1912868579112712840/
│   ├── 1912879659054594696/
│   ├── 1912879694488601688/
│   ├── 1912879709520320784/
│   └── 1912879720258402952/
└── sources/
```

每个 `notes/{id}/` 目录通常包含：

- `analysis.md`：该篇完整拆解原稿。
- `index.html`：GitHub Pages 页面。
- `materials.html`：智能总结、文字记录、课堂资料的在线素材库页面。
- `meta.json`：标题、来源链接、分享链接、时长等元数据。
- `sources/normalized-materials.md`：清洗后的智能总结、文字记录和课堂资料索引。
- `sources/raw/`：如果是公开分享页，会保存经过媒体链接脱敏后的原始分享接口数据。
- `assets/class-images/`：该篇可获取的课堂图片。

## 维护方式

重新抓取分享页素材：

```bash
node scripts/fetch-ddmaster-share-notes.mjs
```

重新生成静态页面：

```bash
node scripts/build-site.mjs
```

本地预览：

```bash
python3 -m http.server 8020
```

然后访问：

```text
http://localhost:8020/
```

## 部署方式

本仓库使用 GitHub Pages，从 `main` 分支根目录直接部署。

发布流程：

```bash
node scripts/build-site.mjs
git add README.md index.html styles.css scripts notes
git commit -m "Update site documentation"
git push origin main
```

GitHub Pages 部署完成后，线上入口为：

```text
https://siuserxiaowei.github.io/yangge-business-mindset-pages/
```

## 最近更新

- 新增 4 篇妙记拆解页面。
- 首页改成系列入口页。
- 课堂资料从单独素材区改为插入正文。
- 调整引用、加粗和移动端阅读排版。
- 补充 README 的仓库说明、页面目录、素材边界和维护方式。
