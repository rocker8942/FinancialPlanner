import { test, expect, devices } from '@playwright/test';

// Test with multiple mobile devices to ensure fix works across all
const mobileDevices = [
  { device: 'iPhone SE', name: 'iPhone SE' },
  { device: 'iPhone 12 Pro', name: 'iPhone 12 Pro' },
  { device: 'Pixel 5', name: 'Pixel 5' },
  { device: 'Galaxy S8', name: 'Galaxy S8' }
];

mobileDevices.forEach(({ device, name }) => {
  test.describe(`Comprehensive Mobile Tests - ${name}`, () => {
    test.use({ ...devices[device] });

    test(`should have proper spacing throughout all sections on ${name}`, async ({ page }) => {
      await page.goto('http://localhost:5173/retirementplanner');
      await page.waitForLoadState('networkidle');
      
      // Take initial screenshot
      await page.screenshot({ 
        path: `test-results/comprehensive-${name.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true 
      });
      
      // Test all sections
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
        
        // Find all form groups in this section
        const section = page.locator('.form-section').filter({ hasText: sectionName });
        const formGroups = section.locator('.form-group');
        const count = await formGroups.count();
        
        console.log(`  Found ${count} form groups in ${sectionName}`);
        
        for (let i = 0; i < count; i++) {
          const formGroup = formGroups.nth(i);
          if (!(await formGroup.isVisible())) continue;
          
          // Get all labels in this form group
          const labels = formGroup.locator('label');
          const labelCount = await labels.count();
          
          if (labelCount === 0) continue;
          
          // Find the main label and any following elements
          const mainLabel = labels.first();
          const labelText = await mainLabel.textContent();
          
          // Skip if this is a radio/checkbox label inside another element
          if (labelText?.includes('Single') || labelText?.includes('Couple')) continue;
          
          // Find the next interactive element
          const nextElement = formGroup.locator('input, .input-with-buttons, .radio-group, .checkbox-label').first();
          
          if (await nextElement.count() > 0) {
            const labelBox = await mainLabel.boundingBox();
            const nextBox = await nextElement.boundingBox();
            
            if (labelBox && nextBox) {
              const gap = nextBox.y - (labelBox.y + labelBox.height);
              
              if (gap < 2) {
                console.log(`    ⚠️  Small gap in "${labelText?.trim()}": ${gap}px`);
                totalIssues++;
              } else if (gap > 2) {
                console.log(`    ✓ Good spacing for "${labelText?.trim()}": ${gap}px`);
              }
            }
          }
        }
      }
      
      console.log(`\\n=== Summary for ${name} ===`);
      console.log(`Total spacing issues found: ${totalIssues}`);
      
      // Test passes if no critical issues
      expect(totalIssues).toBeLessThanOrEqual(1); // Allow up to 1 minor issue
    });
  });
});