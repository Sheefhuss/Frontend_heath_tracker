import React, { useState } from 'react'; // *** REMOVED useEffect ***

const BACKEND_URL = 'https://innovative-project-health-tracker-backend.onrender.com'; 

// Helper to generate User ID (Must match the logic in App.js)
const generateUserId = (userName) => {
  return userName ? userName.toLowerCase().replace(/\s/g, '-') + '-unique-id' : 'default-user-id';
}

// *** IMPORTANT: The component now receives 'initialData' from App.js ***
function UserProfile({ onProfileSave, initialData }) { 
  // Initialize state using initialData (if provided)
  const [name, setName] = useState(initialData?.name || '');
  const [age, setAge] = useState(initialData?.age || '');
  const [height, setHeight] = useState(initialData?.height || ''); // cm
  const [weight, setWeight] = useState(initialData?.weight || ''); // kg
  const [gender, setGender] = useState(initialData?.gender || 'female');
  const [goal, setGoal] = useState(initialData?.goal || 'Maintain Weight'); 
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => { 
    e.preventDefault();
    setLoading(true);

    const userId = generateUserId(name);

    // 1. Prepare the payload with data types for the backend
    const profilePayload = { 
        userId,
        name, 
        age: Number(age), 
        height: Number(height), 
        weight: Number(weight), 
        gender, 
        goal 
    };
    
    // Check for essential data before sending
    if (!name || !height || !weight || !age) {
        alert('Please fill in all profile fields.');
        setLoading(false);
        return;
    }

    try {
        // 2. API Call to MongoDB Backend (Simulated endpoint)
        const response = await fetch(`${BACKEND_URL}/api/profile/save`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profilePayload),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('PROFILE SAVED TO DB:', data);
            alert(`Profile for ${name} saved successfully to MongoDB! Redirecting to Dashboard.`);

            // 3. Call the parent handler to update App.js local state and redirect to dashboard
            onProfileSave(profilePayload); 
        } else {
            alert('Failed to save profile: ' + data.message);
        }
    } catch (error) {
        console.error('Network or Server Error during profile save:', error);
        alert('Network error. Check your server connection on port 5000.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1>Set Up Your Profile (Health Data)</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Name:</label>
        {/* Name is pre-filled/read-only if initialData exists from Login */}
        <input 
            type="text" 
            placeholder="Your Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: initialData?.name ? '#eee' : 'white' }} 
            required 
            readOnly={!!initialData?.name} // Make read-only after first login fetch
        />
        
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }}>
             <option value="female">Female</option>
             <option value="male">Male</option>
        </select>

        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Age (years):</label>
        <input type="number" placeholder="Enter age" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required min="10" />
        
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Height (cm):</label>
        <input type="number" placeholder="Enter height in cm (e.g., 170)" value={height} onChange={(e) => setHeight(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required min="50" />
        
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Weight (kg):</label>
        <input type="number" placeholder="Enter weight in kg (e.g., 75)" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required min="20" />
        
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Fitness Goal:</label>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }}>
             <option value="Maintain Weight">Maintain Weight</option>
             <option value="Lose Weight">Lose Weight (Weight Loss)</option>
             <option value="Gain Weight">Gain Weight (Muscle Gain)</option>
        </select>
        
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile & Go to Dashboard'}
        </button>
      </form>
    </div>
  );
}

export default UserProfile;
