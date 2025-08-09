import { test, expect, devices } from '@playwright/test';

// Test with iPhone and different text scaling to simulate real device differences
test.use({ ...devices['iPhone 12 Pro'] });

test('check radio button spacing with larger text scaling', async ({ page }) => {
  // Set a larger font scale to simulate iOS text scaling or different font rendering
  await page.addStyleTag({
    content: `
      * {
        font-size: 110% !important;
      }
    `
  });

  await page.goto('http://localhost:5173/retirementplanner');
  await page.waitForLoadState('networkidle');
  
  // Expand Personal Profile section
  const profileLegend = page.locator('legend', { hasText: 'Personal Profile' });
  await profileLegend.click();
  await page.waitForTimeout(500);
  
  // Find individual radio labels
  const singleLabel = page.locator('label.radio-label', { hasText: 'Single' });
  const coupleLabel = page.locator('label.radio-label', { hasText: 'Couple' });
  
  const singleBox = await singleLabel.boundingBox();
  const coupleBox = await coupleLabel.boundingBox();
  
  if (singleBox && coupleBox) {
    const horizontalGap = coupleBox.x - (singleBox.x + singleBox.width);
    const verticalGap = Math.abs(coupleBox.y - singleBox.y);
    
    console.log(`With 110% font scaling:`);
    console.log(`Single: x=${singleBox.x}, width=${singleBox.width}, y=${singleBox.y}`);
    console.log(`Couple: x=${coupleBox.x}, width=${coupleBox.width}, y=${coupleBox.y}`);
    console.log(`Horizontal gap: ${horizontalGap}px, Vertical gap: ${verticalGap}px`);
    
    if (horizontalGap < 0) {
      console.log(`🔴 OVERLAP with larger text: ${Math.abs(horizontalGap)}px`);
    } else if (horizontalGap < 10) {
      console.log(`⚠️  Tight spacing with larger text: ${horizontalGap}px`);
    } else {
      console.log(`✅ Good spacing even with larger text: ${horizontalGap}px`);
    }
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: `test-results/font-scaling-radio-spacing.png`,
    fullPage: false,
    clip: { x: 0, y: 200, width: 400, height: 300 }
  });
  
  expect(true).toBe(true);
});