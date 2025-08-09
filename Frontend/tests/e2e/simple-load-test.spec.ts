import { test, expect } from '@playwright/test';

test('simple page load test', async ({ page }) => {
  await page.goto('http://localhost:5173/retirementplanner');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot to see what's happening
  await page.screenshot({ 
    path: `test-results/simple-load-test.png`,
    fullPage: true 
  });
  
  // Check if page loaded
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for basic elements
  const legends = await page.locator('legend').count();
  console.log('Legends found:', legends);
  
  const forms = await page.locator('form').count(); 
  console.log('Forms found:', forms);
  
  expect(title).toContain('Retirement');
});