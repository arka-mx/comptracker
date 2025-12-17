import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function runTest() {
    console.log('--- Testing Auth Logic for Protection ---');

    // 1. Check Unauthenticated Access for User Session
    console.log('1. Checking Session without Cookie...');
    try {
        const res = await fetch(`${BASE_URL}/api/auth/me`);
        const data = await res.json();

        if (data.user) {
            console.error('FAIL: User found but should be null (Unauthenticated)');
        } else {
            console.log('PASS: No user session found (Correct for unauthenticated)');
        }
    } catch (e) {
        console.error('Error fetching /me', e);
    }

    // Note: We cannot test React Router redirects here as that requires a DOM.
    // However, confirming that the backend returns "no user" means the 
    // ProtectedRoute condition `if (!user)` will evaluate to true.

    console.log('--- Test Complete ---');
}

runTest();
