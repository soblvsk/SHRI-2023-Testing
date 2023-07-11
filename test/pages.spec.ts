import { test, expect } from '@playwright/test';

test('В магазине должна быть страница "Главная" и иметь статическое содержимое', async ({ page }) => {
  await page.goto('/hw/store');
  await expect(page).toHaveScreenshot('page_home.png');
});

test('В магазине должна быть страница "Условия доставки" и иметь статическое содержимое', async ({
  page,
}) => {
  await page.goto('/hw/store/delivery');
  await expect(page).toHaveScreenshot('page_delivery.png');
});

test('В магазине должна быть страница "Контакты" и иметь статическое содержимое', async ({ page }) => {
  await page.goto('/hw/store/contacts');
  await expect(page).toHaveScreenshot('page_contacts.png');
});

test('В магазине должна быть страница "Каталог"', async ({ page }) => {
  await page.route('/hw/store/api/products', async (route) => {
    const json = [
      {
        id: 0,
        name: 'Sleek Towels',
        price: 160,
      },
      {
        id: 1,
        name: 'Gorgeous Shirt',
        price: 472,
      },
      {
        id: 2,
        name: 'Awesome Hat',
        price: 215,
      },
      {
        id: 3,
        name: 'Refined Car',
        price: 490,
      },
    ];

    await route.fulfill({ json });
  });

  await page.goto('/hw/store/catalog');
  await expect(page).toHaveScreenshot('page_catalog.png');
});
