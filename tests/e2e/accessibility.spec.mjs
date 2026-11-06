import { test, expect } from '@playwright/test';

const errors = new WeakMap();
test.beforeEach(async ({ page }) => {
  errors.set(page, []);
  page.on('pageerror', error => errors.get(page).push(error.message));
  await page.addInitScript(() => localStorage.setItem('vball-onboarding-seen', 'true'));
  await page.goto('/');
  // Wait for preferences hydration to remove the first-visit tutorial. Focusing
  // before this could target inert content during its initial modal render.
  await expect(page.getByText('Skip', { exact: true })).toHaveCount(0);
});

test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));

test('Space activates a focused button instead of the global playback shortcut', async ({ page }) => {
  const settings = page.getByRole('button', { name: 'Settings', exact: true });
  await settings.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
});

test('court players activate with Enter and Space and comparison players are static', async ({ page }) => {
  const player = page.locator('svg g[tabindex="0"]').first();
  await player.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close info', exact: true })).toBeVisible();
  await expect(player).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Space');
  await expect(player).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Compare Rotations' });
  await expect(dialog.locator('svg [role="button"]')).toHaveCount(0);
  await expect(dialog.getByLabel('State A rotation')).toHaveValue('1');
  await expect(dialog.getByLabel('State B phase')).toHaveValue('receive');
});

for (const [opener, title] of [['Settings', 'Settings'], ['Glossary', 'Volleyball Glossary'], ['Support', 'Support & Feedback'], ['Compare', 'Compare Rotations'], ['Share', 'Share with your team']]) {
  test(`${opener} confines focus, handles Escape, and restores the opener`, async ({ page }) => {
    const trigger = page.getByRole('button', { name: opener, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveJSProperty('open', true);
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    const controls = dialog.locator('button, input, select, a[href]').filter({ visible: true });
    await controls.last().focus();
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await controls.first().focus();
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}

test('settings fields and switches have stable names and selected states', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
  await expect(dialog.getByLabel('Team Name', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Variant', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveCount(7);
  await expect(dialog.getByLabel('Jersey number', { exact: true })).toHaveCount(7);
  await expect(dialog.getByLabel('Role', { exact: true })).toHaveCount(7);
  for (const name of ['Use Libero', 'Learn Mode', 'Reduce Motion', 'Flip Court']) {
    await expect(dialog.getByRole('switch', { name, exact: true })).toBeVisible();
  }
  const libero = dialog.getByRole('switch', { name: 'Use Libero', exact: true });
  await libero.focus();
  await page.keyboard.press('Space');
  await expect(libero).toHaveAttribute('aria-checked', 'false');
  await expect(dialog.getByRole('button', { name: '5-1', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // Escape works even while an editable control has focus.
  await dialog.getByLabel('Team Name', { exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('replayed tutorial is a labelled modal and can be skipped with Escape', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Replay Tutorial', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Volleyball tutorial' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('status')).toContainText('Step 1 of 3');
  await dialog.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog.getByRole('status')).toContainText('Step 2 of 3');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('mobile settings preserve keyboard labels and Escape restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page.getByRole('button', { name: 'Settings', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
  await dialog.getByLabel('Team Name', { exact: true }).fill('Keyboard team');
  await dialog.getByLabel('Role', { exact: true }).last().focus();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('help discloses state and Escape returns to its trigger', async ({ page }) => {
  const help = page.getByRole('button', { name: 'Help: What are positions?', exact: true });
  await help.focus();
  await page.keyboard.press('Space');
  await expect(help).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: "Got it, don't show again", exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(help).toHaveAttribute('aria-expanded', 'false');
  await expect(help).toBeFocused();
});
