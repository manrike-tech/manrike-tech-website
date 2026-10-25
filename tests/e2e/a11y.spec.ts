import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  './',
  'blog/',
  'blog/ssh-hardening-linux-servers/',
  'blog/static-site-architecture/',
  'blog/tags/',
  'notes/',
  'notes/kubernetes/crashloopbackoff/',
  'resources/',
  'projects/',
  'projects/manrike-tech-website/',
  'categories/',
  'categories/linux/',
  'cv/',
  'cv/es/',
  'contact/',
  'search/?q=linux',
];

for (const theme of ['dark', 'light'] as const) {
  test.describe(`axe (${theme} theme)`, () => {
    for (const path of pages) {
      test(`${path} has no WCAG A/AA violations`, async ({ page }, info) => {
        test.skip(info.project.name === 'mobile' && theme === 'light', 'covered on desktop');
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
        await page.goto(path);
        if (path.startsWith('search')) await page.locator('[data-results] li').first().waitFor();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const summary = results.violations.map(
          (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
        );
        expect(summary).toEqual([]);
      });
    }
  });
}
