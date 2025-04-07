import { useEffect, useState } from 'react';
import { testDatabase } from '../utils/testDatabase';

export default function TestDatabase() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    // Redirect console.log to our state
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      setTestResults(prev => [...prev, args.join(' ')]);
      originalConsoleLog(...args);
    };

    try {
      await testDatabase();
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
      console.log = originalConsoleLog;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Database Tests</h1>
        
        <button
          onClick={runTests}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </button>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 