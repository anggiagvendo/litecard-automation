import { Locator, Page, expect } from '@playwright/test';

export class LoginPage{
    readonly loginButton: Locator;
    readonly registerButton : Locator;
    readonly username_field : Locator;
    readonly password_field : Locator;
    readonly continue_button : Locator;
    readonly first_url = "https://app.dev.litecard.io/";

    readonly email ="qa-dev@litecard.com.au";
    readonly password = "Litecard@123!";

    constructor(public page:Page){
        this.loginButton = page.getByText('Log In');
        this.registerButton = page.getByText('Sign Up');
        this.username_field = page.locator('#username');
        this.password_field = page.locator('#password');
        this.continue_button = page.getByRole('button',{name : 'Continue'});
    }
    
}


