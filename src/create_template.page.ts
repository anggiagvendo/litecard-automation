import { Locator, Page, expect } from '@playwright/test';

export class CreateTemplate{
    readonly create_template_menu: Locator;
    readonly account_selector : Locator;
    readonly account_dropdown : Locator;
    readonly create_template_header : Locator;

    constructor(public page:Page) {
        this.create_template_menu = page.locator('li[title="Create Pass Template"]');
        this.account_selector = page.getByText('Master Account');
        this.account_dropdown = page.locator('.ant-select-dropdown .ant-select-item', { hasText: 'Testing 1' });
        this.create_template_header = page.getByRole('heading', { name: 'Create Pass Template' });
    }   
}