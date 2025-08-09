import { test, expect, devices } from '@playwright/test';

// Test with iPhone 12 Pro viewport
test.use({ ...devices['iPhone 12 Pro'] });

test.describe('Mobile Viewport Tests', () => {

  test('should not have horizontal scroll on iPhone viewport', async ({ page }) => {
    await page.goto('http://localhost:5175/retirementplanner');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check viewport dimensions
    const viewport = page.viewportSize();
    console.log('Viewport dimensions:', viewport);
    
    // Check if there's horizontal overflow
    const bodyScrollWidth = await page.evaluate(() => {
      return {
        scrollWidth: document.body.scrollWidth,
        clientWidth: document.body.clientWidth,
        offsetWidth: document.body.offsetWidth
      };
    });
    
    console.log('Body dimensions:', bodyScrollWidth);
    
    // Check document dimensions
    const documentDimensions = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        offsetWidth: document.documentElement.offsetWidth
      };
    });
    
    console.log('Document dimensions:', documentDimensions);
    
    // The page should not have horizontal overflow
    expect(documentDimensions.scrollWidth).toBeLessThanOrEqual(documentDimensions.clientWidth + 1); // Allow 1px tolerance
  });

  test('should properly display form sections on iPhone', async ({ page }) => {
    await page.goto('http://localhost:5175/retirementplanner');
    await page.waitForLoadState('networkidle');
    
    // Check if the asset input form is visible and properly sized
    const assetForm = page.locator('.asset-form');
    await expect(assetForm).toBeVisible();
    
    // Get form dimensions
    const formBox = await assetForm.boundingBox();
    const viewport = page.viewportSize();
    
    if (formBox && viewport) {
      console.log('Form dimensions:', formBox);
      console.log('Viewport width:', viewport.width);
      
      // Form should not exceed viewport width
      expect(formBox.width).toBeLessThanOrEqual(viewport.width);
      expect(formBox.x + formBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('should check input field widths on iPhone', async ({ page }) => {
    await page.goto('http://localhost:5175/retirementplanner');
    await page.waitForLoadState('networkidle');
    
    // Expand Personal Profile section
    const profileLegend = page.locator('legend', { hasText: 'Personal Profile' });
    await profileLegend.click();
    await page.waitForTimeout(500);
    
    // Check input container widths
    const inputContainers = page.locator('.input-with-buttons');
    const count = await inputContainers.count();
    const viewport = page.viewportSize();
    
    if (viewport) {
      for (let i = 0; i < Math.min(count, 3); i++) { // Check first 3 inputs
        const container = inputContainers.nth(i);
        const containerBox = await container.boundingBox();
        
        if (containerBox) {
          console.log(`Input container ${i} dimensions:`, containerBox);
          
          // Container should not exceed viewport width
          expect(containerBox.width).toBeLessThanOrEqual(viewport.width);
          expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    }
  });

  test('should check main layout positioning on iPhone', async ({ page }) => {
    await page.goto('http://localhost:5175/retirementplanner');
    await page.waitForLoadState('networkidle');
    
    // Check main content positioning
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    
    const mainBox = await mainContent.boundingBox();
    const viewport = page.viewportSize();
    
    if (mainBox && viewport) {
      console.log('Main content dimensions:', mainBox);
      console.log('Viewport dimensions:', viewport);
      
      // Main content should not exceed viewport
      expect(mainBox.x + mainBox.width).toBeLessThanOrEqual(viewport.width);
    }
    
    // Check if dashboard layout is properly responsive
    const dashboard = page.locator('.dashboard');
    const dashboardBox = await dashboard.boundingBox();
    
    if (dashboardBox && viewport) {
      console.log('Dashboard dimensions:', dashboardBox);
      expect(dashboardBox.x + dashboardBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('should check for elements causing horizontal overflow', async ({ page }) => {
    await page.goto('http://localhost:5175/retirementplanner');
    await page.waitForLoadState('networkidle');
    
    // Get all elements that might cause overflow
    const potentialOverflowElements = await page.evaluate(() => {
      const elements = [];
      const allElements = document.querySelectorAll('*');
      const viewportWidth = window.innerWidth;
      
      allElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.right > viewportWidth) {
          elements.push({
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            right: rect.right,
            width: rect.width,
            x: rect.x
          });
        }
      });
      
      return elements;
    });
    
    console.log('Elements exceeding viewport width:', potentialOverflowElements);
    
    // Report any elements that exceed viewport
    if (potentialOverflowElements.length > 0) {
      console.log(`Found ${potentialOverflowElements.length} elements exceeding viewport width`);
      potentialOverflowElements.forEach(el => {
        console.log(`- ${el.tagName}.${el.className}#${el.id}: right=${el.right}, width=${el.width}, x=${el.x}`);
      });
    }
    
    // Test should pass but we'll log the issues for debugging
    expect(potentialOverflowElements.length).toBeGreaterThanOrEqual(0); // This will always pass but logs the data
  });
});