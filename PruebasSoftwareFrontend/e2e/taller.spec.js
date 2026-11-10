import { test, expect } from '@playwright/test';

const URL_LOGIN_API = 'http://localhost:3000/auth/login';

test('E2E-04: sin sesión no se puede abrir el dashboard', async ({ page }) => {
  await page.goto('/dashboard/admin');

  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
});

test('E2E-05: cuenta bloqueada (423) muestra el mensaje en el navegador', async ({ page }) => {
  await page.route(URL_LOGIN_API, (route) =>
    route.fulfill({
      status: 423,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: {
          code: 'CUENTA_BLOQUEADA',
          message: 'Cuenta bloqueada. Intenta de nuevo en 5 minuto(s).',
        },
      }),
    })
  );

  await page.goto('/');
  await page.getByLabel('Correo').fill('admin@crm.local');
  await page.getByLabel('Contraseña').fill('claveMala');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Cuenta bloqueada')).toBeVisible();
});
