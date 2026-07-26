const path = require("path");
const { chromium } = require(path.join(__dirname, "node_modules/playwright-core"));

const HTML = "file://" + path.join(__dirname, "doc.html");
const OUT_PDF = path.join(__dirname, "..", "The_Manor_Hotel_CRM_System_Documentation.pdf");

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome-stable", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto(HTML, { waitUntil: "networkidle" });

  const blockCount = await page.locator("pre.mermaid, div.mermaid").count();
  console.log("mermaid blocks found:", blockCount);
  if (blockCount === 0) {
    throw new Error("No .mermaid blocks found in the DOM — renderer override didn't produce them.");
  }

  // wait for mermaid to finish turning each block into an <svg>
  await page.waitForFunction((expected) => {
    const blocks = document.querySelectorAll("pre.mermaid, div.mermaid");
    return blocks.length === expected && Array.from(blocks).every((b) => b.querySelector("svg"));
  }, blockCount, { timeout: 30000 });
  await page.waitForTimeout(500);

  await page.pdf({
    path: OUT_PDF,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "18mm", left: "16mm", right: "16mm" }
  });

  console.log(JSON.stringify({ errors, out: OUT_PDF }));
  await browser.close();
})().catch((err) => { console.error("FAILED", err); process.exit(1); });
