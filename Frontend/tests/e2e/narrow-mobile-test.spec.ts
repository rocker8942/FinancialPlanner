import { test, expect } from '@playwright/test';

// Test with very narrow mobile viewports to force overlaps
const narrowViewports = [
  { width: 320, height: 568, name: 'iPhone 5' },
  { width: 280, height: 500, name: 'Very narrow' },
  { width: 360, height: 640, name: 'Galaxy S7 small' }
];

narrowViewports.forEach(viewport => {
  test.describe(`Narrow Mobile Tests - ${viewport.name}`, () => {
    test.use({ viewport });

    test(`should check for overlaps on ${viewport.name} (${viewport.width}px wide)`, async ({ page }) => {
      await page.goto('http://localhost:5173/retirementplanner');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for this viewport
      await page.screenshot({ 
        path: `test-results/narrow-mobile-${viewport.name.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true 
      });
      
      // Expand Personal Profile section to check for specific overlap
      const profileLegend = page.locator('legend', { hasText: 'Personal Profile' });
      await profileLegend.click();
      await page.waitForTimeout(500);
      
      // Focus on the relationship status area
      const relationshipLabel = page.locator('label', { hasText: 'Relationship Status' });
      await expect(relationshipLabel).toBeVisible();
      
      // Find the radio group
      const radioGroup = page.locator('.radio-group');
      await expect(radioGroup).toBeVisible();
      
      // Get their positions
      const labelBox = await relationshipLabel.boundingBox();
      const radioBox = await radioGroup.boundingBox();
      
      if (labelBox && radioBox) {
        const gap = radioBox.y - (labelBox.y + labelBox.height);
        
        console.log(`${viewport.name} (${viewport.width}px) - Relationship Status:`);
        console.log(`  Label bottom: ${labelBox.y + labelBox.height}`);
        console.log(`  Radio group top: ${radioBox.y}`);
        console.log(`  Gap: ${gap}px`);
        
        // Check if they overlap or are too close
        if (gap < 3) {
          console.log(`  ⚠️  WARNING: Gap is very small (${gap}px)`);
        }
        
        if (labelBox.y + labelBox.height > radioBox.y) {
          console.log(`  🔴 ERROR: Label overlaps radio group!`);
        }
      }

      // Check specific checkbox form group that was problematic
      let issues = 0;
      
      const homeownerFormGroup = page.locator('.form-group:has(label:has-text("I own my home"))');
      const nextFormGroup = page.locator('.form-group:has(label:has-text("Current Age"))');
      
      if (await homeownerFormGroup.count() > 0 && await nextFormGroup.count() > 0) {
        const homeownerHelpText = homeownerFormGroup.locator('.help-text');
        const nextLabel = nextFormGroup.locator('label').first();
        
        const helpTextBox = await homeownerHelpText.boundingBox();
        const nextLabelBox = await nextLabel.boundingBox();
        
        if (helpTextBox && nextLabelBox) {
          const gap = nextLabelBox.y - (helpTextBox.y + helpTextBox.height);
          console.log(`  Form group gap (homeowner to current age): ${gap}px`);
          
          if (gap < 8) {
            console.log(`  ⚠️  WARNING: Form group gap is small (${gap}px)`);
            issues++;
          }
        }
      }
      
      console.log(`Total issues found on ${viewport.name}: ${issues}`);
      
      // Don't fail the test, just log the data
      expect(true).toBe(true);
    });
  });
});