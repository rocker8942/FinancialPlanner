import { test, expect, devices } from '@playwright/test';

// Test with iPhone SE (small screen) to catch overlap issues
test.use({ ...devices['iPhone SE'] });

test.describe('Mobile Label Overlap Tests', () => {
  test('should not have overlapping labels and inputs on mobile', async ({ page }) => {
    await page.goto('http://localhost:5173/retirementplanner');
    await page.waitForLoadState('networkidle');
    
    // Expand all sections to check all input fields
    const sections = ['Personal Profile', 'Assets', 'Income and Expenses', 'Advanced Options'];
    
    for (const sectionName of sections) {
      const sectionLegend = page.locator('legend', { hasText: sectionName });
      if (await sectionLegend.isVisible()) {
        await sectionLegend.click();
        await page.waitForTimeout(300);
      }
    }

    // Get all form groups that contain labels and inputs
    const formGroups = page.locator('.form-group');
    const formGroupCount = await formGroups.count();
    
    const overlaps = [];
    
    for (let i = 0; i < formGroupCount; i++) {
      const formGroup = formGroups.nth(i);
      const isVisible = await formGroup.isVisible();
      
      if (!isVisible) continue;
      
      // Get the label in this form group
      const label = formGroup.locator('label').first();
      const labelExists = await label.count() > 0;
      
      if (!labelExists) continue;
      
      // Get the next selectable element (input, select, etc.)
      const nextInput = formGroup.locator('input, select, .input-with-buttons, .radio-group, .checkbox-label').first();
      const inputExists = await nextInput.count() > 0;
      
      if (!inputExists) continue;
      
      // Get bounding boxes
      const labelBox = await label.boundingBox();
      const inputBox = await nextInput.boundingBox();
      
      if (labelBox && inputBox) {
        // Check if label overlaps with input (label bottom > input top)
        const isOverlapping = labelBox.y + labelBox.height > inputBox.y;
        const gap = inputBox.y - (labelBox.y + labelBox.height);
        
        // Get identifying information
        const labelText = await label.textContent();
        const inputId = await nextInput.getAttribute('id') || await nextInput.getAttribute('class') || 'unknown';
        
        if (isOverlapping || gap < 2) { // Consider less than 2px gap as problematic
          overlaps.push({
            labelText: labelText?.trim(),
            inputId,
            labelBox,
            inputBox,
            gap,
            isOverlapping
          });
          
          console.log(`Overlap detected in form group ${i}:`);
          console.log(`  Label: "${labelText?.trim()}" at y=${labelBox.y}, height=${labelBox.height}, bottom=${labelBox.y + labelBox.height}`);
          console.log(`  Input: "${inputId}" at y=${inputBox.y}, height=${inputBox.height}`);
          console.log(`  Gap: ${gap}px, Overlapping: ${isOverlapping}`);
        }
      }
    }
    
    // Take screenshot if overlaps found
    if (overlaps.length > 0) {
      await page.screenshot({ 
        path: `test-results/label-overlap-mobile.png`,
        fullPage: true 
      });
      
      console.log(`Found ${overlaps.length} label/input overlaps on mobile`);
      overlaps.forEach(overlap => {
        console.log(`- "${overlap.labelText}" overlaps with "${overlap.inputId}" (gap: ${overlap.gap}px)`);
      });
    }
    
    // Assert no overlaps
    console.log(`Total overlaps found: ${overlaps.length}`);
    expect(overlaps.length).toBe(0);
  });

  test('should check specific radio button spacing on mobile', async ({ page }) => {
    await page.goto('http://localhost:5173/retirementplanner');
    await page.waitForLoadState('networkidle');
    
    // Expand Personal Profile section
    const profileLegend = page.locator('legend', { hasText: 'Personal Profile' });
    await profileLegend.click();
    await page.waitForTimeout(300);
    
    // Find the "Relationship Status" label
    const relationshipLabel = page.locator('label', { hasText: 'Relationship Status' });
    await expect(relationshipLabel).toBeVisible();
    
    // Find the radio group below it
    const radioGroup = page.locator('.radio-group');
    await expect(radioGroup).toBeVisible();
    
    // Get their positions
    const labelBox = await relationshipLabel.boundingBox();
    const radioBox = await radioGroup.boundingBox();
    
    if (labelBox && radioBox) {
      const gap = radioBox.y - (labelBox.y + labelBox.height);
      
      console.log(`Relationship Status label bottom: ${labelBox.y + labelBox.height}`);
      console.log(`Radio group top: ${radioBox.y}`);
      console.log(`Gap: ${gap}px`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/relationship-status-mobile.png`,
        fullPage: false 
      });
      
      // Should have reasonable gap (at least 5px)
      expect(gap).toBeGreaterThanOrEqual(5);
    }
  });
});