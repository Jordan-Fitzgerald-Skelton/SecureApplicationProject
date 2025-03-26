const { test, expect } = require('@playwright/test');

test('Signup, login, and view profile', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/'); // Change if using a different port

    // Signup
    await page.fill('#insecureSignupEmail', 'test@example.com');
    await page.fill('#insecureSignupPassword', 'password123');
    await page.click('#insecureSignupForm button');
    await page.waitForTimeout(1000); // Wait for response (simple approach)

    // Login
    await page.fill('#insecureEmail', 'test@example.com');
    await page.fill('#insecurePassword', 'password123');
    await page.click('#insecureLoginForm button');
    await page.waitForTimeout(1000); 

    // View Profile
    await page.fill('#insecureProfileName', 'test@example.com');
    await page.click('button:has-text("View Profile")');
    await page.waitForTimeout(1000);

    //Check the profile response
    const profileContent = await page.innerHTML('#insecureProfileResult');
    expect(profileContent).toContain('<h1>Profile Information</h1>');
});

test('Login fails with incorrect password', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/');

    await page.fill('#insecureEmail', 'test@example.com');
    await page.fill('#insecurePassword', 'wrongpassword');
    await page.click('#insecureLoginForm button');

    const alertMessage = await page.waitForEvent('dialog');
    expect(alertMessage.message()).toContain('Invalid credentials');
});

test('SQL Injection on login', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/');

    await page.fill('#insecureEmail', "' OR 1=1 --");
    await page.fill('#insecurePassword', 'anything');
    await page.click('#insecureLoginForm button');

    const alertMessage = await page.waitForEvent('dialog');
    expect(alertMessage.message()).toContain('Login successful');
});

test('XSS in profile display', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/');

    await page.fill('#insecureSignupEmail', "test<xss>@example.com");
    await page.fill('#insecureSignupPassword', 'password123');
    await page.click('#insecureSignupForm button');

    await page.fill('#insecureProfileName', "<script>alert('XSS');</script>");
    await page.click('button:has-text("View Profile")');

    const alertMessage = await page.waitForEvent('dialog');
    expect(alertMessage.message()).toContain('XSS');
});
