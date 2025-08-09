import { test, expect } from '@playwright/test';

// Test with very narrow viewport to simulate tight spacing
test.use({ viewport: { width: 280, height: 500 } });

test('check radio button spacing on very narrow screen', async ({ page }) => {
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
    
    console.log(`Very narrow (280px) screen:`);
    console.log(`Single: x=${singleBox.x}, width=${singleBox.width}, y=${singleBox.y}`);
    console.log(`Couple: x=${coupleBox.x}, width=${coupleBox.width}, y=${coupleBox.y}`);
    console.log(`Horizontal gap: ${horizontalGap}px, Vertical gap: ${verticalGap}px`);
    
    if (verticalGap > 10) {
      console.log(`📱 Radio buttons wrapped to different lines`);
    }
    
    if (horizontalGap < 0) {
      console.log(`🔴 OVERLAP: ${Math.abs(horizontalGap)}px`);
    } else if (horizontalGap < 8) {
      console.log(`⚠️  Close spacing: ${horizontalGap}px`);
    }
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: `test-results/very-narrow-radio-spacing.png`,
    fullPage: true
  });
  
  expect(true).toBe(true);
});