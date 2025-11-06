import React from 'react';
import chatbotIcon from './chatbot_icon.gif'; 

function FloatingChatButton({ onClick }) {
    return (
        <button 
            onClick={onClick}
            style={buttonStyles.container}
            title="Need Help or Suggestions? Ask our AI Coach!"
        >
            <img 
                src={chatbotIcon} 
                alt="AI Chatbot Icon" 
                style={buttonStyles.icon} 
            />
            <span style={buttonStyles.text}>Need Help or Suggestions?</span>
        </button>
    );
}

// --- Inside FloatingChatButton.js ---

const buttonStyles = {
    container: {
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000, 
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '35px', // Increased border radius slightly for the new size
        padding: '8px 20px 8px 8px', // Increased padding for better visibility
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        // Note: The ':hover' styles should be applied using React's useState/onMouseEnter/onMouseLeave
    },
    icon: {
        width: '60px',  // *** INCREASED SIZE: 60px ***
        height: '60px', // *** INCREASED SIZE: 60px ***
        borderRadius: '50%',
        marginRight: '10px',
        backgroundColor: 'white', 
    },
    text: {
        fontWeight: 'bold',
        fontSize: '20px', 
    }
};

export default FloatingChatButton;