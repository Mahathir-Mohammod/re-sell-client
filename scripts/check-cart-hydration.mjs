// Regression test for "the cart page is stuck on its loading skeleton".
//
// Root cause: the cart page rendered `!hydrated ? skeleton : …` while CartProvider
// never exposed `hydrated`, so it stayed undefined and the skeleton never cleared.
// Compiling was not enough to catch it — this drives a real browser.
//
// Usage: with the dev server running, `node scripts/check-cart-hydration.mjs`
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const executablePath = CANDIDATES.find((candidate) => fs.existsSync(candidate));

const ITEM = {
  productId: "64b00000000000000000beef",
  slug: "integration-test-lamp",
  title: "Integration Test Lamp",
  price: 42,
  image: null,
  stock: 3,
  sellerId: "64b00000000000000000cafe",
  sellerName: "Test Seller",
  quantity: 1,
};

let failures = 0;
const check = (label, ok, extra = "") => {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}${extra ? ` (${extra})` : ""}`);
  if (!ok) failures += 1;
};

if (!executablePath) {
  console.error("No Chromium-based browser found. Tried:\n  " + CANDIDATES.join("\n  "));
  process.exit(1);
}

const browser = await puppeteer.launch({ executablePath, headless: "new", args: ["--no-sandbox"] });

async function cartState(cart) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  // seed the cart exactly the way CartProvider does, then reload the route
  await page.evaluate((json) => window.localStorage.setItem("resell-cart", json), JSON.stringify(cart));
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle2" });
  // the bug rendered this skeleton forever, so wait past hydration
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const state = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      skeleton: document.querySelectorAll(".animate-pulse.rounded-2xl").length,
      empty: text.includes("Your cart is empty"),
      item: text.includes("Integration Test Lamp"),
      quantity: /\(1\)/.test(text),
    };
  });
  await page.close();
  return state;
}

try {
  console.log("1. an empty cart shows the empty state, not a skeleton");
  const empty = await cartState([]);
  check("skeleton is gone", empty.skeleton === 0, `found ${empty.skeleton}`);
  check("empty state is visible", empty.empty);

  console.log("2. a saved item renders after hydration");
  const filled = await cartState([ITEM]);
  check("skeleton is gone", filled.skeleton === 0, `found ${filled.skeleton}`);
  check("the saved item is listed", filled.item);
  check("the item count is shown", filled.quantity);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\ncart hydration verified" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
