import {LoginPage} from '../../../src/login.page.ts';
import { expect, Page } from '@playwright/test';

export async function TestLogin(page : Page) {
    let login = new LoginPage(page);

    await login.username_field.fill(login.email);
    await login.password_field.fill(login.password);
    await login.continue_button.click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Log Out')).toBeVisible();
    
}
