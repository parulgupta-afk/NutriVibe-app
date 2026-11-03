const http = require('http');

const API_BASE = 'http://localhost:5000';
let authToken = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (authToken && !reqHeaders['Authorization']) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout on ${method} ${path}`));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING COMPLETE END-TO-END WEBSITE & API TEST ===\n');
  const results = [];

  async function test(name, fn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log('PASSED');
      results.push({ name, passed: true });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({ name, passed: false, error: err.message });
    }
  }

  // 1. Health
  await test('GET /api/health', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200 || !res.data.status) {
      throw new Error(`Expected 200 OK, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 2. Auth - Register
  const testEmail = `test_${Date.now()}@nutrivibe.local`;
  const testPassword = 'Password123!';
  await test('POST /api/auth/register', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Tester User',
      email: testEmail,
      password: testPassword,
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Registration failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    authToken = res.data.token || (res.data.data && res.data.data.token);
    if (!authToken) throw new Error('No token returned');
  });

  // 3. Auth - Login
  await test('POST /api/auth/login', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Login failed with status ${res.status}`);
    }
    authToken = res.data.token;
  });

  // 4. Auth - Me
  await test('GET /api/auth/me', async () => {
    const res = await request('GET', '/api/auth/me');
    if (res.status !== 200 || !res.data.user) {
      throw new Error(`Fetch me failed with status ${res.status}`);
    }
  });

  // 5. Auth - Update Profile (set Dairy allergy)
  await test('PUT /api/auth/profile', async () => {
    const res = await request('PUT', '/api/auth/profile', {
      preferences: {
        allergies: ['Dairy'],
        dietaryRestrictions: ['Vegetarian'],
        healthGoals: ['Weight Loss'],
      },
    });
    if (res.status !== 200) {
      throw new Error(`Update profile failed with status ${res.status}`);
    }
  });

  // 6. Product - Scan Demo Barcode (Greek Yogurt - should flag Dairy)
  await test('GET /api/products/scan/4567890123456', async () => {
    const res = await request('GET', '/api/products/scan/4567890123456');
    if (res.status !== 200 || !res.data.product) {
      throw new Error(`Scan product failed with status ${res.status}`);
    }
    // Safety verdict should flag unsafe or caution for dairy
    if (res.data.safetyVerdict) {
      const level = res.data.safetyVerdict.level;
      if (level !== 'Unsafe' && level !== 'Caution') {
        throw new Error(`Expected Unsafe/Caution for dairy allergy, got ${level}`);
      }
    }
  });

  // 7. Tracking - Log scanned product
  await test('POST /api/tracking', async () => {
    const res = await request('POST', '/api/tracking', {
      barcode: '4567890123456',
      productName: 'Demo Greek Yogurt',
      safetyVerdict: 'Unsafe',
      reasons: ['Contains dairy'],
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Tracking log failed with status ${res.status}`);
    }
  });

  // 8. Tracking - Get daily tracking
  await test('GET /api/tracking', async () => {
    const res = await request('GET', '/api/tracking');
    if (res.status !== 200) {
      throw new Error(`Get tracking failed with status ${res.status}`);
    }
  });

  // 9. Tracking - Get tracking stats
  await test('GET /api/tracking/stats', async () => {
    const res = await request('GET', '/api/tracking/stats');
    if (res.status !== 200) {
      throw new Error(`Get tracking stats failed with status ${res.status}`);
    }
  });

  // 10. Dependents - Create profile
  let dependentId = '';
  await test('POST /api/dependents', async () => {
    const res = await request('POST', '/api/dependents', {
      name: 'Family Child',
      relationship: 'Child',
      preferences: {
        allergies: ['Peanuts'],
        dietaryRestrictions: ['Vegetarian'],
      },
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Create dependent failed with status ${res.status}`);
    }
    dependentId = res.data.data?._id || res.data._id;
  });

  // 11. Dependents - List profiles
  await test('GET /api/dependents', async () => {
    const res = await request('GET', '/api/dependents');
    if (res.status !== 200) {
      throw new Error(`List dependents failed with status ${res.status}`);
    }
  });

  // 12. Favorites - Add favorite
  await test('POST /api/favorites', async () => {
    const res = await request('POST', '/api/favorites', {
      barcode: '1234567890123',
      name: 'Organic Almond Butter',
      safetyStatus: 'Safe',
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Add favorite failed with status ${res.status}`);
    }
  });

  // 13. Favorites - List favorites
  await test('GET /api/favorites', async () => {
    const res = await request('GET', '/api/favorites');
    if (res.status !== 200) {
      throw new Error(`List favorites failed with status ${res.status}`);
    }
  });

  // 14. Nutrition Meals - Log meal
  await test('POST /api/meals', async () => {
    const res = await request('POST', '/api/meals', {
      mealType: 'breakfast',
      mealName: 'Oatmeal with fruit',
      items: [
        {
          name: 'Rolled Oats',
          grams: 50,
          nutrition: { calories: 180, protein: 6, carbs: 32, fat: 3, fiber: 5 },
        },
      ],
      totals: { calories: 180, protein: 6, carbs: 32, fat: 3, fiber: 5 },
      localDate: new Date().toISOString().slice(0, 10),
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Log meal failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 15. Nutrition Meals - Get daily meals
  await test('GET /api/meals', async () => {
    const res = await request('GET', '/api/meals');
    if (res.status !== 200) {
      throw new Error(`Get meals failed with status ${res.status}`);
    }
  });

  // 16. Hydration - Log intake
  await test('POST /api/hydration', async () => {
    const res = await request('POST', '/api/hydration', {
      amountMl: 350,
      localDate: new Date().toISOString().slice(0, 10),
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Log hydration failed with status ${res.status}`);
    }
  });

  // 17. Hydration - Get summary
  await test('GET /api/hydration', async () => {
    const res = await request('GET', '/api/hydration');
    if (res.status !== 200) {
      throw new Error(`Get hydration failed with status ${res.status}`);
    }
  });

  // 18. Streaks - Get streak summary
  await test('GET /api/streaks', async () => {
    const res = await request('GET', '/api/streaks');
    if (res.status !== 200) {
      throw new Error(`Get streaks failed with status ${res.status}`);
    }
  });

  // 19. VibeDiet - Generate plan
  await test('POST /api/diet/generate', async () => {
    const res = await request('POST', '/api/diet/generate', {
      goal: 'Weight Loss',
      dietType: 'Vegetarian',
      days: 1,
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Generate diet failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 20. VibeDiet - Get active plan
  await test('GET /api/diet/active', async () => {
    const res = await request('GET', '/api/diet/active');
    if (res.status !== 200) {
      throw new Error(`Get active diet failed with status ${res.status}`);
    }
  });

  // 21. VibeAI - Chat
  await test('POST /api/ai/chat', async () => {
    const res = await request('POST', '/api/ai/chat', {
      message: 'What was my calorie count today?',
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`AI chat failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 22. Food Reactions - Log reaction
  await test('POST /api/reactions', async () => {
    const res = await request('POST', '/api/reactions', {
      foods: ['Milk', 'Paneer'],
      symptoms: ['Bloating'],
      severity: 'mild',
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Create reaction failed with status ${res.status}`);
    }
  });

  // 23. Food Reactions - List
  await test('GET /api/reactions', async () => {
    const res = await request('GET', '/api/reactions');
    if (res.status !== 200) {
      throw new Error(`List reactions failed with status ${res.status}`);
    }
  });

  // 24. Food Reactions - Insights
  await test('GET /api/reactions/insights', async () => {
    const res = await request('GET', '/api/reactions/insights');
    if (res.status !== 200) {
      throw new Error(`Reaction insights failed with status ${res.status}`);
    }
  });

  // 25. Indian Foods database
  await test('GET /api/indian-foods?q=dal', async () => {
    const res = await request('GET', '/api/indian-foods?q=dal');
    if (res.status !== 200) {
      throw new Error(`Search Indian foods failed with status ${res.status}`);
    }
  });

  // 26. Product Recalls
  await test('GET /api/recalls', async () => {
    const res = await request('GET', '/api/recalls');
    if (res.status !== 200) {
      throw new Error(`Get recalls failed with status ${res.status}`);
    }
  });

  // 27. Frontend HTML & Asset routing (port 5173)
  await test('Vite Frontend Root (http://localhost:5173/)', async () => {
    return new Promise((resolve, reject) => {
      http.get('http://localhost:5173/', (res) => {
        if (res.statusCode === 200) resolve();
        else reject(new Error(`Vite returned status ${res.statusCode}`));
      }).on('error', reject);
    });
  });

  // 28. Frontend /api proxy routing (http://localhost:5173/api/health)
  await test('Vite API Reverse Proxy (http://localhost:5173/api/health)', async () => {
    return new Promise((resolve, reject) => {
      http.get('http://localhost:5173/api/health', (res) => {
        if (res.statusCode === 200) resolve();
        else reject(new Error(`Proxy returned status ${res.statusCode}`));
      }).on('error', reject);
    });
  });

  console.log('\n========================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`SUMMARY: ${passedCount}/${results.length} TESTS PASSED.`);
  if (passedCount === results.length) {
    console.log('✅ ALL SYSTEMS OPERATIONAL!');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
