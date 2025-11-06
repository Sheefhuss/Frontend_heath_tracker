import React, { useState, useEffect } from 'react';
// Core components
import Signup from './components/Signup'; 
import Login from './components/Login'; 
import UserProfile from './components/Userprofile.js'; 
import FoodLog from './components/Foodlog.js'; 
import HealthDashboard from './components/HealthDashboard';
// New Feature components
import AiChatbot from './components/Aichatbot.js'; // Using the disk name Aichatbot.js to resolve the error
import FloatingChatButton from './components/FloatingChatButton.js';
import './App.css'; 

function App() {
  const [currentForm, setCurrentForm] = useState('signup'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null); 
  const [userId, setUserId] = useState(null); 

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }

  const generateUserId = (data) => {
    return (data && data.name) ? data.name.toLowerCase().replace(/\s/g, '-') + '-unique-id' : 'default-user-id';
  }

  const handleLoginSuccess = (profileData) => {
    setIsLoggedIn(true);
    const currentUserId = generateUserId(profileData);
    setUserId(currentUserId); 
    setUserProfileData(profileData); 
    const isProfileComplete = profileData && profileData.name && profileData.weight && profileData.height;

    if (!isProfileComplete) {
      setCurrentForm('profile');
    } else {
      setCurrentForm('dashboard');
    }
  }

  const handleProfileSave = (profileData) => {
    setUserProfileData(profileData);
    const currentUserId = userId || generateUserId(profileData);
    setUserId(currentUserId); 
    setCurrentForm('dashboard'); 
  }
  
  // Personalized Reminder Logic
  useEffect(() => {
    if (isLoggedIn && userProfileData && userProfileData.name) {
      const { name, weight, goal } = userProfileData;
      
      const waterGoalLiters = weight ? (weight * 0.033).toFixed(2) : 'N/A'; 
      
      const reminderMessage = 
        `Welcome back, ${name}!\n\n` +
        `Goal Reminder: Your current goal is to ${goal || 'N/A'}.\n` +
        `Hydration Target: Your daily water goal is ${waterGoalLiters} Liters.\n\n` +
        `Don't forget to log your breakfast and stay hydrated!`;
        
      alert(reminderMessage);
    }
  }, [isLoggedIn, userProfileData]);


  const NavBar = () => (
    <nav style={navStyles.nav}>
      <h3 style={{...navStyles.link, fontWeight: '900', color: '#FFF', fontSize: '20px'}}>FITNESS TRACKER</h3>
      <div style={{ marginLeft: 'auto' }}>
      {isLoggedIn && userProfileData ? (
        <>
          <button style={navStyles.button} onClick={() => toggleForm('dashboard')}>Dashboard</button>
          <button style={navStyles.button} onClick={() => toggleForm('foodlog')}>Log Meal</button>
          {/* AI Chat button removed from navbar, now floating */}
          <button style={navStyles.button} onClick={() => toggleForm('profile')}>Edit Profile</button>
        </>
      ) : (
        <>
          <button style={navStyles.button} onClick={() => toggleForm('signup')}>Sign Up</button>
          <button style={navStyles.button} onClick={() => toggleForm('login')}>Login</button>
        </>
      )}
      {isLoggedIn && (
        <button style={{...navStyles.button, backgroundColor: '#e74c3c'}} onClick={() => { 
            setIsLoggedIn(false); 
            setUserProfileData(null); 
            setUserId(null); 
            toggleForm('login'); 
        }}>Logout</button>
      )}
      </div>
    </nav>
  );

  let ComponentToDisplay;

  if (currentForm === 'login') {
    ComponentToDisplay = <Login onFormSwitch={toggleForm} onLoginSuccess={handleLoginSuccess} />; 
  } else if (currentForm === 'signup') {
    ComponentToDisplay = <Signup onFormSwitch={toggleForm} />;
  } else if (currentForm === 'profile') {
    ComponentToDisplay = <UserProfile onProfileSave={handleProfileSave} initialData={userProfileData} />;
  } else if (currentForm === 'dashboard') {
    ComponentToDisplay = userProfileData && userProfileData.name ? 
      <HealthDashboard userProfile={userProfileData} userId={userId} /> : 
      <h1>Please Complete Your Profile First to see your health data.</h1>;
  } else if (currentForm === 'foodlog') {
    ComponentToDisplay = <FoodLog userId={userId} />;
  } else if (currentForm === 'chatbot') { 
    ComponentToDisplay = <AiChatbot userProfile={userProfileData} userId={userId} />;
  } else {
    ComponentToDisplay = <h1>Welcome to Health Tracker! Please Login/Sign Up.</h1>; 
  }

  return (
    <div className="App">
      <NavBar />
      {ComponentToDisplay}
      
      {/* FLOATING CHAT BUTTON */}
      {isLoggedIn && (
        <FloatingChatButton 
            onClick={() => toggleForm('chatbot')} 
        />
      )}
    </div>
  );
}

const navStyles = {
    nav: {
        backgroundColor: '#2c3e50',
        padding: '10px 30px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    },
    button: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '10px 18px',
        marginLeft: '15px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'background-color 0.2s',
    },
    link: {
        color: '#ecf0f1',
        textDecoration: 'none',
        padding: '8px 15px',
    }
};

export default App;