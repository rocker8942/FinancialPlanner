import { test } from '@playwright/test';

test.use({ viewport: { width: 320, height: 568 } });

test('detailed debug of checkbox form group', async ({ page }) => {
  await page.goto('http://localhost:5173/retirementplanner');
  await page.waitForLoadState('networkidle');
  
  // Expand Personal Profile section
  const profileLegend = page.locator('legend', { hasText: 'Personal Profile' });
  await profileLegend.click();
  await page.waitForTimeout(500);
  
  // Find the specific checkbox form group with "I own my home"
  const homeownerFormGroup = page.locator('.form-group:has(label:has-text("I own my home"))');
  
  // Get all elements within this form group
  const label = homeownerFormGroup.locator('label.checkbox-label');
  const helpText = homeownerFormGroup.locator('.help-text');
  
  console.log('=== Checkbox Form Group Analysis ===');
  
  // Get positions of elements within the form group
  const labelBox = await label.boundingBox();
  const helpTextBox = await helpText.boundingBox();
  
  if (labelBox && helpTextBox) {
    const gap = helpTextBox.y - (labelBox.y + labelBox.height);
    console.log(`Checkbox label bottom: ${labelBox.y + labelBox.height}`);
    console.log(`Help text top: ${helpTextBox.y}`);
    console.log(`Gap between checkbox label and help text: ${gap}px`);
  }
  
  // Now find the NEXT form group
  const nextFormGroup = page.locator('.form-group:has(label:has-text("Current Age"))');
  const nextLabel = nextFormGroup.locator('label').first();
  
  const nextLabelBox = await nextLabel.boundingBox();
  
  if (helpTextBox && nextLabelBox) {
    const gap = nextLabelBox.y - (helpTextBox.y + helpTextBox.height);
    console.log(`\\nBetween form groups:`);
    console.log(`Help text bottom: ${helpTextBox.y + helpTextBox.height}`);
    console.log(`Next label ("Current Age") top: ${nextLabelBox.y}`);
    console.log(`Gap between form groups: ${gap}px`);
    
    if (gap < 5) {
      console.log(`⚠️  This gap is too small!`);
    }
  }
  
  if (labelBox && nextLabelBox) {
    const directGap = nextLabelBox.y - (labelBox.y + labelBox.height);
    console.log(`\\nDirect measurement:`);
    console.log(`Checkbox label bottom: ${labelBox.y + labelBox.height}`);
    console.log(`Next form group label top: ${nextLabelBox.y}`);
    console.log(`Direct gap: ${directGap}px`);
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: `test-results/detailed-debug-checkbox.png`,
    fullPage: false 
  });
});