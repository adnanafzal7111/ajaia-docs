const { chromium } = require('playwright');
const fs = require('fs');
const SCREENSHOTS = '/home/adnan/.gemini/antigravity-cli/brain/47a57196-6a53-4c3b-9951-b7dcafaf54d6/screenshots';

if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS, { recursive: true });

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  console.log('1. Login page');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOTS}/01_login.png` });

  console.log('2. Login as Alice');
  await page.click('button:has-text("alice@ajaia.com")');
  await page.waitForTimeout(200);
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOTS}/02_dashboard.png` });

  console.log('3. Create doc');
  await page.click('button:has-text("New Document")');
  await page.waitForURL('**/doc/**');
  await page.waitForTimeout(1500);
  
  console.log('4. Edit doc');
  await page.fill('input[placeholder="Document title"]', 'Q3 Roadmap');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  
  await page.click('.ProseMirror');
  await page.type('.ProseMirror', 'This is a test document created by Alice.');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOTS}/03_editor.png` });

  console.log('5. Share with Bob');
  await page.click('button:has-text("Share")');
  await page.waitForTimeout(500);
  await page.fill('input[type="email"]', 'bob@ajaia.com');
  await page.click('button:has-text("Share"):not([disabled])');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOTS}/04_shared.png` });

  console.log('6. Logout and login as Bob');
  await page.click('button:has-text("Sign out")');
  await page.waitForURL('**/login');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("bob@ajaia.com")');
  await page.waitForTimeout(200);
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOTS}/05_bob_dashboard.png` });

  console.log('7. View shared doc as Bob');
  await page.click('text=Q3 Roadmap');
  await page.waitForURL('**/doc/**');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOTS}/06_bob_editor.png` });

  await browser.close();
  console.log('Done!');
}
run().catch(console.error);
