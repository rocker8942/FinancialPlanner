import { test, expect, devices } from '@playwright/test';

// Test with iPhone SE to simulate mobile viewport
test.use({ ...devices['iPhone SE'] });

test('debug mobile page structure', async ({ page }) => {
  await page.goto('http://localhost:5173/retirementplanner');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot to see the current page
  await page.screenshot({ 
    path: `test-results/debug-mobile-full-page.png`,
    fullPage: true 
  });
  
  // Log page title and URL
  const title = await page.title();
  const url = page.url();
  console.log(`Page title: "${title}"`);
  console.log(`Page URL: ${url}`);
  
  // Get the HTML content to see what's actually on the page
  const bodyText = await page.locator('body').textContent();
  console.log('Body text content:', bodyText?.substring(0, 500));
  
  // Check for different possible selectors
  const allForms = await page.locator('form').all();
  console.log(`Found ${allForms.length} form elements`);
  
  const allInputs = await page.locator('input').all();
  console.log(`Found ${allInputs.length} input elements`);
  
  // Check for form sections and elements specifically
  const legends = await page.locator('legend').all();
  console.log(`Found ${legends.length} legend elements`);
  for (let i = 0; i < legends.length; i++) {
    const text = await legends[i].textContent();
    console.log(`  Legend ${i}: "${text}"`);
  }
  
  // Check for asset form
  const assetForm = page.locator('.asset-form');
  const isAssetFormVisible = await assetForm.isVisible();
  console.log(`Asset form is visible: ${isAssetFormVisible}`);
  
  // Check for router links
  const routerLinks = await page.locator('a[href*="/"]').all();
  console.log(`Found ${routerLinks.length} router links`);
  
  // Try to find main content area
  const mainElements = await page.locator('main').all();
  console.log(`Found ${mainElements.length} main elements`);
  
  // Test should pass
  expect(true).toBe(true);
});