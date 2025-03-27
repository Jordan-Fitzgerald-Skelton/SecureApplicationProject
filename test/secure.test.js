const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:4000';

let authToken = '';

test('Signup should hash password and store user securely', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/register`, {
        data: {
            email: 'secureuser@example.com',
            password: 'SecurePass123!'
        }
    });

    const body = await response.text();
    expect(body).toContain('User registered securely.');
});

test('Login should succeed and return a JWT token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
        data: {
            email: 'secureuser@example.com',
            password: 'SecurePass123!'
        }
    });

    const body = await response.json();
    expect(body).toHaveProperty('token');

    authToken = body.token;
});

test('SQL Injection should not bypass authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
        data: {
            email: "' OR 1=1 --",
            password: "anything"
        }
    });

    const body = await response.text();
    expect(body).toContain('Invalid credentials');
});

test('XSS attempt in profile should be sanitized', async ({ request }) => {
    await request.post(`${BASE_URL}/register`, {
        data: {
            email: '<script>alert("XSS")</script>',
            password: 'password123'
        }
    });

    const response = await request.get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });

    const body = await response.text();
    expect(body).not.toContain('<script>alert("XSS")</script>');
});

test('Profile should require authentication', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/profile`);

    expect(response.status()).toBe(403); // Access denied if no token is provided
});

test('Profile should mask email and password', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });

    const body = await response.json();
    expect(body.email).toContain('*****'); // Email should be masked
    expect(body.password).toBe('*******'); // Password should never be exposed
});
