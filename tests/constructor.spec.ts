import { expect, test } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/user', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      user: {
        email: 'test@test.com',
        name: 'Test User'
      }
    })
  });
});
await page.routeFromHAR('./tests/hars/ingredients.har', {
  url: '**/api/ingredients',
  update: false
});

    await page.goto('/');
    await page.waitForSelector('[data-testid="ingredient-card"]', { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('должен добавлять ингредиент в конструктор', async ({ page }) => {
    const ingredientCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Краторная булка N-200i'
    }).first();
    const ingredientName = await ingredientCard.locator('.text_type_main-default').textContent();
    
    const addButton = ingredientCard.getByRole('button', { name: 'Добавить' });
    await addButton.click();

    const constructor = page.locator('[data-testid="burger-constructor"]');
    await expect(constructor.locator(`text=${ingredientName} (верх)`)).toBeVisible({ timeout: 10000 });
    await expect(constructor.locator(`text=${ingredientName} (низ)`)).toBeVisible({ timeout: 10000 });
  });

  test('должен открывать модальное окно ингредиента по клику', async ({ page }) => {
    const ingredientCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Краторная булка N-200i'
    }).first();
    await ingredientCard.click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();
  });

  test('должен отображать данные ингредиента в модальном окне', async ({ page }) => {
    const ingredientCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Краторная булка N-200i'
    }).first();
    const ingredientName = await ingredientCard.locator('.text_type_main-default').textContent();
    
    await ingredientCard.click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();

    
    const modalTitle = modal.locator('h3.text_type_main-medium');
    await expect(modalTitle).toHaveText(ingredientName || '');
  });

  test('должен закрывать модальное окно по клику на крестик', async ({ page }) => {
    const ingredientCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Краторная булка N-200i'
    }).first();
    await ingredientCard.click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();

    const closeButton = page.locator('[data-testid="modal-close"]');
    await closeButton.click({ force: true });
    
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  test('должен закрывать модальное окно по клику на оверлей', async ({ page }) => {
    const ingredientCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Краторная булка N-200i'
    }).first();
    await ingredientCard.click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();

    const overlay = page.locator('[data-testid="modal-overlay"]');
    await overlay.click({ position: { x: 10, y: 10 }, force: true });

    await expect(modal).toBeHidden({ timeout: 10000 });
  });
});

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
    });
    await page.routeFromHAR('./tests/hars/user.har', {
      url: '**/api/auth/user',
      update: false,
    });
    await page.routeFromHAR('./tests/hars/order.har', {
      url: '**/api/orders',
      update: false,
    });

    await page.addInitScript(() => {
  document.cookie = 'accessToken=fake-access-token';
  localStorage.setItem('refreshToken', 'fake-refresh-token');
});

    await page.goto('/');
    await page.waitForSelector('[data-testid="ingredient-card"]', { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie =
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('refreshToken');
  });
});

  test('должен создать заказ и очистить конструктор', async ({ page }) => {
    const bunCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Краторная булка N-200i'
    }).first();
    await bunCard.waitFor({ state: 'visible' });
    const bunName = await bunCard.locator('.text_type_main-default').textContent();
    
    const bunAddButton = bunCard.getByRole('button', { name: 'Добавить' });
    await bunAddButton.click();
    await page.waitForTimeout(1000);

    const mainCard = page.locator('[data-testid="ingredient-card"]').filter({
      hasText: 'Биокотлета из марсианской Магнолии'
    }).first();
    await mainCard.waitFor({ state: 'visible' });
    const mainName = await mainCard.locator('.text_type_main-default').textContent();
    
    const mainAddButton = mainCard.getByRole('button', { name: 'Добавить' });
    await mainAddButton.click();
    await page.waitForTimeout(1000);

    const constructor = page.locator('[data-testid="burger-constructor"]');
    
    if (bunName) {
      await expect(constructor.locator(`text=${bunName} (верх)`)).toBeVisible({ timeout: 10000 });
      await expect(constructor.locator(`text=${bunName} (низ)`)).toBeVisible({ timeout: 10000 });
    }
    
    if (mainName) {
      await expect(constructor.locator(`text=${mainName}`)).toBeVisible({ timeout: 10000 });
    }

    const orderButton = page.locator('[data-testid="order-button"]');
    await orderButton.click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const orderNumber = modal.locator('[data-testid="order-number"]');
    await expect(orderNumber).toHaveText('12345');

    const closeButton = page.locator('[data-testid="modal-close"]');
    await closeButton.click({ force: true });

    await expect(modal).toBeHidden({ timeout: 10000 });

    await expect(constructor.locator('text=Выберите булки').first()).toBeVisible();
    await expect(constructor.locator('text=Выберите начинку')).toBeVisible();
    
    if (bunName) {
      await expect(constructor.locator(`text=${bunName} (верх)`)).not.toBeVisible();
      await expect(constructor.locator(`text=${bunName} (низ)`)).not.toBeVisible();
    }
    if (mainName) {
      await expect(constructor.locator(`text=${mainName}`)).not.toBeVisible();
    }
  });
});