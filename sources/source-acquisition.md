# 得到大脑笔记 1912868579112712840 来源采集审计

采集日期：2026-06-15
来源 URL：https://biji.ddmaster.com/note/1912868579112712840
目标仓库：https://github.com/siuserxiaowei/miaoji-decon

## 当前结论

这个链接不是公开分享页，而是登录态下的私有笔记详情页。普通 HTTP 抓取只能拿到前端 SPA 空壳，正文不会写在 HTML 里。

已验证的页面 HTML 只包含：

- `#app` 容器
- 前端 JS/CSS 资源
- `window.__INITIAL_STATE__ = {}`

所以“智能总结、文字记录、课堂资料”必须通过前端接口获取，不能靠静态页面正文提取。

## 已定位接口

前端主包：`https://imgcdn.umiwi.com/fe-static/prod/home/js/home.d939612f.mjs`

接口基址：

- 普通笔记 API：`https://get-notes.luojilab.com`
- 其他笔记/文章 API：`https://notes-api.biji.com`

与本任务直接相关的接口：

| 内容 | 前端函数 | 接口 |
|---|---|---|
| 笔记详情 / 智能总结 | `getNoteDetail` | `GET /voicenotes/web/notes/{note_id}` |
| 文字记录 / 原文 | `getNoteOriginal` | `GET /voicenotes/web/notes/{note_id}/original` |
| 课堂资料 | `NoteClassMaterialPage` / `NoteClassMaterialTabPanel` | 复用 `getNoteOriginal(noteId, query)`，从原文数据里的附件/材料结构渲染 |
| 分享笔记详情 | `getShareNoteDetail` | `GET /voicenotes/web/share/notes/{share_id}?acode=` |
| 分享笔记原文 | `getNoteShareOriginal` | `GET /voicenotes/web/share/notes/{share_id}/original` |
| 加密内容解密 | `note/decrypt` | `POST /voicenotes/web/note/decrypt` |

前端路由确认：

- `/note/:id`：登录态笔记详情
- `/note/:id/original`：登录态文字记录
- `/note/:id/classMaterial`：登录态课堂资料
- `/note/share/:shareId`：公开/半公开分享笔记
- `/note/share/:shareId/original`：分享笔记文字记录

## 已验证失败结果

无登录态请求：

```text
GET https://get-notes.luojilab.com/voicenotes/web/notes/1912868579112712840
=> {"message":"ParseTokenFailed"}
```

无登录态请求文字记录：

```text
GET https://get-notes.luojilab.com/voicenotes/web/notes/1912868579112712840/original
=> {"message":"ParseTokenFailed"}
```

把当前长数字直接当作分享 ID：

```text
GET https://get-notes.luojilab.com/voicenotes/web/share/notes/1912868579112712840?acode=
=> {"h":{"c":10000,"e":"参数错误",...},"c":{}}
```

说明当前 URL 里的 `1912868579112712840` 是登录态 note id，不是可直接公开访问的 share id。

## 授权边界

前端登录态使用浏览器 `localStorage` 的这些键：

- `token`
- `token_expire_at`
- `refresh_token`
- `refresh_token_expire_at`

这些属于敏感登录凭据。后续如需完整抓取“智能总结、文字记录、课堂资料”，只能二选一：

1. 经用户确认后，临时读取本机浏览器里 `biji.ddmaster.com` 的登录态，只用于请求这一条笔记，不写入仓库、不打印、不保存 token。
2. 用户手动从得到大脑导出或复制三块内容：智能总结、文字记录、课堂资料，然后我基于这些原文做完整拆解。

## 执行结果

已按方案 1 执行：

- 临时读取本机 Chrome 里的已登录会话，只用于请求本条 note id。
- 已抓取笔记详情、文字记录/原文、子笔记计数与课堂图片资料。
- 接口未返回需要二次 `note/decrypt` 的加密记录。
- 未保存浏览器 token、refresh token、device id。
- 原始 JSON 中的媒体临时签名 URL 已脱敏；课堂图片已下载为本地副本用于复核。

## 产物清单

本目录已落以下文件：

- `raw-note-detail.json`：接口原始笔记详情，脱敏保存。
- `raw-original.json`：文字记录/课堂资料原始结构，脱敏保存。
- `normalized-materials.md`：把智能总结、文字记录、课堂资料拆成可读 Markdown。
- `class-materials/images/`：课堂图片本地副本。
- `class-materials/ocr-combined.md`：课堂图片 OCR 辅助结果。
- `2026-06-15-洋哥商业心法-术法道器势拆解.md`：最终“术法道器势”学习复盘。

最终复盘应遵循本仓库 `skills/miaoji-decon/SKILL.md` 的结构，不写流水账，重点回答：

- 这堂课/这条笔记真正能学什么。
- 哪些是“道”：底层判断和方向。
- 哪些是“法”：稳定原则和可迁移方法。
- 哪些是“术”：可直接照做的步骤。
- 哪些是“器”：工具、材料、模板、资产。
- 哪些是“势”：时机、趋势、外部环境与窗口。
- 读完 7 天内应该验证哪个动作。
