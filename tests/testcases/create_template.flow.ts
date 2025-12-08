import {CreateTemplate} from '../../src/create_template.page';
import { expect, Page } from '@playwright/test';

export async function TestCreateTemplate(page : Page) {
    let create_template = new CreateTemplate(page);

    await create_template.account_selector.click();
    await create_template.account_dropdown.click();
    await page.waitForLoadState('networkidle');
    await create_template.create_template_menu.click();
    await expect(create_template.create_template_header).toBeVisible()
}