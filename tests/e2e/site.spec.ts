import { expect, test } from '@playwright/test';

const isMobile = (name: string) => name === 'mobile';

test.describe('navigation', () => {
  test('home page shows the main sections', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Featured articles' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recently updated notes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Technology areas' })).toBeVisible();
  });

  for (const [label, heading] of [
    ['Blog', 'Blog'],
    ['Notes', 'Knowledge base'],
    ['Resources', 'Resources'],
    ['Projects', 'Projects'],
    ['About / CV', /.+/],
  ] as const) {
    test(`primary navigation reaches ${label}`, async ({ page }, info) => {
      await page.goto('./');
      if (isMobile(info.project.name)) await page.getByRole('button', { name: 'Menu' }).click();
      const nav = page.getByRole('navigation', { name: 'Primary' });
      await nav.getByRole('link', { name: label }).click();
      await expect(page.locator('h1')).toHaveText(heading);
      // The collapsed mobile menu hides its links, so query the DOM directly.
      await expect(page.locator('#primary-nav a[aria-current="page"]')).toHaveText(label);
    });
  }

  test('mobile menu opens and closes', async ({ page }, info) => {
    test.skip(!isMobile(info.project.name), 'mobile only');
    await page.goto('./');
    const button = page.getByRole('button', { name: 'Menu' });
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('no horizontal scrolling on content pages', async ({ page }) => {
    for (const path of ['./', 'blog/ssh-hardening-linux-servers/', 'resources/', 'cv/']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(false);
    }
  });

  test('unknown pages return the 404 page', async ({ page }) => {
    const response = await page.goto('does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('404');
  });
});

test.describe('blog', () => {
  test('article shows metadata, code and related content', async ({ page }) => {
    await page.goto('blog/ssh-hardening-linux-servers/');
    await expect(page.locator('article time').first()).toBeVisible();
    await expect(page.getByText(/min read/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Related' })).toBeVisible();
    await expect(page.locator('pre.astro-code').first()).toBeVisible();
  });

  test('tag pages list tagged articles', async ({ page }) => {
    await page.goto('blog/tag/ssh/');
    await expect(page.locator('h1')).toHaveText('#ssh');
    await expect(
      page.getByRole('link', { name: 'Hardening OpenSSH on Linux servers' }),
    ).toBeVisible();
  });

  test('category filter narrows the listing', async ({ page }) => {
    await page.goto('blog/');
    await page
      .getByRole('navigation', { name: 'Filter by category' })
      .getByRole('link', { name: 'systemd' })
      .click();
    await expect(page.locator('h1')).toHaveText('systemd');
    await expect(
      page.getByRole('link', { name: 'Replacing cron jobs with systemd timers' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Hardening OpenSSH on Linux servers' }),
    ).toHaveCount(0);
  });

  test('copy button copies code to the clipboard', async ({ page, context }, info) => {
    test.skip(isMobile(info.project.name), 'clipboard permissions are desktop-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('blog/systemd-timers-instead-of-cron/');
    const block = page.locator('.code-block').first();
    await block.getByRole('button', { name: 'Copy code to clipboard' }).click();
    await expect(block.getByRole('button')).toHaveText('copied');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('[Unit]');
  });

  test('drafts are not published', async ({ page }) => {
    const response = await page.goto('blog/proxmox-backup-strategy/');
    expect(response?.status()).toBe(404);
    await page.goto('blog/');
    await expect(page.getByText('Designing a backup strategy for Proxmox VE')).toHaveCount(0);
  });
});

test.describe('search', () => {
  test('finds content across types and filters by type', async ({ page }) => {
    await page.goto('search/?q=ssh');
    const results = page.locator('[data-results] li');
    await expect(results.first()).toBeVisible();
    await expect(page.locator('[data-status]')).toContainText('for "ssh"');
    await expect(results.filter({ hasText: 'Hardening OpenSSH' })).toHaveCount(1);

    await page.getByLabel('notes').check();
    await expect(page).toHaveURL(/type=Notes/);
    await expect(results.filter({ hasText: 'Hardening OpenSSH' })).toHaveCount(0);
    await expect(results.first().locator('.badge')).toHaveText('Notes');
  });

  test('shows a helpful empty state', async ({ page }) => {
    await page.goto('search/');
    await page.getByLabel('Search query').fill('zzzqqqxxnotaword');
    await expect(page.locator('[data-empty]')).toBeVisible();
    await expect(
      page.locator('[data-empty]').getByRole('link', { name: 'categories' }),
    ).toBeVisible();
  });

  test('blog search form sends the query to the search page', async ({ page }) => {
    await page.goto('blog/');
    await page.getByLabel('Search articles').fill('timers');
    await page.getByLabel('Search articles').press('Enter');
    await expect(page).toHaveURL(/search\/\?q=timers&type=Blog/);
    await expect(page.locator('[data-results] li').first()).toContainText('systemd timers');
  });

  test('"/" opens search from any page', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'keyboard shortcut');
    await page.goto('notes/');
    await page.locator('body').press('/');
    await expect(page).toHaveURL(/search\/$/);
    await expect(page.getByLabel('Search query')).toBeFocused();
  });
});

test.describe('theme and accessibility basics', () => {
  test('dark is the default and the light choice persists', async ({ page }) => {
    await page.goto('./');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  });

  test('skip link is the first focusable element', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'keyboard navigation');
    await page.goto('./');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('CV is available in English and Spanish', async ({ page }) => {
    await page.goto('cv/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('link', { name: 'Versión en español' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { name: 'Competencias técnicas' })).toBeVisible();
  });
});
