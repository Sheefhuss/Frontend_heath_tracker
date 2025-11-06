import React, { useState } from 'react';

const BACKEND_URL = 'https://innovative-project-health-tracker-backend.onrender.com'; 

function Login({ onFormSwitch, onLoginSuccess }) { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // *** REMOVED: const deriveUserId = ... ***

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    try {
        // 1. Authenticate User
        const authResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        // --- CRITICAL CHECK: HANDLE AUTHENTICATION FAILURE ---
        if (!authResponse.ok) {
            const errorData = await authResponse.json();
            alert('Login Failed: ' + (errorData.message || 'Invalid email or password.'));
            setLoading(false);
            return; 
        }

        // 2. Auth succeeds, process response
        const authSuccessData = await authResponse.json(); 
        
        // Retrieve the CORRECT userId from the backend's response
        const currentUserId = authSuccessData.user.userId;
        
        // 3. Fetch profile data using the confirmed, unique userId
        const profileUrl = `${BACKEND_URL}/api/profile/${currentUserId}`;
        
        const profileResponse = await fetch(profileUrl);
        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
            alert(`Login successful for ${profileData.name || 'User'}!`);
            
            // Pass the profile data to App.js 
            onLoginSuccess(profileData);
        } else {
            alert('Login successful, but failed to fetch profile data.');
        }

    } catch (error) {
        alert('Network Error: Could not connect to the backend server (port 5000).');
        console.error('Network error during login:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #3498db', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h1>User Login</h1>
      <form onSubmit={handleLogin}>
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Email:</label>
        <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required />
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Password:</label>
        <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required />
        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }} 
          disabled={loading} 
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        Don't have an account? 
        <button onClick={() => onFormSwitch('signup')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>Sign Up</button>
      </p>
    </div>
  );
}

export default Login;
