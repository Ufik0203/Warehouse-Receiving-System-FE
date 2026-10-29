import { expect, type Page } from '@playwright/test';

export async function chooseReceivingProduct(page: Page, label: string, name: string) {
  for (;;) {
    await page.getByLabel(label, { exact: true }).and(page.getByRole('button')).click();
    const option = page.getByRole('option', { name, exact: true });
    if (await option.count()) { await option.click(); await expect(page.getByRole('listbox')).toHaveCount(0); return; }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    const current = await page.getByText(/^Halaman \d+/).textContent();
    const number = Number(current?.match(/Halaman (\d+)/)?.[1]);
    expect(Number.isFinite(number)).toBe(true);
    const next = page.getByRole('button', { name: 'Berikutnya', exact: true });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByText(new RegExp(`^Halaman ${number + 1}\\b`))).toBeVisible();
  }
}
