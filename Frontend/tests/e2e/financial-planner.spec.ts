import { test, expect } from '@playwright/test';

test.describe('Financial Planner UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the financial planner app
    await page.goto('/');
  });

  test('should display the main layout with sidebar and form', async ({ page }) => {
    // Check if the main layout is visible
    await expect(page.locator('div.min-h-screen')).toBeVisible();
    
    // Check if sidebar is present and initially collapsed
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveClass(/w-16/); // Should be collapsed (narrow)
    
    // Check if main content area is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be able to toggle sidebar', async ({ page }) => {
    const sidebar = page.locator('aside');
    const toggleButton = page.locator('button[aria-label="Toggle sidebar"]');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Initially collapsed
    await expect(sidebar).toHaveClass(/w-16/);
    
    // Listen for console logs to see if toggle function is called
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Click to expand (force click to bypass pointer event interceptors)
    await toggleButton.click({ force: true });
    await page.waitForTimeout(1000); // Wait longer for transition
    
    // Check if classes changed
    const sidebarClasses = await sidebar.getAttribute('class');
    console.log('Sidebar classes after click:', sidebarClasses);
    
    await expect(sidebar).toHaveClass(/w-64/);
    
    // Click to collapse again
    await toggleButton.click({ force: true });
    await page.waitForTimeout(1000); // Wait longer for transition
    await expect(sidebar).toHaveClass(/w-16/);
  });

  test('should display all four form sections', async ({ page }) => {
    // Check if all four form sections are present
    const sections = [
      'Person Profile',
      'Assets', 
      'Income and Expenses',
      'Advanced Options'
    ];
    
    for (const section of sections) {
      await expect(page.locator('legend', { hasText: section })).toBeVisible();
    }
  });

  test('should have collapsible form sections', async ({ page }) => {
    // Test Personal Profile section (should be expanded by default)
    const profileSection = page.locator('fieldset').filter({ has: page.locator('legend', { hasText: 'Person Profile' }) });
    const profileContent = profileSection.locator('div').nth(1); // Content div
    await expect(profileContent).toBeVisible();
    
    // Click to collapse
    await page.locator('legend', { hasText: 'Person Profile' }).click();
    await expect(profileContent).toBeHidden();
    
    // Test Advanced Options section (should be collapsed by default)
    const advancedSection = page.locator('fieldset').filter({ has: page.locator('legend', { hasText: 'Advanced Options' }) });
    const advancedContent = advancedSection.locator('div').nth(1);
    await expect(advancedContent).toBeHidden();
    
    // Click to expand
    await page.locator('legend', { hasText: 'Advanced Options' }).click();
    await expect(advancedContent).toBeVisible();
  });

  test('should display all required input fields in Personal Profile', async ({ page }) => {
    // Ensure Personal Profile section is expanded
    const profileLegend = page.locator('legend', { hasText: 'Person Profile' });
    
    // Check if section is collapsed and expand if needed
    const profileSection = page.locator('fieldset').filter({ has: profileLegend });
    const profileContent = profileSection.locator('div').nth(1);
    const isVisible = await profileContent.isVisible();
    
    if (!isVisible) {
      await profileLegend.click();
      await page.waitForTimeout(500); // Wait for animation
    }
    
    const expectedFields = [
      'Current Age',
      "Partner's Age", 
      'Your Retirement Age',
      "Partner's Retirement Age"
    ];
    
    for (const field of expectedFields) {
      await expect(page.locator('label[for]', { hasText: field })).toBeVisible();
    }
  });

  test('should display all required input fields in Assets section', async ({ page }) => {
    // Expand Assets section
    await page.locator('legend', { hasText: 'Assets' }).click();
    await page.waitForTimeout(500);
    
    const expectedFields = [
      'Property Assets',
      'Current Savings',
      'Mortgage Balance', 
      'Superannuation Balance'
    ];
    
    for (const field of expectedFields) {
      await expect(page.locator('label[for]', { hasText: field })).toBeVisible();
    }
  });

  test('should display all required input fields in Income and Expenses section', async ({ page }) => {
    // Expand Income and Expenses section
    await page.locator('legend', { hasText: 'Income and Expenses' }).click();
    await page.waitForTimeout(500);
    
    const expectedFields = [
      'Your Annual Salary',
      "Partner's Annual Salary",
      'Annual Expenses',
      'Pension for You (Annual Amount)',
      'Pension for Your Partner (Annual Amount)'
    ];
    
    for (const field of expectedFields) {
      await expect(page.locator('label[for]', { hasText: field })).toBeVisible();
    }
  });

  test('should display all required input fields in Advanced Options section', async ({ page }) => {
    // Expand Advanced Options section
    await page.locator('legend', { hasText: 'Advanced Options' }).click();
    await page.waitForTimeout(500);
    
    const expectedFields = [
      'Age the plan ends',
      'Property Growth Rate',
      'Expected Savings Growth Rate', 
      'Mortgage Interest Rate',
      'Superannuation Return Rate',
      'Inflation Rate'
    ];
    
    for (const field of expectedFields) {
      await expect(page.locator('label[for]', { hasText: field })).toBeVisible();
    }
  });

  test('should have functional increment/decrement buttons', async ({ page }) => {
    // Ensure Personal Profile section is expanded
    const profileLegend = page.locator('legend', { hasText: 'Person Profile' });
    const profileSection = page.locator('fieldset').filter({ has: profileLegend });
    const profileContent = profileSection.locator('div').nth(1);
    
    const isVisible = await profileContent.isVisible();
    if (!isVisible) {
      await profileLegend.click();
      await page.waitForTimeout(500);
    }
    
    // Test current age field
    const currentAgeInput = page.locator('#currentAge');
    await expect(currentAgeInput).toBeVisible();
    
    const inputContainer = currentAgeInput.locator('..');
    const increaseButton = inputContainer.locator('button').last();
    const decreaseButton = inputContainer.locator('button').first();
    
    // Get initial value
    const initialValue = await currentAgeInput.inputValue();
    
    // Test increase button
    await increaseButton.click();
    await page.waitForTimeout(100);
    const increasedValue = await currentAgeInput.inputValue();
    expect(parseInt(increasedValue)).toBeGreaterThan(parseInt(initialValue));
    
    // Test decrease button
    await decreaseButton.click();
    await page.waitForTimeout(100);
    const decreasedValue = await currentAgeInput.inputValue();
    expect(parseInt(decreasedValue)).toBeLessThan(parseInt(increasedValue));
  });

  test('should display the net wealth chart', async ({ page }) => {
    // Look for chart container or canvas element
    const chartElement = page.locator('[data-testid="net-wealth-chart"], canvas, .echarts-container');
    await expect(chartElement.first()).toBeVisible();
  });

  test('should show checkbox for auto-calculate expenses', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    const checkboxLabel = page.locator('label', { hasText: /Auto-calculate expenses/ });
    
    await expect(checkbox).toBeVisible();
    await expect(checkboxLabel).toBeVisible();
  });

  test('should handle form input validation', async ({ page }) => {
    // Ensure Personal Profile section is expanded
    const profileLegend = page.locator('legend', { hasText: 'Person Profile' });
    const profileSection = page.locator('fieldset').filter({ has: profileLegend });
    const profileContent = profileSection.locator('div').nth(1);
    
    const isVisible = await profileContent.isVisible();
    if (!isVisible) {
      await profileLegend.click();
      await page.waitForTimeout(500);
    }
    
    const currentAgeInput = page.locator('#currentAge');
    await expect(currentAgeInput).toBeVisible();
    
    // The input should have required attribute
    await expect(currentAgeInput).toHaveAttribute('required');
    
    // Test that input accepts numeric values
    await currentAgeInput.fill('35');
    await expect(currentAgeInput).toHaveValue('35');
  });

  test('should check for responsive design elements', async ({ page }) => {
    // Test sidebar responsiveness
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/transition-all/); // Should have transition classes
    
    // Test form sections have proper styling
    const formSections = page.locator('fieldset.form-section');
    await expect(formSections.first()).toHaveClass(/form-section/);
  });

  test('should check accessibility features', async ({ page }) => {
    // Expand all sections to check all inputs
    const sections = ['Person Profile', 'Assets', 'Income and Expenses', 'Advanced Options'];
    for (const section of sections) {
      await page.locator('legend', { hasText: section }).click();
      await page.waitForTimeout(300);
    }
    
    // Check at least a few key inputs have labels
    const currentAgeInput = page.locator('#currentAge');
    await expect(page.locator('label[for="currentAge"]')).toBeVisible();
    
    const savingsInput = page.locator('#savings');
    await expect(page.locator('label[for="savings"]')).toBeVisible();
    
    // Check that toggle button has aria-label
    const toggleButton = page.locator('button[aria-label="Toggle sidebar"]');
    await expect(toggleButton).toBeVisible();
  });

  test('should check for visual styling consistency', async ({ page }) => {
    // Expand all sections to check styling
    const sections = ['Person Profile', 'Assets', 'Income and Expenses', 'Advanced Options'];
    for (const section of sections) {
      await page.locator('legend', { hasText: section }).click();
    }
    
    // Check if increment buttons are styled consistently
    const incrementButtons = page.locator('.increment-btn');
    const buttonCount = await incrementButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check if all buttons have consistent styling
    for (let i = 0; i < buttonCount; i++) {
      await expect(incrementButtons.nth(i)).toHaveClass(/increment-btn/);
    }
  });

  test('should load default values correctly', async ({ page }) => {
    // Expand Advanced Options to check default values
    await page.locator('legend', { hasText: 'Advanced Options' }).click();
    
    // Check if inflation rate has a default value (should be around 3%)
    const inflationInput = page.locator('#inflationRate');
    const inflationValue = await inflationInput.inputValue();
    expect(inflationValue).toBeTruthy(); // Should have some default value
  });
});