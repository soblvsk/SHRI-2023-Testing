import { test, expect } from '@playwright/test';

test('В каталоге должны отображаться товары, список которых приходит с сервера', async ({ page }) => {
  await page.goto('/hw/store/catalog');
  await page.waitForResponse('/hw/store/api/products');

  const products = page.locator('.ProductItem');
  const productsCount = await products.count();
  expect(productsCount > 0).toBeTruthy();
});

test('Для каждого товара в каталоге отображается название, цена и ссылка на страницу с подробной информацией о товаре', async ({
  page,
  request,
}) => {
  await page.goto('/hw/store/catalog');
  const products = await request.get('/hw/store/api/products').then((res) => res.json());

  for (const product of products) {
    const card = await page.getByTestId(product.id).locator('.ProductItem');

    await expect(card.locator('.ProductItem-Name')).toBeVisible();
    await expect(card.locator('.ProductItem-Name')).toHaveText(product.name);

    await expect(card.locator('.ProductItem-Price')).toBeVisible();
    await expect(card.locator('.ProductItem-Price')).toHaveText(`$${product.price}`);

    await expect(card.locator('.ProductItem-DetailsLink')).toBeVisible();
    await expect(card.locator('.ProductItem-DetailsLink')).toHaveAttribute(
      'href',
      `/hw/store/catalog/${product.id}`,
    );
  }
});

test('На странице с подробной информацией отображаются: название товара, его описание, цена, цвет, материал и кнопка "Добавить в корзину"', async ({
  page,
  request,
}) => {
  const products = await request.get('/hw/store/api/products').then((res) => res.json());

  for (const product of products.slice(0, 2)) {
    const productPage = await request.get(`/hw/store/api/products/${product.id}`).then((res) => res.json());

    expect(product.id).toBe(productPage.id);

    await page.goto(`/hw/store/catalog/${productPage.id}`);

    await expect(page.locator('.ProductDetails-Name')).toBeVisible();
    await expect(page.locator('.ProductDetails-Name')).toHaveText(productPage.name);

    await expect(page.locator('.ProductDetails-Description')).toBeVisible();
    await expect(page.locator('.ProductDetails-Description')).toHaveText(productPage.description);

    await expect(page.locator('.ProductDetails-Price')).toBeVisible();
    await expect(page.locator('.ProductDetails-Price')).toHaveText(`$${productPage.price}`);

    await expect(page.locator('.ProductDetails-Color')).toBeVisible();
    await expect(page.locator('.ProductDetails-Color')).toHaveText(productPage.color);

    await expect(page.locator('.ProductDetails-Material')).toBeVisible();
    await expect(page.locator('.ProductDetails-Material')).toHaveText(productPage.material);
    await expect(page.getByRole('button', { name: /Add to Cart/i })).toHaveClass([
      'ProductDetails-AddToCart btn btn-primary btn-lg',
    ]);
  }
});

test('Если товар уже добавлен в корзину, в каталоге и на странице товара должно отображаться сообщение об этом', async ({
  page,
}) => {
  await page.goto('/hw/store/catalog/0');

  const addToCart = page.getByRole('button', { name: /Add to Cart/i });
  await addToCart.click();

  await expect(page.locator('.text-success')).toBeVisible();

  await page.goto('hw/store/catalog');
  await expect(page.locator('.text-success').first()).toBeVisible();
});

test('Если товар уже добавлен в корзину, повторное нажатие кнопки "добавить в корзину" должно увеличивать его количество', async ({
  page,
}) => {
  await page.goto('/hw/store/catalog/0');
  await page.getByRole('button', { name: /Add to Cart/i }).click();

  const cartLink = page.getByRole('link', { name: 'Cart (1)' });
  if (await cartLink.isVisible()) {
    await page.goto('/hw/store/cart');
    const count = await page.locator(`tr[data-testid="0"] .Cart-Count`).textContent();

    await page.goto('/hw/store/catalog/0');
    await page.getByRole('button', { name: /Add to Cart/i }).click();

    await page.goto('/hw/store/cart');
    const newCount = await page.locator(`tr[data-testid="0"] .Cart-Count`).textContent();

    expect(Number(newCount)).toBe(Number(count) + 1);
  }
});

test('Содержимое корзины должно сохраняться между перезагрузками страницы', async ({ page }) => {
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
  await page.reload();
  expect(await page.getByText(/Cart is empty/).count()).toBe(0);
});
