import React, { useEffect, useState } from 'react';
import useAuthStore from '../../stores/authStore';
import axios from 'axios';

const AuthTest = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [testResult, setTestResult] = useState('');

  const testAuth = async () => {
    console.log('=== TESTING AUTH ===');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated);
    
    try {
      // Test 1: Check /api/auth/me
      console.log('Testing /api/auth/me...');
      const meResponse = await axios.get('/api/auth/me');
      console.log('ME Response:', meResponse.data);
      
      // Test 2: Check /api/admin/stats
      console.log('Testing /api/admin/stats...');
      const statsResponse = await axios.get('/api/admin/stats');
      console.log('Stats Response:', statsResponse.data);
      
      setTestResult('✅ Both endpoints work!');
    } catch (error) {
      console.error('Auth test failed:', error.response?.data);
      setTestResult(`❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Auth Test Component</h2>
      <div className="space-y-2">
        <p><strong>Token:</strong> {token ? 'Presente' : 'Ausente'}</p>
        <p><strong>Token (first 20 chars):</strong> {token ? token.substring(0, 20) + '...' : 'N/A'}</p>
        <p><strong>User:</strong> {user?.name || 'N/A'}</p>
        <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Test Result:</strong> {testResult}</p>
      </div>
      <button 
        onClick={testAuth}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default AuthTest; 