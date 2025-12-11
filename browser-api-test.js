// Signal Works LMS - Browser API Test Suite
// Copy and paste this entire script into your browser console while signed in

(async function testAllEndpoints() {
  console.clear();
  console.log('🧪 Signal Works LMS - API Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  // Helper function to test an endpoint
  async function testEndpoint(name, method, url, body = null) {
    results.total++;
    const startTime = performance.now();

    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();
      const duration = Math.round(performance.now() - startTime);

      const success = response.ok;
      const emoji = success ? '✅' : '❌';
      const color = success ? 'color: green' : 'color: red';

      console.log(`${emoji} ${name}`);
      console.log(`   %c${method} ${url}`, 'color: blue');
      console.log(`   Status: %c${response.status}%c | Duration: ${duration}ms`, color, '');
      console.log(`   Response:`, data);
      console.log('');

      results.details.push({
        name,
        method,
        url,
        status: response.status,
        success,
        duration,
        data
      });

      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }

      return { success, data, status: response.status };
    } catch (error) {
      results.failed++;
      console.error(`❌ ${name} - ERROR`);
      console.error(`   ${error.message}`);
      console.log('');

      results.details.push({
        name,
        method,
        url,
        status: 0,
        success: false,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Store IDs from responses for follow-up tests
  const ids = {
    userId: null,
    courseId: null,
    lessonId: null,
    roadmapId: null
  };

  console.log('📋 USER MANAGEMENT TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 1: List Users
  const usersResult = await testEndpoint(
    'List Users',
    'GET',
    '/api/admin/users?limit=5'
  );
  if (usersResult.success && usersResult.data?.data?.users?.length > 0) {
    ids.userId = usersResult.data.data.users[0].id;
    console.log(`   💾 Saved userId: ${ids.userId}`);
    console.log('');
  }

  // Test 2: Get User Details (if we have a userId)
  if (ids.userId) {
    await testEndpoint(
      'Get User Details',
      'GET',
      `/api/admin/users/${ids.userId}`
    );
  }

  console.log('📚 COURSE MANAGEMENT TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 3: List Courses
  const coursesResult = await testEndpoint(
    'List Courses',
    'GET',
    '/api/admin/courses?limit=5'
  );
  if (coursesResult.success && coursesResult.data?.data?.courses?.length > 0) {
    ids.courseId = coursesResult.data.data.courses[0].id;
    console.log(`   💾 Saved courseId: ${ids.courseId}`);
    console.log('');
  }

  // Test 4: Get Course Details (if we have a courseId)
  if (ids.courseId) {
    await testEndpoint(
      'Get Course Details',
      'GET',
      `/api/admin/courses/${ids.courseId}`
    );
  }

  console.log('📖 LESSON MANAGEMENT TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 5: List Lessons
  const lessonsResult = await testEndpoint(
    'List Lessons',
    'GET',
    '/api/admin/lessons?limit=5'
  );
  if (lessonsResult.success && lessonsResult.data?.data?.lessons?.length > 0) {
    ids.lessonId = lessonsResult.data.data.lessons[0].id;
    console.log(`   💾 Saved lessonId: ${ids.lessonId}`);
    console.log('');
  }

  // Test 6: Get Lesson Details (if we have a lessonId)
  if (ids.lessonId) {
    await testEndpoint(
      'Get Lesson Details',
      'GET',
      `/api/admin/lessons/${ids.lessonId}`
    );
  }

  console.log('📊 ENGAGEMENT TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 7: Get Engagement Analytics
  await testEndpoint(
    'Get Engagement Analytics',
    'GET',
    '/api/admin/engagement'
  );

  // Test 8: Get User Engagement (if we have a userId)
  if (ids.userId) {
    await testEndpoint(
      'Get User Engagement',
      'GET',
      `/api/admin/engagement?userId=${ids.userId}`
    );
  }

  console.log('🗺️  ROADMAP TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 9: List Roadmaps
  const roadmapsResult = await testEndpoint(
    'List Roadmaps',
    'GET',
    '/api/admin/roadmaps?limit=5'
  );
  if (roadmapsResult.success && roadmapsResult.data?.data?.roadmaps?.length > 0) {
    ids.roadmapId = roadmapsResult.data.data.roadmaps[0].id;
    console.log(`   💾 Saved roadmapId: ${ids.roadmapId}`);
    console.log('');
  }

  // Test 10: Get Roadmap Details (if we have a roadmapId)
  if (ids.roadmapId) {
    await testEndpoint(
      'Get Roadmap Details',
      'GET',
      `/api/admin/roadmaps/${ids.roadmapId}`
    );
  }

  console.log('🌐 PUBLIC LMS TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 11: List Public Courses
  await testEndpoint(
    'List Public Courses',
    'GET',
    '/api/lms/courses'
  );

  // Test 12: Get Public Course (if we have a courseId)
  if (ids.courseId) {
    await testEndpoint(
      'Get Public Course',
      'GET',
      `/api/lms/courses/${ids.courseId}`
    );
  }

  // Test 13: Get Enrollments
  await testEndpoint(
    'Get Enrollments',
    'GET',
    '/api/lms/enrollments'
  );

  // Print Summary
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Total Tests: ${results.total}`);
  console.log(`%c✅ Passed: ${results.passed}`, 'color: green; font-weight: bold');
  console.log(`%c❌ Failed: ${results.failed}`, results.failed > 0 ? 'color: red; font-weight: bold' : '');
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  console.log('');

  // Store results in window for inspection
  window.apiTestResults = results;
  console.log('💾 Full results saved to: window.apiTestResults');
  console.log('   Access with: apiTestResults.details');
  console.log('');

  // Print failed tests if any
  if (results.failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.details.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.name} - Status: ${r.status || 'ERROR'}`);
      if (r.error) console.log(`     Error: ${r.error}`);
    });
    console.log('');
  }

  // Print collected IDs for manual testing
  console.log('🔑 COLLECTED IDS (for manual testing):');
  console.log('   userId:', ids.userId || 'N/A');
  console.log('   courseId:', ids.courseId || 'N/A');
  console.log('   lessonId:', ids.lessonId || 'N/A');
  console.log('   roadmapId:', ids.roadmapId || 'N/A');
  console.log('');

  return results;
})();
