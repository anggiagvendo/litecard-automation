import { test, expect } from '@playwright/test';
import {LoginPage} from '../../src/login.page';
import {TestLogin} from './testcases/login.flow';
import {TestCreateTemplate} from './testcases/create_template.flow'

test.describe('Litecard group test',()=>{
    let login : LoginPage;
    
    test.beforeEach(async ({page}) => {
        //always login test
        login = new LoginPage(page);
        await page.goto(login.first_url);
        await login.loginButton.click();
        await TestLogin(page);
    })

    test('Login test', async ({page})=>{
        await TestCreateTemplate(page);
    })
})