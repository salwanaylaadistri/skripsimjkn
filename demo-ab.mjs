import { chromium } from "playwright";
import { writeFileSync } from "fs";

const SCRATCHPAD = "C:/Users/Lenovo/AppData/Local/Temp/claude/c--Users-Lenovo-Documents-skripsimjkn/837f9f72-d81d-4cfe-8d24-6c9de07de7c3/scratchpad";
const BASE = "http://localhost:3000";

async function screenshot(page, name) {
  await page.screenshot({ path: `${SCRATCHPAD}/${name}.png`, fullPage: false });
  console.log(`[SS] ${name}`);
}

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await screenshot(page, "00-login");
  // Isi NIK dan nama
  const inputs = page.locator("input");
  const count = await inputs.count();
  console.log("Input count:", count);
  if (count >= 1) await inputs.nth(0).fill("3273012345678901");
  if (count >= 2) await inputs.nth(1).fill("Demo Partisipan");
  await screenshot(page, "01-login-filled");
  // Klik tombol submit
  const btn = page.locator("button[type=submit], button").filter({ hasText: /masuk|login|daftar|lanjut/i }).first();
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForLoadState("networkidle");
  }
  await screenshot(page, "02-after-login");
}

async function runGrup(grupLabel, url) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  console.log(`\n=== GRUP ${grupLabel} ===`);

  // Langkah 1: Reset sesi
  await page.goto(url);
  await page.waitForTimeout(2500); // tunggu redirect
  await screenshot(page, `${grupLabel}-01-setelah-reset`);
  console.log("URL setelah redirect:", page.url());

  // Langkah 2: Login
  await login(page);

  // Langkah 3: Beranda
  const currentUrl = page.url();
  if (!currentUrl.includes("localhost:3000/") || currentUrl.includes("login") || currentUrl.includes("daftar")) {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(1000);
  await screenshot(page, `${grupLabel}-02-beranda`);

  // Langkah 4: Cek main card
  const mainCard = page.locator("h2").first();
  const cardText = await mainCard.textContent().catch(() => "-");
  console.log("Main card:", cardText);

  // Langkah 5: Cek adaptive flag di sessionStorage
  const adaptiveFlag = await page.evaluate(() => sessionStorage.getItem("jkn_adaptive"));
  console.log("jkn_adaptive di sessionStorage:", adaptiveFlag);

  // Langkah 6: Buka halaman Antrean
  await page.goto(`${BASE}/antrean`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await screenshot(page, `${grupLabel}-03-antrean`);

  await browser.close();
}

(async () => {
  await runGrup("A", `${BASE}/ab-reset?grup=A`);
  await runGrup("B", `${BASE}/ab-reset?grup=B`);
  console.log("\nDone. Cek screenshots di scratchpad.");
})();
