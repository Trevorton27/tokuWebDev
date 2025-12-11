'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  category: string;
  body?: any;
  queryParams?: Record<string, string>;
}

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  duration: number;
}

const endpoints: EndpointTest[] = [
  // User Management
  {
    name: 'List Users',
    method: 'GET',
    endpoint: '/api/admin/users',
    description: 'Get all users',
    category: 'User Management',
    queryParams: { role: 'STUDENT', limit: '10' },
  },
  {
    name: 'Get User Details',
    method: 'GET',
    endpoint: '/api/admin/users/[userId]',
    description: 'Get specific user by ID (replace [userId] with actual ID)',
    category: 'User Management',
  },
  {
    name: 'Create User (Disabled - Use Clerk)',
    method: 'POST',
    endpoint: '/api/admin/users',
    description: 'User creation is handled by Clerk - this will return 501',
    category: 'User Management',
    body: {
      email: 'testuser@example.com',
      name: 'Test User',
      role: 'STUDENT',
    },
  },
  {
    name: 'Update User',
    method: 'PUT',
    endpoint: '/api/admin/users/[userId]',
    description: 'Update user details (replace [userId] with actual ID)',
    category: 'User Management',
    body: {
      name: 'Updated Name',
    },
  },
  {
    name: 'Delete User',
    method: 'DELETE',
    endpoint: '/api/admin/users/[userId]',
    description: 'Delete a user (replace [userId] with actual ID)',
    category: 'User Management',
  },

  // Course Management
  {
    name: 'List Courses',
    method: 'GET',
    endpoint: '/api/admin/courses',
    description: 'Get all courses',
    category: 'Course Management',
    queryParams: { limit: '10' },
  },
  {
    name: 'Get Course Details',
    method: 'GET',
    endpoint: '/api/admin/courses/[courseId]',
    description: 'Get specific course (replace [courseId] with actual ID)',
    category: 'Course Management',
  },
  {
    name: 'Update Course',
    method: 'PUT',
    endpoint: '/api/admin/courses/[courseId]',
    description: 'Update course (replace [courseId] with actual ID)',
    category: 'Course Management',
    body: {
      title: 'Updated Course Title',
      published: true,
    },
  },
  {
    name: 'Delete Course',
    method: 'DELETE',
    endpoint: '/api/admin/courses/[courseId]',
    description: 'Delete course (replace [courseId] with actual ID)',
    category: 'Course Management',
  },

  // Lesson Management
  {
    name: 'List Lessons',
    method: 'GET',
    endpoint: '/api/admin/lessons',
    description: 'Get all lessons',
    category: 'Lesson Management',
    queryParams: { limit: '10' },
  },
  {
    name: 'Create Lesson',
    method: 'POST',
    endpoint: '/api/admin/lessons',
    description: 'Create a new lesson',
    category: 'Lesson Management',
    body: {
      courseId: '[COURSE_ID]',
      title: 'Test Lesson',
      content: 'Lesson content here',
      order: 1,
    },
  },
  {
    name: 'Get Lesson Details',
    method: 'GET',
    endpoint: '/api/admin/lessons/[lessonId]',
    description: 'Get specific lesson (replace [lessonId] with actual ID)',
    category: 'Lesson Management',
  },
  {
    name: 'Update Lesson',
    method: 'PUT',
    endpoint: '/api/admin/lessons/[lessonId]',
    description: 'Update lesson (replace [lessonId] with actual ID)',
    category: 'Lesson Management',
    body: {
      title: 'Updated Lesson Title',
    },
  },
  {
    name: 'Delete Lesson',
    method: 'DELETE',
    endpoint: '/api/admin/lessons/[lessonId]',
    description: 'Delete lesson (replace [lessonId] with actual ID)',
    category: 'Lesson Management',
  },

  // Engagement Tracking
  {
    name: 'Get Engagement Analytics',
    method: 'GET',
    endpoint: '/api/admin/engagement',
    description: 'Get comprehensive engagement data',
    category: 'Engagement',
  },
  {
    name: 'Get User Engagement',
    method: 'GET',
    endpoint: '/api/admin/engagement',
    description: 'Get engagement for specific user',
    category: 'Engagement',
    queryParams: { userId: '[USER_ID]' },
  },

  // Student Roadmaps
  {
    name: 'List Roadmaps',
    method: 'GET',
    endpoint: '/api/admin/roadmaps',
    description: 'Get all roadmaps',
    category: 'Roadmaps',
    queryParams: { limit: '10' },
  },
  {
    name: 'Create Roadmap',
    method: 'POST',
    endpoint: '/api/admin/roadmaps',
    description: 'Create a roadmap item',
    category: 'Roadmaps',
    body: {
      userId: '[USER_ID]',
      title: 'Complete JavaScript Fundamentals',
      itemType: 'COURSE',
      status: 'NOT_STARTED',
      order: 1,
    },
  },
  {
    name: 'Get Roadmap Details',
    method: 'GET',
    endpoint: '/api/admin/roadmaps/[roadmapId]',
    description: 'Get specific roadmap (replace [roadmapId] with actual ID)',
    category: 'Roadmaps',
  },
  {
    name: 'Update Roadmap',
    method: 'PUT',
    endpoint: '/api/admin/roadmaps/[roadmapId]',
    description: 'Update roadmap (replace [roadmapId] with actual ID)',
    category: 'Roadmaps',
    body: {
      status: 'IN_PROGRESS',
    },
  },
  {
    name: 'Delete Roadmap',
    method: 'DELETE',
    endpoint: '/api/admin/roadmaps/[roadmapId]',
    description: 'Delete roadmap (replace [roadmapId] with actual ID)',
    category: 'Roadmaps',
  },

  // LMS Endpoints
  {
    name: 'List Public Courses',
    method: 'GET',
    endpoint: '/api/lms/courses',
    description: 'Get all published courses',
    category: 'LMS',
  },
  {
    name: 'Get Course',
    method: 'GET',
    endpoint: '/api/lms/courses/[courseId]',
    description: 'Get course details (replace [courseId])',
    category: 'LMS',
  },
  {
    name: 'Get Enrollments',
    method: 'GET',
    endpoint: '/api/lms/enrollments',
    description: 'Get user enrollments',
    category: 'LMS',
  },
];

export default function TestEndpoints() {
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [customBody, setCustomBody] = useState('{}');
  const [endpointParams, setEndpointParams] = useState<Record<string, Record<string, string>>>({});

  const categories = ['all', ...Array.from(new Set(endpoints.map(e => e.category)))];

  // Helper to extract parameters from endpoint path
  const extractParams = (endpoint: string): string[] => {
    const matches = endpoint.match(/\[([^\]]+)\]/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  };

  // Helper to check if body has placeholders
  const extractBodyParams = (body: any): string[] => {
    if (!body) return [];
    const bodyStr = JSON.stringify(body);
    const matches = bodyStr.match(/\[([^\]]+)\]/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  };

  // Helper to check if query params have placeholders
  const extractQueryParams = (queryParams?: Record<string, string>): string[] => {
    if (!queryParams) return [];
    const values = Object.values(queryParams);
    const placeholders: string[] = [];
    values.forEach(val => {
      const matches = val.match(/\[([^\]]+)\]/g);
      if (matches) {
        placeholders.push(...matches.map(m => m.slice(1, -1)));
      }
    });
    return placeholders;
  };

  const setParam = (endpointPath: string, paramName: string, value: string) => {
    setEndpointParams(prev => ({
      ...prev,
      [endpointPath]: {
        ...prev[endpointPath],
        [paramName]: value,
      },
    }));
  };

  const testEndpoint = async (test: EndpointTest) => {
    const startTime = Date.now();
    setLoading(test.endpoint);

    console.log('🧪 Testing Endpoint:', {
      name: test.name,
      method: test.method,
      endpoint: test.endpoint,
      body: test.body,
      queryParams: test.queryParams,
    });

    try {
      let url = test.endpoint;
      let body = test.body;
      let queryParams = test.queryParams;

      // Get params for this endpoint
      const params = endpointParams[test.endpoint] || {};

      // Replace path parameters
      const pathParams = extractParams(test.endpoint);
      pathParams.forEach(param => {
        const value = params[param] || '';
        url = url.replace(`[${param}]`, value);
      });

      // Replace body parameters
      if (body) {
        let bodyStr = JSON.stringify(body);
        const bodyParams = extractBodyParams(body);
        bodyParams.forEach(param => {
          const value = params[param] || '';
          bodyStr = bodyStr.replace(`[${param}]`, value);
        });
        body = JSON.parse(bodyStr);
      }

      // Replace query parameters
      if (queryParams) {
        const newQueryParams = { ...queryParams };
        Object.keys(newQueryParams).forEach(key => {
          const queryParamValue = newQueryParams[key];
          const queryParamMatches = queryParamValue.match(/\[([^\]]+)\]/g);
          if (queryParamMatches) {
            queryParamMatches.forEach(match => {
              const param = match.slice(1, -1);
              const value = params[param] || '';
              newQueryParams[key] = newQueryParams[key].replace(match, value);
            });
          }
        });
        queryParams = newQueryParams;
      }

      // Add query parameters
      if (queryParams) {
        const searchParams = new URLSearchParams(queryParams);
        url = `${url}?${searchParams.toString()}`;
      }

      const options: RequestInit = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && (test.method === 'POST' || test.method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        endpoint: url,
        method: test.method,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toISOString(),
        duration,
      };

      console.log('✅ Test Result:', result);
      console.log('📊 Response Data:', data);

      setResults(prev => [result, ...prev]);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint: test.endpoint,
        method: test.method,
        status: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        duration,
      };

      console.error('❌ Test Error:', result);
      setResults(prev => [result, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  const testCustomEndpoint = async () => {
    const startTime = Date.now();
    setLoading(customEndpoint);

    console.log('🧪 Testing Custom Endpoint:', {
      method: customMethod,
      endpoint: customEndpoint,
      body: customBody,
    });

    try {
      const options: RequestInit = {
        method: customMethod,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (customBody && (customMethod === 'POST' || customMethod === 'PUT')) {
        options.body = customBody;
      }

      const response = await fetch(customEndpoint, options);
      const data = await response.json();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        endpoint: customEndpoint,
        method: customMethod,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toISOString(),
        duration,
      };

      console.log('✅ Custom Test Result:', result);
      console.log('📊 Response Data:', data);

      setResults(prev => [result, ...prev]);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint: customEndpoint,
        method: customMethod,
        status: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        duration,
      };

      console.error('❌ Custom Test Error:', result);
      setResults(prev => [result, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  const clearResults = () => {
    setResults([]);
    console.clear();
    console.log('🧹 Results cleared');
  };

  const filteredEndpoints = selectedCategory === 'all'
    ? endpoints
    : endpoints.filter(e => e.category === selectedCategory);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Endpoint Tester</h1>
              <p className="text-gray-600 mt-1">
                Test all admin and public API endpoints
                {user && (
                  <>
                    <br />
                    <span className="font-semibold">Email:</span> {user.emailAddresses[0]?.emailAddress}
                    <br />
                    <span className="font-semibold">Role:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.publicMetadata?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.publicMetadata?.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(user.publicMetadata?.role as string) || 'STUDENT (default)'}
                    </span>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Endpoints */}
          <div>
            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Endpoint Tester */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Endpoint</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint
                  </label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="/api/admin/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                {(customMethod === 'POST' || customMethod === 'PUT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body (JSON)
                    </label>
                    <textarea
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    />
                  </div>
                )}
                <button
                  onClick={testCustomEndpoint}
                  disabled={!customEndpoint || loading === customEndpoint}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading === customEndpoint ? 'Testing...' : 'Test Custom Endpoint'}
                </button>
              </div>
            </div>

            {/* Endpoint List */}
            <div className="space-y-3">
              {filteredEndpoints.map((test, index) => {
                const pathParams = extractParams(test.endpoint);
                const bodyParams = extractBodyParams(test.body);
                const queryParamsPlaceholders = extractQueryParams(test.queryParams);
                const allParams = [...new Set([...pathParams, ...bodyParams, ...queryParamsPlaceholders])];
                const hasParams = allParams.length > 0;

                return (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            test.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            test.method === 'POST' ? 'bg-green-100 text-green-800' :
                            test.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {test.method}
                          </span>
                          <code className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {test.endpoint}
                          </code>
                        </div>
                      </div>
                      <button
                        onClick={() => testEndpoint(test)}
                        disabled={loading === test.endpoint}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                      >
                        {loading === test.endpoint ? 'Testing...' : 'Test'}
                      </button>
                    </div>

                    {/* Parameter inputs */}
                    {hasParams && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-xs font-semibold text-amber-900 mb-2">Required Parameters:</p>
                        <div className="space-y-2">
                          {allParams.map(param => (
                            <div key={param}>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {param}
                              </label>
                              <input
                                type="text"
                                value={endpointParams[test.endpoint]?.[param] || ''}
                                onChange={(e) => setParam(test.endpoint, param, e.target.value)}
                                placeholder={`Enter ${param}`}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {test.body && (
                      <details className="mt-3">
                        <summary className="text-sm text-gray-600 cursor-pointer">
                          View Request Body
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(test.body, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Test Results ({results.length})
              </h2>
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tests run yet. Click "Test" on any endpoint to see results here.
                </p>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`border-l-4 p-4 rounded ${
                        result.success
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            result.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            result.method === 'POST' ? 'bg-green-100 text-green-800' :
                            result.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.method}
                          </span>
                          <code className="ml-2 text-xs text-gray-700">
                            {result.endpoint}
                          </code>
                        </div>
                        <span className={`text-xs font-semibold ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        ⏱️ {result.duration}ms • {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                      {result.error ? (
                        <div className="text-sm text-red-700">
                          ❌ Error: {result.error}
                        </div>
                      ) : (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-700 font-medium">
                            View Response
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto text-black">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
