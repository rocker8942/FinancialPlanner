import { test, expect, devices } from '@playwright/test';

// Test with iPhone SE as representative narrow mobile device
test.use({ ...devices['iPhone SE'] });

test('comprehensive mobile spacing check', async ({ page }) => {
  await page.goto('http://localhost:5173/retirementplanner');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of the fixed layout
  await page.screenshot({ 
    path: `test-results/final-mobile-layout.png`,
    fullPage: true 
  });
  
  // Test all sections for proper spacing
  const sections = [
    'Personal Profile',
    'Assets', 
    'Income and Expenses',
    'Advanced Options'
  ];
  
  let totalIssues = 0;
  
  for (const sectionName of sections) {
    console.log(`\\n=== Testing ${sectionName} Section ===`);
    
    const sectionLegend = page.locator('legend', { hasText: sectionName });
    await sectionLegend.click();
    await page.waitForTimeout(500);
    
    // Check specific known problem areas:
    
    // 1. Relationship Status -> Radio buttons
    if (sectionName === 'Personal Profile') {
      const relationshipLabel = page.locator('label', { hasText: 'Relationship Status' });
      const radioGroup = page.locator('.radio-group');
      
      if (await relationshipLabel.count() > 0 && await radioGroup.count() > 0) {
        const labelBox = await relationshipLabel.boundingBox();
        const radioBox = await radioGroup.boundingBox();
        
        if (labelBox && radioBox) {
          const gap = radioBox.y - (labelBox.y + labelBox.height);
          console.log(`  Relationship Status -> Radio group: ${gap}px`);
          
          if (gap < 5) {
            console.log(`    ⚠️  Issue: gap too small`);
            totalIssues++;
          }
        }
      }
      
      // 2. Checkbox "I own my home" -> Next form group
      const homeownerFormGroup = page.locator('.form-group:has(label:has-text("I own my home"))');
      const nextFormGroup = page.locator('.form-group:has(label:has-text("Current Age"))');
      
      if (await homeownerFormGroup.count() > 0 && await nextFormGroup.count() > 0) {
        const homeownerHelpText = homeownerFormGroup.locator('.help-text');
        const nextLabel = nextFormGroup.locator('label').first();
        
        const helpTextBox = await homeownerHelpText.boundingBox();
        const nextLabelBox = await nextLabel.boundingBox();
        
        if (helpTextBox && nextLabelBox) {
          const gap = nextLabelBox.y - (helpTextBox.y + helpTextBox.height);
          console.log(`  Homeowner form group -> Current Age: ${gap}px`);
          
          if (gap < 8) {
            console.log(`    ⚠️  Issue: gap too small`);
            totalIssues++;
          }
        }
      }
    }
  }
  
  console.log(`\\n=== Final Results ===`);
  console.log(`Total spacing issues found: ${totalIssues}`);
  
  // The fix should result in zero issues
  expect(totalIssues).toBe(0);
});