import React, { useState } from 'react';

const BACKEND_URL = 'https://innovative-project-health-tracker-backend.onrender.com'; 

function Signup({ onFormSwitch }) { 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        // --- CRITICAL CHECK: HANDLE REGISTRATION FAILURE (e.g., User Already Exists) ---
        if (!response.ok) {
            alert('Registration Failed: ' + (data.message || 'User with this email already exists.'));
            setLoading(false);
            return;
        }

        // --- SUCCESS ---
        alert(`${name} successfully registered! Please log in.`);
        onFormSwitch('login'); 

    } catch (error) {
        alert('Network Error: Could not connect to the backend server (port 5000).');
        console.error('Network error during signup:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #4CAF50', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0 0 0, 0.1)' }}>
      <h1>User Registration Form</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Name:</label>
        <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required />
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Email:</label>
        <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required />
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Password:</label>
        <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required />
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }} disabled={loading}>{loading ? 'Registering...' : 'Sign Up'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        Already have an account? 
        <button onClick={() => onFormSwitch('login')} style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>Login</button>
      </p>
    </div>
  );
}

export default Signup;
