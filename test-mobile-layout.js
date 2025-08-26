import { test, expect } from '@playwright/test';

test.describe('Mobile Summary Cards Layout', () => {
  test('should display summary cards with full width on iPhone', async ({ page }) => {
    // Set iPhone viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the financial planner
    await page.goto('http://localhost:5175');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Fill in some basic data to see the summary cards
    await page.fill('input[placeholder*="age" i]', '30');
    await page.fill('input[placeholder*="retirement" i]', '65');
    await page.fill('input[placeholder*="salary" i]', '80000');
    await page.fill('input[placeholder*="expense" i]', '50000');
    
    // Wait for summary cards to appear
    await page.waitForSelector('.summary-cards-container');
    
    // Take a screenshot to see the current layout
    await page.screenshot({ path: 'mobile-before.png', fullPage: true });
    
    // Check the container width
    const container = page.locator('.summary-cards-container');
    const containerBox = await container.boundingBox();
    
    // Check if cards have space on left/right (indicating they're not full width)
    const pageWidth = 375; // iPhone width
    const expectedMargin = 16; // Typical body margin on mobile
    
    console.log('Container width:', containerBox.width);
    console.log('Page width:', pageWidth);
    console.log('Expected full width (minus margins):', pageWidth - (expectedMargin * 2));
    
    // Check if container is taking full available width
    expect(containerBox.width).toBeGreaterThan(pageWidth - 40); // Allow some margin
    
    // Check individual card widths in mobile view
    const cards = page.locator('.summary-card');
    const cardCount = await cards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const cardBox = await card.boundingBox();
      console.log(`Card ${i + 1} width:`, cardBox.width);
      
      // On mobile (480px and below), cards should be in single column and nearly full width
      expect(cardBox.width).toBeGreaterThan(containerBox.width - 20); // Allow for padding
    }
  });
});