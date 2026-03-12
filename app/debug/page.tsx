'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testEndpoint = async (method: string, url: string, body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      addResult(`${method} ${url}`, {
        status: response.status,
        statusText: response.statusText,
        data: parsedData,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      addResult(`${method} ${url}`, { error: String(error) });
    }
  };

  const runTests = async () => {
    setResults([]);
    
    // Test basic API route
    await testEndpoint('GET', '/api/test');
    await testEndpoint('POST', '/api/test', { test: 'data' });
    await testEndpoint('PUT', '/api/test', { test: 'put data' });
    
    // Test page-config endpoints
    await testEndpoint('GET', '/api/page-config');
    await testEndpoint('PUT', '/api/page-config', {
      page2Components: ['about_me'],
      page3Components: ['address', 'birthdate']
    });
    
    // Test other endpoints
    await testEndpoint('GET', '/api/profiles');
    await testEndpoint('GET', '/api/users?email=test@example.com');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">API Debug Page</h1>
        
        <button
          onClick={runTests}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mb-8"
        >
          Run API Tests
        </button>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded p-4">
              <h3 className="font-semibold text-lg mb-2">{result.test}</h3>
              <p className="text-sm text-gray-500 mb-2">{result.timestamp}</p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}