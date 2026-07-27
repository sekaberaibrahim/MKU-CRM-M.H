const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const SYSTEM_DOC = "/home/ibraah/MKU-CRM-M.H/docs/SYSTEM_DOCUMENTATION.md";
const README = "/home/ibraah/MKU-CRM-M.H/README.md";
const OUT_HTML = path.join(__dirname, "doc.html");

const systemDocMd = fs
  .readFileSync(SYSTEM_DOC, "utf8")
  .replace(/^# The Manor Hotel CRM - System Documentation\s*\n/, "# Part I: System Documentation\n");

// Trim the README down to what belongs in a combined PDF: drop its own title/logo image
// (the title page already covers that) and the "Final defense support files" section, which
// only points at other files in this repo and is meaningless once exported.
let readmeMd = fs.readFileSync(README, "utf8");
readmeMd = readmeMd
  .replace(/^# The Manor Hotel CRM \(Free Stack\)\s*\n/, "")
  .replace(/^<img src="frontend\/public\/brand\/logo-wordmark-light\.jpg"[^\n]*\n/m, "")
  .replace(/## Final defense support files[\s\S]*$/, "")
  .trim();

const md =
  systemDocMd.trim() +
  "\n\n<div class=\"part-break\"></div>\n\n# Part II: Setup, Running, and Deployment Guide\n\n" +
  readmeMd +
  "\n";

const renderer = new marked.Renderer();
const originalCode = renderer.code.bind(renderer);
renderer.code = (token) => {
  const lang = (token && token.lang ? String(token.lang) : "").trim();
  if (lang === "mermaid") {
    const escaped = token.text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre class="mermaid">${escaped}</pre>`;
  }
  return originalCode(token);
};

marked.setOptions({ renderer });
const bodyHtml = marked.parse(md);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>The Manor Hotel CRM - Project Documentation & Setup Guide</title>
<script src="https://unpkg.com/mermaid@10/dist/mermaid.min.js"></script>
<style>
  @page { size: A4; margin: 20mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    color: #211f1b;
    line-height: 1.55;
    font-size: 11.5pt;
    max-width: 780px;
    margin: 0 auto;
  }
  h1, h2, h3, h4 { font-family: "Helvetica Neue", Arial, sans-serif; color: #211f1b; }
  h1 {
    font-size: 24pt;
    border-bottom: 3px solid #b8862b;
    padding-bottom: 10px;
    margin-top: 0;
  }
  h2 {
    font-size: 16pt;
    margin-top: 2.2em;
    border-bottom: 1px solid #d8cdb8;
    padding-bottom: 4px;
    page-break-after: avoid;
  }
  h3 { font-size: 13pt; margin-top: 1.6em; page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; page-break-inside: avoid; }
  th, td { border: 1px solid #d8cdb8; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f4ecdc; font-family: "Helvetica Neue", Arial, sans-serif; }
  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    background: #f4ecdc;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.92em;
  }
  pre {
    background: #211f1b;
    color: #f4ecdc;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  pre code { background: none; color: inherit; padding: 0; }
  pre.mermaid {
    background: #ffffff;
    color: inherit;
    text-align: center;
    padding: 10px 0;
    page-break-inside: avoid;
    border: 1px solid #eee;
  }
  blockquote {
    border-left: 4px solid #b8862b;
    margin: 1em 0;
    padding: 0.4em 1em;
    color: #4a463d;
    background: #faf6ee;
  }
  .titlepage {
    text-align: center;
    padding-top: 22vh;
    page-break-after: always;
  }
  .titlepage img { width: 300px; margin-bottom: 2.5em; }
  .titlepage h1 { border: none; font-size: 30pt; margin-bottom: 0.3em; }
  .titlepage .subtitle { font-size: 15pt; color: #6b6455; font-family: "Helvetica Neue", Arial, sans-serif; }
  .titlepage .meta { margin-top: 4em; font-size: 11pt; color: #6b6455; font-family: "Helvetica Neue", Arial, sans-serif; }
  .part-break { page-break-before: always; }
</style>
</head>
<body>

<div class="titlepage">
  <img src="file:///home/ibraah/MKU-CRM-M.H/frontend/public/brand/logo-square-dark.png" alt="The Manor Hotel" />
  <h1>The Manor Hotel CRM</h1>
  <div class="subtitle">Project Documentation &amp; Setup Guide</div>
  <div class="meta">
    Final Year Project - Business Information Technology<br/>
    Case Study: The Manor Hotel, Nyarutarama, Kigali, Rwanda
  </div>
</div>

${bodyHtml}

<script>
  mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
</script>
</body>
</html>
`;

fs.writeFileSync(OUT_HTML, html);
console.log("wrote", OUT_HTML);
