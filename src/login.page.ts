import { Locator, Page, expect } from '@playwright/test';

export class LoginPage{
    readonly loginButton: Locator;
    readonly registerButton : Locator;
    readonly username_field : Locator;
    readonly password_field : Locator;
    readonly continue_button : Locator;
    // Read UI environment variables if provided by the runner (GitHub Actions or local env)
    // Fallback to current dev values for local runs.
    readonly first_url: string = process.env.UI_BASE_URL ?? "https://app.dev.litecard.io/";

    readonly email: string = process.env.UI_USERNAME ?? "qa-dev@litecard.com.au";
    readonly password: string = process.env.UI_PASSWORD ?? "Litecard@123!";

    constructor(public page:Page){
        this.loginButton = page.getByText('Log In');
        this.registerButton = page.getByText('Sign Up');
        this.username_field = page.locator('#username');
        this.password_field = page.locator('#password');
        this.continue_button = page.getByRole('button',{name : 'Continue'});
    }
    
}


