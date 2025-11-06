import React, { useState } from 'react';
function FoodLog({ userId }) { 
  const [foodItem, setFoodItem] = useState('');
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('Breakfast');

  const handleLog = async (e) => {
    e.preventDefault();
    if (!userId) {
        alert('Error: Cannot log meal. User ID is missing (Please ensure you are logged in).');
        return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/foodlog/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodItem: foodItem.toLowerCase(), grams: Number(grams), mealType, userId }) 
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${foodItem} logged with ${data.calories} kcal`);
        setFoodItem('');
        setGrams('');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Network error. Try again.');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '450px', margin: '50px auto', border: '1px solid #ff9800', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1>Log Your Meal</h1>
      <form onSubmit={handleLog}>
        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Meal Type:</label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }}>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>

        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Food Item:</label>
        <input type="text" placeholder="e.g., Apple, Dal, Roti" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required />

        <label style={{ display: 'block', margin: '10px 0 5px 0', textAlign: 'left' }}>Grams:</label>
        <input type="number" placeholder="e.g., 100" value={grams} onChange={(e) => setGrams(e.target.value)} style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px' }} required min="1" />

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}>Log Food</button>
      </form>
    </div>
  );
}

export default FoodLog;