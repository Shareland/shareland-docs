#!/usr/bin/env node
/**
 * Shareland Docs — Screenshot Updater
 * 
 * Takes screenshots of key exchange screens and saves them to /images/screenshots/
 * Run manually once a demo URL is available: node scripts/update-screenshots.js
 * 
 * Requires: playwright (npm install playwright)
 * 
 * TODO: Update DEMO_BASE_URL once Darian/Eric set up the demo bypass parameter
 * e.g. https://share.land/?demo=true
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// TODO: replace with real demo URL once available
const DEMO_BASE_URL = 'https://share.land/?demo=true';

const OUTPUT_DIR = path.join(__dirname, '../images/screenshots');

const SCREENS = [
  {
    name: 'markets',
    url: DEMO_BASE_URL,
    description: 'Exchange home — market list',
  },
  {
    name: 'market-detail',
    url: `${DEMO_BASE_URL}&market=los-angeles`,
    description: 'Market detail view — price chart, trade panel',
  },
  {
    name: 'portfolio',
    url: `${DEMO_BASE_URL}&view=portfolio`,
    description: 'Portfolio dashboard — positions and P&L',
  },
  {
    name: 'buy-flow',
    url: `${DEMO_BASE_URL}&market=los-angeles&action=buy`,
    description: 'Buy flow — token purchase',
  },
];

async function captureScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  console.log(`Capturing ${SCREENS.length} screenshots...`);

  for (const screen of SCREENS) {
    try {
      const page = await context.newPage();
      await page.goto(screen.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const outPath = path.join(OUTPUT_DIR, `${screen.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  ✅ ${screen.name} → ${outPath}`);
      await page.close();
    } catch (err) {
      console.error(`  ❌ ${screen.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\nDone. Commit images/screenshots/ to update docs.');
}

captureScreenshots().catch(console.error);
