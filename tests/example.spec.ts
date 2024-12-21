import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/Auth');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('parent-child');
});
