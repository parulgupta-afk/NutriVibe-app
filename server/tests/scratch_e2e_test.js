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

    let reqBody = null;
    if (body !== null && body !== undefined) {
      reqBody = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
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

    if (reqBody) {
      req.write(reqBody);
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

  // 6. Product - Scan Demo Barcode
  let demoProductId = null;
  await test('GET /api/products/barcode/4567890123456', async () => {
    const res = await request('GET', '/api/products/barcode/4567890123456');
    if (res.status !== 200 || !res.data.product) {
      throw new Error(`Scan product failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    demoProductId = res.data.product._id;
  });

  // 7. Product - Search
  await test('GET /api/products/search?q=Greek', async () => {
    const res = await request('GET', '/api/products/search?q=Greek');
    if (res.status !== 200) {
      throw new Error(`Search products failed with status ${res.status}`);
    }
  });

  // 8. Dependents - Create profile
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

  // 9. Dependents - List profiles
  await test('GET /api/dependents', async () => {
    const res = await request('GET', '/api/dependents');
    if (res.status !== 200) {
      throw new Error(`List dependents failed with status ${res.status}`);
    }
  });

  // 10. Favorites - Add favorite
  await test('POST /api/favorites/:productId', async () => {
    if (!demoProductId) throw new Error('No product ID to favorite');
    const res = await request('POST', `/api/favorites/${demoProductId}`);
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Add favorite failed with status ${res.status}`);
    }
  });

  // 11. Favorites - List favorites
  await test('GET /api/favorites', async () => {
    const res = await request('GET', '/api/favorites');
    if (res.status !== 200) {
      throw new Error(`List favorites failed with status ${res.status}`);
    }
  });

  // 12. Tracking - Log scanned product
  await test('POST /api/tracking/log', async () => {
    const res = await request('POST', '/api/tracking/log', {
      productId: demoProductId,
      quantity: 1,
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Tracking log failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 13. Tracking - Get daily tracking
  await test('GET /api/tracking/daily', async () => {
    const res = await request('GET', '/api/tracking/daily');
    if (res.status !== 200) {
      throw new Error(`Get daily tracking failed with status ${res.status}`);
    }
  });

  // 14. Tracking - Get tracking stats
  await test('GET /api/tracking/stats', async () => {
    const res = await request('GET', '/api/tracking/stats');
    if (res.status !== 200) {
      throw new Error(`Get tracking stats failed with status ${res.status}`);
    }
  });

  // 15. Nutrition Meals - Log meal
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

  // 16. Nutrition Meals - Get today's meals
  await test('GET /api/meals/today', async () => {
    const res = await request('GET', '/api/meals/today');
    if (res.status !== 200) {
      throw new Error(`Get today meals failed with status ${res.status}`);
    }
  });

  // 17. Nutrition Meals - Get meal history
  await test('GET /api/meals/history', async () => {
    const res = await request('GET', '/api/meals/history');
    if (res.status !== 200) {
      throw new Error(`Get meal history failed with status ${res.status}`);
    }
  });

  // 18. Hydration - Log intake
  await test('POST /api/hydration/log', async () => {
    const res = await request('POST', '/api/hydration/log', {
      amountMl: 350,
      source: 'quick',
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Log hydration failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 19. Hydration - Get today
  await test('GET /api/hydration/today', async () => {
    const res = await request('GET', '/api/hydration/today');
    if (res.status !== 200) {
      throw new Error(`Get today hydration failed with status ${res.status}`);
    }
  });

  // 20. Hydration - Get weekly
  await test('GET /api/hydration/weekly', async () => {
    const res = await request('GET', '/api/hydration/weekly');
    if (res.status !== 200) {
      throw new Error(`Get weekly hydration failed with status ${res.status}`);
    }
  });

  // 21. Hydration - Get goals
  await test('GET /api/hydration/goals', async () => {
    const res = await request('GET', '/api/hydration/goals');
    if (res.status !== 200) {
      throw new Error(`Get hydration goals failed with status ${res.status}`);
    }
  });

  // 22. Streaks - Get streak summary
  await test('GET /api/streaks', async () => {
    const res = await request('GET', '/api/streaks');
    if (res.status !== 200) {
      throw new Error(`Get streaks failed with status ${res.status}`);
    }
  });

  // 23. Food composition search
  await test('GET /api/foods?q=apple', async () => {
    const res = await request('GET', '/api/foods?q=apple');
    if (res.status !== 200) {
      throw new Error(`Search foods failed with status ${res.status}`);
    }
  });

  // 24. VibeDiet - Generate plan
  await test('POST /api/diet-planner/generate', async () => {
    const res = await request('POST', '/api/diet-planner/generate', {
      goal: 'Weight Loss',
      dietType: 'Vegetarian',
      days: 1,
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Generate diet failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 25. VibeDiet - Get current plan
  await test('GET /api/diet-planner/current', async () => {
    const res = await request('GET', '/api/diet-planner/current');
    if (res.status !== 200) {
      throw new Error(`Get current diet failed with status ${res.status}`);
    }
  });

  // 26. VibeDiet - Get diet history
  await test('GET /api/diet-planner/history', async () => {
    const res = await request('GET', '/api/diet-planner/history');
    if (res.status !== 200) {
      throw new Error(`Get diet history failed with status ${res.status}`);
    }
  });

  // 27. VibeAI - Chat
  await test('POST /api/ai/chat', async () => {
    const res = await request('POST', '/api/ai/chat', {
      message: 'What was my calorie count today?',
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`AI chat failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 28. Food Reactions - Log reaction
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

  // 29. Food Reactions - List
  await test('GET /api/reactions', async () => {
    const res = await request('GET', '/api/reactions');
    if (res.status !== 200) {
      throw new Error(`List reactions failed with status ${res.status}`);
    }
  });

  // 30. Food Reactions - Insights
  await test('GET /api/reactions/insights', async () => {
    const res = await request('GET', '/api/reactions/insights');
    if (res.status !== 200) {
      throw new Error(`Reaction insights failed with status ${res.status}`);
    }
  });

  // 31. Indian INS list
  await test('GET /api/indian/ins', async () => {
    const res = await request('GET', '/api/indian/ins');
    if (res.status !== 200) {
      throw new Error(`List Indian INS failed with status ${res.status}`);
    }
  });

  // 32. Indian INS lookup
  await test('GET /api/indian/ins/lookup?code=100', async () => {
    const res = await request('GET', '/api/indian/ins/lookup?code=100');
    if (res.status !== 200) {
      throw new Error(`Lookup Indian INS failed with status ${res.status}`);
    }
  });

  // 33. Product Recalls
  await test('GET /api/recalls/matches', async () => {
    const res = await request('GET', '/api/recalls/matches');
    if (res.status !== 200) {
      throw new Error(`Get recalls failed with status ${res.status}`);
    }
  });

  // 34. Frontend HTTP checks on Vite dev server (port 5173)
  const clientRoutes = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/scanner',
    '/nutrition',
    '/vibe-diet',
    '/vibe-ai',
    '/reactions',
    '/profiles',
    '/favorites',
    '/hydration',
    '/meal-photo',
  ];

  for (const route of clientRoutes) {
    await test(`Client Route: http://localhost:5173${route}`, async () => {
      return new Promise((resolve, reject) => {
        http.get(`http://localhost:5173${route}`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Vite returned status ${res.statusCode} for ${route}`));
        }).on('error', reject);
      });
    });
  }

  // 35. Frontend /api proxy routing (http://localhost:5173/api/health)
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
