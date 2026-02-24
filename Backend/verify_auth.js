import axios from 'axios';

const api = axios.create({ baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:5000' });

async function runTests() {
    console.log('--- Auth Verification ---');

    try {
        // Test correct password
        const loginRes = await api.post('/login', { password: 'admin' });
        console.log('Login correct:', loginRes.data.success ? 'PASS' : 'FAIL');

        // Test wrong password
        try {
            await api.post('/login', { password: 'wrong' });
            console.log('Login wrong: FAIL (should have error)');
        } catch (e) {
            console.log('Login wrong: PASS (expected error)');
        }

        // Test change password
        const changeRes = await api.post('/change-password', {
            oldPassword: 'admin',
            newPassword: 'newadmin'
        });
        console.log('Change password:', changeRes.data.success ? 'PASS' : 'FAIL');

        // Test new password
        const loginNewRes = await api.post('/login', { password: 'newadmin' });
        console.log('Login new:', loginNewRes.data.success ? 'PASS' : 'FAIL');

        // Revert password
        await api.post('/change-password', {
            oldPassword: 'newadmin',
            newPassword: 'admin'
        });
        console.log('Revert password: PASS');

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTests();
