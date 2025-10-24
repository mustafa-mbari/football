/**
 * Test Script: Test Login API Endpoint
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function testLoginAPI() {
  console.log('🧪 Testing Login API\n');

  // Test credentials (based on debug output)
  const credentials = [
    { email: 'mustafa@example.com', password: 'password' },
    { email: 'mustafa@example.com', password: 'password123' },
    { email: 'mustafa@example.com', password: 'admin123' },
    { email: 'yousef@example.com', password: 'password' },
  ];

  for (const cred of credentials) {
    try {
      console.log(`Testing: ${cred.email} with password: ${cred.password.substring(0, 4)}***`);

      const response = await axios.post(`${API_URL}/api/auth/login`, cred, {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true // Don't throw on any status
      });

      if (response.data.success) {
        console.log(`✅ SUCCESS! Login worked!`);
        console.log(`   User: ${response.data.data.username}`);
        console.log(`   Email: ${response.data.data.email}`);
        console.log(`   Role: ${response.data.data.role}\n`);
        console.log(`✅ Use these credentials to login:`);
        console.log(`   Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}\n`);
        return;
      } else {
        console.log(`❌ Failed: ${response.data.message}\n`);
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Cannot connect to backend at ${API_URL}`);
        console.log(`   Make sure the backend is running with: npm run dev\n`);
        return;
      } else {
        console.log(`❌ Error: ${error.message}\n`);
      }
    }
  }

  console.log('\n⚠️  None of the test passwords worked.');
  console.log('\n💡 Options:');
  console.log('1. Check what password you used when creating the account');
  console.log('2. Reset the password in the database');
  console.log('3. Create a new user with known credentials\n');
}

// Run the test
testLoginAPI().catch(console.error);
