# Regenerating the System Documentation PDF

`docs/The_Manor_Hotel_CRM_System_Documentation.pdf` is generated from
`docs/SYSTEM_DOCUMENTATION.md`. After editing that markdown file, regenerate the PDF with:

```bash
cd docs/pdf-export
npm install
npm run build
```

This writes the updated PDF to `docs/The_Manor_Hotel_CRM_System_Documentation.pdf`.

## How it works

- `build.js` converts the markdown to a styled, print-ready HTML file (`doc.html`), with a title
  page and Mermaid diagram blocks (` ```mermaid ` fences) turned into `<pre class="mermaid">`
  elements for the Mermaid.js library (loaded from a CDN) to render client-side.
- `render.js` opens that HTML file in headless Chrome (via `playwright-core`), waits for every
  Mermaid diagram to finish rendering to an SVG, then prints the page to PDF.

## Requirements

- Google Chrome installed at `/usr/bin/google-chrome-stable` (edit the `executablePath` in
  `render.js` if yours lives elsewhere, or install the `chromium` package that ships with
  Playwright instead: `npx playwright install chromium` and drop the `executablePath` option).
- Internet access (to load `mermaid.js` and `marked` from npm/CDN — no local install needed
  beyond the two npm dependencies above).

## Gotcha

Mermaid's sequence-diagram parser treats a bare `;` inside a message as a statement terminator,
not literal punctuation — if a diagram silently fails with "Syntax error in text" in the PDF,
check the corresponding ` ```mermaid ` block in `SYSTEM_DOCUMENTATION.md` for stray semicolons in
message text and replace them with a comma or "then".
