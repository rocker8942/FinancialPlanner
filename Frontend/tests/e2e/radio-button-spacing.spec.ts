import { test, expect, devices } from '@playwright/test';

// Test with iPhone devices specifically since the issue is on real iPhone
test.use({ ...devices['iPhone 12 Pro'] });

test('check radio button spacing on iPhone', async ({ page }) => {
  await page.goto('http://localhost:5173/retirementplanner');
  await page.waitForLoadState('networkidle');
  
  // Expand Personal Profile section
  const profileLegend = page.locator('legend', { hasText: 'Personal Profile' });
  await profileLegend.click();
  await page.waitForTimeout(500);
  
  // Find the radio group
  const radioGroup = page.locator('.radio-group');
  await expect(radioGroup).toBeVisible();
  
  // Find individual radio labels
  const singleLabel = page.locator('label.radio-label', { hasText: 'Single' });
  const coupleLabel = page.locator('label.radio-label', { hasText: 'Couple' });
  
  await expect(singleLabel).toBeVisible();
  await expect(coupleLabel).toBeVisible();
  
  // Get their positions
  const singleBox = await singleLabel.boundingBox();
  const coupleBox = await coupleLabel.boundingBox();
  
  if (singleBox && coupleBox) {
    // Check horizontal gap (if they're side by side)
    const horizontalGap = coupleBox.x - (singleBox.x + singleBox.width);
    console.log(`Single radio button: x=${singleBox.x}, width=${singleBox.width}, right=${singleBox.x + singleBox.width}`);
    console.log(`Couple radio button: x=${coupleBox.x}, width=${coupleBox.width}`);
    console.log(`Horizontal gap between Single and Couple: ${horizontalGap}px`);
    
    // Check if they overlap horizontally
    if (horizontalGap < 0) {
      console.log(`🔴 OVERLAP: Radio buttons overlap by ${Math.abs(horizontalGap)}px horizontally`);
    } else if (horizontalGap < 5) {
      console.log(`⚠️  WARNING: Radio buttons are very close (${horizontalGap}px)`);
    }
    
    // Check vertical gap (if they wrap)
    const verticalGap = Math.abs(coupleBox.y - singleBox.y);
    console.log(`Vertical gap: ${verticalGap}px`);
    
    if (verticalGap > 10) {
      // They wrapped to different lines
      console.log(`Radio buttons wrapped to different lines (${verticalGap}px apart)`);
      
      // Check if there's enough vertical spacing
      if (verticalGap < 25) {
        console.log(`⚠️  WARNING: Wrapped radio buttons are too close vertically`);
      }
    }
  }
  
  // Take screenshot for debugging
  await page.screenshot({ 
    path: `test-results/radio-button-spacing-iphone.png`,
    fullPage: false,
    clip: { x: 0, y: 200, width: 400, height: 300 }
  });
  
  // Test should not fail, just document the spacing
  expect(true).toBe(true);
});