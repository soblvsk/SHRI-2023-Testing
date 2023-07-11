import { test, expect } from '@playwright/test';

test('В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней', async ({
  page,
}) => {
  const cartMock = {
    key: 'example-store-cart',
    data: {
      1: {
        name: 'Gorgeous Shirt',
        count: 2,
        price: 472,
      },
      2: {
        name: 'Awesome Hat',
        count: 1,
        price: 215,
      },
    },
  };

  await page.goto('/hw/store/');

  await page.evaluate((item) => {
    window.localStorage.setItem(item.key, JSON.stringify(item.data));
  }, cartMock);

  await page.goto('hw/store/cart');

  expect(page.getByRole('link', { name: 'Cart (2)' })).toBeVisible();
});

test('В корзине должна отображаться таблица с добавленными в нее товарами', async ({ page }) => {
  const cartMock = {
    key: 'example-store-cart',
    data: {
      1: {
        name: 'Gorgeous Shirt',
        count: 2,
        price: 472,
      },
    },
  };

  await page.goto('/hw/store/');

  await page.evaluate((item) => {
    window.localStorage.setItem(item.key, JSON.stringify(item.data));
  }, cartMock);

  await page.goto('/hw/store/cart');

  const cartItem = page.getByTestId('1').first();
  await expect(cartItem).toBeVisible();

  await expect(cartItem.locator('.Cart-Name')).toBeVisible();
  await expect(cartItem.locator('.Cart-Price')).toBeVisible();
  await expect(cartItem.locator('.Cart-Count')).toBeVisible();
  await expect(cartItem.locator('.Cart-Total')).toBeVisible();
});

test('В корзине должна быть кнопка "очистить корзину", по нажатию на которую все товары должны удаляться', async ({
  page,
}) => {
  const cartMock = {
    key: 'example-store-cart',
    data: {
      1: {
        name: 'Gorgeous Shirt',
        count: 2,
        price: 472,
      },
      2: {
        name: 'Awesome Hat',
        count: 1,
        price: 215,
      },
    },
  };

  await page.goto('/hw/store/');

  await page.evaluate((item) => {
    window.localStorage.setItem(item.key, JSON.stringify(item.data));
  }, cartMock);

  await page.goto('hw/store/cart');
  await page.getByRole('button', { name: /Clear shopping cart/i }).click();
  await expect(page.getByText('Cart is empty.')).toBeVisible();
});

test('Если корзина пустая, должна отображаться ссылка на каталог товаров', async ({ page }) => {
  await page.goto('hw/store/cart');

  const homeLink = page.getByRole('link', { name: /catalog/i });
  await expect(homeLink.nth(1)).toHaveAttribute('href', '/hw/store/catalog');
});

test('При оформлении заказа должно появиться окно с заказом', async ({ page }) => {
  const cartMock = {
    key: 'example-store-cart',
    data: {
      1: {
        name: 'Gorgeous Shirt',
        count: 2,
        price: 472,
      },
      2: {
        name: 'Awesome Hat',
        count: 1,
        price: 215,
      },
    },
  };

  await page.goto('/hw/store/');

  await page.evaluate((item) => {
    window.localStorage.setItem(item.key, JSON.stringify(item.data));
  }, cartMock);

  await page.goto('/hw/store/cart');

  const cartForm = page.locator('.Form');
  await cartForm.waitFor();

  await page.getByLabel('Name').type('Vitaliy');
  await page.getByLabel('Phone').type('79999999999');
  await page.getByLabel('Address').type('Address');

  await page.getByRole('button', { name: 'Checkout' }).click();

  const response = await page.waitForResponse('/hw/store/api/checkout').then((res) => res.json());
  expect(response.id).toBeLessThan(100000);

  const successMsg = page.locator('.Cart-SuccessMessage');
  await successMsg.waitFor();
  await expect(successMsg).toHaveClass(['Cart-SuccessMessage alert alert-success']);
});
