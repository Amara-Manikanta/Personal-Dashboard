import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(5000);

  // Print all window script tags
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline');
  });
  console.log("Scripts loaded:", scripts);
  
  // Print window components
  const components = await page.evaluate(() => {
    return {
      HomePage: !!window.HomePage,
      WritingDashboard: !!window.WritingDashboard,
      NovelsDashboard: !!window.NovelsDashboard
    };
  });
  console.log("Components loaded:", components);

  await browser.close();
})();
