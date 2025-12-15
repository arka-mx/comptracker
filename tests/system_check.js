import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function verifySystem() {
    console.log('--- System Health Check ---');
    let errors = 0;

    // 1. Check Backend Health (via /api/auth/me)
    try {
        const res = await fetch(`${BASE_URL}/api/auth/me`);
        if (res.status === 200 || res.status === 401) {
            console.log('PASS: Backend is reachable (Status:', res.status, ')');
        } else {
            console.error('FAIL: Backend returned unexpected status:', res.status);
            errors++;
        }
    } catch (e) {
        console.error('FAIL: Backend not reachable:', e.message);
        errors++;
    }

    if (errors === 0) {
        console.log('--- SYSTEM HEALTHY ---');
    } else {
        console.log('--- SYSTEM ISSUES FOUND ---');
        process.exit(1);
    }
}

verifySystem();
