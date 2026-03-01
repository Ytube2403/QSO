import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('should show login form by default', async ({ page }) => {
        await expect(page.getByText('Welcome back')).toBeVisible();
        await expect(page.getByPlaceholder('Email address')).toBeVisible();
        await expect(page.getByPlaceholder('Password')).toBeVisible();
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
        await expect(page.locator('button:has-text("Don\'t have an account? Sign up")')).toBeVisible();
    });

    test('should toggle to sign up mode', async ({ page }) => {
        await page.locator('button:has-text("Don\'t have an account? Sign up")').click();

        await expect(page.getByText('Create an account')).toBeVisible();
        await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
        await expect(page.locator('button:has-text("Already have an account? Sign in")')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.getByPlaceholder('Email address').fill('test@example.com');
        await page.getByPlaceholder('Password').fill('wrongpassword123');
        await page.locator('button:has-text("Sign In")').click();

        await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });
});
