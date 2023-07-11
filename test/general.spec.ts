import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 640, height: 480 },
  { width: 375, height: 675 },
];

test('Вёрстка должна адаптироваться под ширину экрана ', async ({ page }) => {
  await page.goto('/hw/store');

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const { width, height } = viewport;
    const screenshotPath = `adaptive_${width}x${height}.png`;
    await expect(page).toHaveScreenshot(screenshotPath);
  }
});

test('В шапке отображаются ссылки на страницы магазина, а также ссылка на корзину', async ({ page }) => {
  await page.goto('/hw/store');

  const catalogLink = page.getByRole('link', { name: /Catalog/i });
  await expect(catalogLink).toHaveAttribute('href', '/hw/store/catalog');

  const deliveryLink = page.getByRole('link', { name: /Delivery/i });
  await expect(deliveryLink).toHaveAttribute('href', '/hw/store/delivery');

  const contactsLink = page.getByRole('link', { name: /Contacts/i });
  await expect(contactsLink).toHaveAttribute('href', '/hw/store/contacts');

  const cartLink = page.getByRole('link', { name: /Cart/i });
  await expect(cartLink).toHaveAttribute('href', '/hw/store/cart');
});

test('Название магазина в шапке должно быть ссылкой на главную страницу', async ({ page }) => {
  await page.goto('/hw/store');

  const homeLink = page.getByRole('link', { name: /Example store/i });

  await expect(homeLink).toHaveAttribute('href', '/hw/store/');
});

test('На ширине меньше 576px навигационное меню должно скрываться за гамбургер', async ({ page }) => {
  await page.goto('/hw/store');
  await page.setViewportSize({ width: 575, height: 850 });

  const toggle = page.getByRole('button', { name: /Toggle navigation/i });

  await expect(toggle).toBeVisible();
});

test('При выборе элемента из меню "гамбургера", меню должно закрываться', async ({ page }) => {
  await page.goto('/hw/store');
  await page.setViewportSize({ width: 575, height: 850 });

  const toggle = page.getByRole('button', { name: /Toggle navigation/i });
  await toggle.click();

  const cartLink = page.getByRole('link', { name: /Cart/i });
  await expect(cartLink).toBeVisible();
  await cartLink.click();
  await expect(cartLink).not.toBeVisible();
});
