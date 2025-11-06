import React, { useState, useEffect, useMemo, useCallback } from 'react';

const BACKEND_URL = 'https://innovative-project-health-tracker-backend.onrender.com'; 
const WATER_GOAL_LITERS_PER_KG = 0.033;

const BarChart = ({ data, goal }) => {
    const last7Days = data.slice(0, 7).reverse();
    
    if (last7Days.length === 0) return <p style={{textAlign: 'center', color: '#7f8c8d', padding: '20px'}}>Log a meal to see your chart!</p>;

    const maxCalorie = Math.max(...last7Days.map(d => d.totalCalories), Number(goal) * 1.2 || 3000);
    const chartHeight = 200; 
    const barWidth = 40;
    const barSpacing = 20;
    const padding = 50;
    const chartWidth = last7Days.length * (barWidth + barSpacing) + padding;
    
    const calorieGoal = Number(goal) || 2000;
    const hasGoalLine = maxCalorie > 0 && calorieGoal > 0;

    return (
        <div style={{ padding: '20px', overflowX: 'auto', textAlign: 'center' }}>
            <h3 style={{color: '#2c3e50', marginBottom: '25px', fontSize: '20px'}}>Weekly Calorie Trend vs Goal ({calorieGoal} kcal)</h3>
            <svg 
                width="100%" 
                height={chartHeight + padding} 
                viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`} 
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                    display: 'block', 
                    margin: '0 auto', 
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)' 
                }}
            >
                <defs>
                    <linearGradient id="barGradientGood" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: "#4CAF50", stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: "#2ecc71", stopOpacity: 0.7}} />
                    </linearGradient>
                     <linearGradient id="barGradientOver" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: "#e67e22", stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: "#f39c12", stopOpacity: 0.7}} />
                    </linearGradient>
                    <filter id="dropshadow" height="130%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                        <feOffset dx="1" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5"/>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <line x1="30" y1="10" x2="30" y2={chartHeight + 10} stroke="#bdc3c7" strokeWidth="1" />
                
                {hasGoalLine && (
                    <g>
                        <line 
                            x1="30" 
                            y1={chartHeight - (calorieGoal / maxCalorie) * chartHeight + 10} 
                            x2={chartWidth - 10} 
                            y2={chartHeight - (calorieGoal / maxCalorie) * chartHeight + 10} 
                            stroke="#e74c3c" 
                            strokeWidth="2"
                            strokeDasharray="4,4"
                        />
                        <text x="25" y={chartHeight - (calorieGoal / maxCalorie) * chartHeight + 15} textAnchor="end" fontSize="10" fill="#e74c3c" fontWeight="bold">
                            Goal
                        </text>
                    </g>
                )}
                
                <line x1="30" y1={chartHeight + 10} x2={chartWidth - 10} y2={chartHeight + 10} stroke="#2c3e50" strokeWidth="2" />
                
                {last7Days.map((d, index) => {
                    const barHeight = (d.totalCalories / maxCalorie) * chartHeight;
                    const x = padding + index * (barWidth + barSpacing);
                    const y = chartHeight - barHeight + 10;
                    
                    const gradientId = d.totalCalories > calorieGoal ? 'barGradientOver' : 'barGradientGood';

                    return (
                        <g key={d.displayDate}>
                            <rect 
                                x={x} 
                                y={y} 
                                width={barWidth} 
                                height={barHeight} 
                                fill={`url(#${gradientId})`}
                                rx="5" 
                                filter="url(#dropshadow)" 
                            />
                            <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2c3e50">
                                {d.totalCalories}
                            </text>
                            <text x={x + barWidth / 2} y={chartHeight + 30} textAnchor="middle" fontSize="12" fill="#7f8c8d" fontWeight="500">
                                {d.displayDate.split(',')[0]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


function HealthDashboard({ userProfile, userId }) { 
  const [foodLogs, setFoodLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showHistory, setShowHistory] = useState(false); 
  
  const [waterIntakeMl, setWaterIntakeMl] = useState(0); 
  const [waterLoading, setWaterLoading] = useState(false);
  
  const { name, age, height, weight, gender, goal } = userProfile || {};
  
  const heightInMeters = height / 100;

  const fetchWaterIntake = useCallback(async () => {
      if (!userId) return;
      setWaterLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const savedIntake = localStorage.getItem(`waterIntake_${userId}`);
      setWaterIntakeMl(Number(savedIntake) || 0);

      setWaterLoading(false);
  }, [userId]);

  const saveWaterIntake = useCallback((newIntake) => {
      localStorage.setItem(`waterIntake_${userId}`, newIntake);
      setWaterIntakeMl(newIntake);
  }, [userId]);


  const handleAddWater = (ml) => {
      const newIntake = waterIntakeMl + ml;
      saveWaterIntake(newIntake);
  };

  const handleResetWater = () => {
      if (window.confirm("Are you sure you want to reset your water intake for today?")) {
        saveWaterIntake(0);
      }
  };


  const fetchLogs = useCallback(async () => {
    if (!userId) {
        console.error('Cannot fetch logs: userId is missing.');
        setLoadingLogs(false);
        return;
    }
    
    try {
      setLoadingLogs(true);
      const response = await fetch(`${BACKEND_URL}/api/foodlog/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setFoodLogs(data.data); 
      } else {
        console.error('Failed to fetch logs:', data.message);
        setFoodLogs([]); 
      }
    } catch (error) {
      console.error('Network error fetching logs:', error);
      setFoodLogs([]); 
    } finally {
      setLoadingLogs(false);
    }
  }, [userId]); 

  useEffect(() => {
    fetchLogs();
    fetchWaterIntake();
  }, [fetchLogs, fetchWaterIntake]);

  const handleDeleteLog = async (logId, foodItem) => {
    if (!logId) {
        alert('Error: Cannot delete log. Log ID is missing.');
        console.error('Deletion failed: logId is undefined or null.');
        return;
    }
    
    if (!window.confirm(`Are you sure you want to delete the log for "${foodItem}"?`)) {
      return;
    }

    try {
      const deleteUrl = `${BACKEND_URL}/api/foodlog/${logId}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE', 
      });

      if (response.ok) {
        alert(`${foodItem} successfully deleted!`);
        fetchLogs(); 
      } else {
        try {
            const data = await response.json();
            alert('Deletion Failed: ' + data.message);
        } catch (jsonError) {
            alert('Deletion Failed. Server did not return a valid response (404/500). Please check backend terminal.');
        }
      }
    } catch (error) {
      console.error('Network error during deletion:', error);
      alert('Network error during deletion. Check your server connection on port 5000.');
    }
  };

  const processedDailyLogs = useMemo(() => {
    if (!foodLogs || foodLogs.length === 0) return [];

    const grouped = foodLogs.reduce((acc, log) => {
      const date = new Date(log.date);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          totalCalories: 0,
          meals: [],
          displayDate: date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
        };
      }
      
      const calories = Number(log.calories);
      if (!isNaN(calories)) {
         acc[dateKey].totalCalories += calories;
      }
      
      acc[dateKey].meals.push(log);
      
      return acc;
    }, {});

    return Object.keys(grouped)
      .map(date => grouped[date])
      .sort((a, b) => new Date(b.meals[0].date) - new Date(a.meals[0].date)); 
      
  }, [foodLogs]);

  const calorieStats = useMemo(() => {
    if (processedDailyLogs.length === 0) {
      return { avg: 'N/A', high: 'N/A', days: 0 };
    }

    const dailyTotals = processedDailyLogs.map(day => day.totalCalories);
    const totalDays = dailyTotals.length;
    const totalSum = dailyTotals.reduce((sum, total) => sum + total, 0);

    return {
      avg: (totalSum / totalDays).toFixed(0),
      high: Math.max(...dailyTotals),
      days: totalDays,
    };
  }, [processedDailyLogs]);

  const bmi = weight && heightInMeters ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : 'N/A';
  
  let bmiCategory = 'N/A';
  if (bmi !== 'N/A') {
    if (bmi < 18.5) bmiCategory = 'Underweight (malnutrition need to work on your diet)';
    else if (bmi >= 18.5 && bmi < 24.9) bmiCategory = 'Healthy Weight (good health and healthy [person])';
    else if (bmi >= 25 && bmi < 29.9) bmiCategory = 'Overweight (fat need to work on your diet)';
    else if (bmi >= 30) bmiCategory = 'Obese (fat, with  various health issue)';
    else bmiCategory = 'Obese (fat, with  various health issue)';
  }

  let bmr = 'N/A';
  if (weight && height && age && gender) {
    if (gender === 'male') {
      bmr = ((10 * weight) + (6.25 * height) - (5 * age) + 5).toFixed(0); 
    } else {
      bmr = ((10 * weight) + (6.25 * height) - (5 * age) - 161).toFixed(0); 
    }
  }
  
  const TDEE_CALORIE_GOAL = (() => {
      if (weight && height && age && gender) {
          const activityMultiplier = 1.2; 
          let calculatedBMR = (gender === 'male') ? ((10 * weight) + (6.25 * height) - (5 * age) + 5) : ((10 * weight) + (6.25 * height) - (5 * age) - 161);
          let calculatedTDEE = calculatedBMR * activityMultiplier;
          
          if (goal === 'Lose Weight') {
            return (calculatedTDEE - 500).toFixed(0); 
          } else if (goal === 'Gain Weight') {
            return (calculatedTDEE * 1.15).toFixed(0); 
          } else {
            return calculatedTDEE.toFixed(0); 
          }
      }
      return null;
  })();

  const activityMultiplier = 1.2; 
  const tdee = bmr !== 'N/A' ? (bmr * activityMultiplier).toFixed(0) : 'N/A';

  let calorieGoal = 'N/A';
  if (tdee !== 'N/A') {
    if (goal === 'Lose Weight') {
      calorieGoal = (tdee - 500).toFixed(0); 
    } else if (goal === 'Gain Weight') {
      calorieGoal = (tdee * 1.15).toFixed(0); 
    } else {
      calorieGoal = tdee; 
    }
  }

  const waterGoalLiters = weight ? (weight * WATER_GOAL_LITERS_PER_KG).toFixed(2) : 'N/A'; 
  const waterGoalMl = waterGoalLiters !== 'N/A' ? waterGoalLiters * 1000 : 0;
  
  const waterIntakeLiters = (waterIntakeMl / 1000).toFixed(2);
  const waterIntakeGlasses = Math.floor(waterIntakeLiters * 4);
  const waterGoalGlasses = Math.floor(waterGoalLiters * 4);

  const dietSuggestion = {
    'Lose Weight': 'Focus on Calorie Deficit: High protein, high fiber, low simple carbs. Eat plenty of non-starchy vegetables, lean protein (chicken/fish/paneer), and stay hydrated. Avoid sugary drinks.',
    'Gain Weight': 'Focus on Calorie Surplus: Eat 5-6 meals a day. Include calorie-dense foods like rice, potatoes, nuts/seeds, dairy, and constant high-quality protein for muscle repair.',
    'Maintain Weight': 'Focus on Balance: Eat close to your TDEE. Include whole grains, lean protein, and all food groups. Limit processed snacks and prioritize home-cooked meals.',
  }[goal] || 'Eat a balanced diet with lots of fruits and vegetables.';
  
  return (
    <div style={styles.dashboardContainer}>
      <h1 style={styles.header}>Welcome, {name || 'Health User'}!</h1>
      <p style={styles.subheader}>
        Your Health Goal: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{goal || 'N/A'}</span>
      </p>

      <div style={styles.statsGrid}>
        <div style={{...styles.card, borderTop: '5px solid #3498db'}}>
          <h2 style={styles.cardTitle}>BMI (Body Mass Index)</h2>
          <p style={{...styles.bigNumber, color: '#3498db'}}>{bmi}</p>
          <p style={styles.cardInfo}>Height: {height} cm | Weight: {weight} kg</p>
          <p style={styles.bmiCategory}>{bmiCategory}</p>
        </div>

        <div style={{...styles.card, borderTop: '5px solid #FF5733'}}>
          <h2 style={styles.cardTitle}>Daily Calorie Goal</h2>
          <p style={{...styles.bigNumber, color: '#FF5733'}}>
            {calorieGoal} <span style={{fontSize: '20px'}}>kcal</span>
          </p>
          <p style={styles.cardInfo}>Your BMR (Resting Calories): {bmr} kcal</p>
          <p style={styles.cardInfo}>TDEE (Total Burn): {tdee} kcal</p>
        </div>

        <div style={{...styles.card, borderTop: '5px solid #4CAF50'}}>
          <h2 style={styles.cardTitle}>Water Intake Goal</h2>
          <p style={{...styles.bigNumber, color: '#4CAF50'}}>
            {waterIntakeLiters} / {waterGoalLiters} <span style={{fontSize: '20px'}}>Liters</span>
          </p>
          <p style={styles.cardInfo}>Progress: {waterIntakeGlasses} out of {waterGoalGlasses} glasses (250ml)</p>

          <div style={waterStyles.trackerButtons}>
              <button onClick={() => handleAddWater(250)} style={waterStyles.addButton}>+1 Glass (250ml)</button>
              <button onClick={() => handleAddWater(1000)} style={waterStyles.addButton}>+1 Liter</button>
              <button onClick={handleResetWater} style={waterStyles.resetButton} disabled={waterIntakeMl === 0}>Reset</button>
          </div>
          {waterLoading && <p style={{fontSize: '12px', color: '#7f8c8d'}}>Loading water history...</p>}
        </div>
      </div>

      <div style={styles.dietPlan}>
        <h2 style={styles.dietTitle}>Personalized Diet Suggestion ({goal || "N/A"})</h2>
        <p style={styles.dietText}>{dietSuggestion}</p>
      </div>

      <div style={styles.statsViewContainer}>
        <h2 style={styles.statsViewTitle}>Calorie Intake Statistics</h2>
        <div style={styles.statsGrid}>
            <div style={{...styles.statCard, borderLeft: '5px solid #FF5733'}}>
                <h3 style={styles.statCardTitle}>Avg. Daily Calories</h3>
                <p style={styles.statCardValue}>{calorieStats.avg} <span style={styles.statCardUnit}>kcal</span></p>
            </div>
            <div style={{...styles.statCard, borderLeft: '5px solid #3498db'}}>
                <h3 style={styles.statCardTitle}>Highest Day Intake</h3>
                <p style={styles.statCardValue}>{calorieStats.high} <span style={styles.statCardUnit}>kcal</span></p>
            </div>
            <div style={{...styles.statCard, borderLeft: '5px solid #4CAF50'}}>
                <h3 style={styles.statCardTitle}>Days Logged</h3>
                <p style={styles.statCardValue}>{calorieStats.days} <span style={styles.statCardUnit}>days</span></p>
            </div>
        </div>
        
        <BarChart data={processedDailyLogs} goal={TDEE_CALORIE_GOAL} />
      </div>
      
      <div style={styles.logHistoryContainer}>
        <h2 style={styles.logHistoryTitle}>
            Daily Calorie Trend (Last {processedDailyLogs.length} Days)
        </h2>
        
        {processedDailyLogs.length > 0 && (
            <button 
                onClick={() => setShowHistory(!showHistory)}
                style={styles.toggleButton}
            >
                {showHistory ? 'Hide Meal Details' : 'Show All Meal Details'}
            </button>
        )}

        {loadingLogs ? (
          <p style={styles.loadingText}>Fetching your food history...</p>
        ) : processedDailyLogs.length === 0 ? (
          <p style={styles.noDataText}>You haven't logged any meals yet!</p>
        ) : (
          <div style={styles.dailyLogList}>
            {processedDailyLogs.map((dayLog, index) => (
              <div key={index} style={styles.dayContainer}>
                <div style={styles.dayHeader}>
                    <span style={styles.dayDate}>{dayLog.displayDate}</span>
                    <span style={styles.dayTotalCalories}>
                        TOTAL: <span style={{ color: '#FF5733' }}>{dayLog.totalCalories} kcal</span>
                    </span>
                </div>

                {showHistory && (
                    <div style={styles.logList}>
                        {dayLog.meals.map((log) => (
                        <div key={log._id} style={styles.logItem}>
                            <span style={styles.logTime}>{new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - </span>
                            <span style={styles.logMealType}>[{log.mealType}]</span>
                            <span style={styles.logFoodItem}> {log.foodItem} ({log.grams}g)</span>
                            <span style={styles.logCalories}>{log.calories} kcal</span>
                            <button 
                                onClick={() => handleDeleteLog(log._id, log.foodItem)} 
                                style={styles.deleteButton}
                                title="Delete Log"
                            >
                                X
                            </button>
                        </div>
                        ))}
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={styles.disclaimer}>
        *Disclaimer: Calculations are estimates based on standard formulas and low activity level. 
        For an accurate diet plan and medical advice, always consult a certified professional.
      </p>
    </div>
  );
}

const waterStyles = {
    trackerButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '15px',
    },
    addButton: {
        padding: '8px 12px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
    },
    resetButton: {
        padding: '8px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '13px',
    }
}

const styles = {
  dashboardContainer: {
    padding: '30px',
    maxWidth: '1000px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    color: '#2c3e50',
    marginBottom: '5px',
    fontSize: '36px',
  },
  subheader: {
    color: '#7f8c8d',
    marginBottom: '30px',
    fontSize: '20px',
  },
  statsGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '25px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1',
    minWidth: '280px',
    padding: '25px',
    borderRadius: '10px',
    backgroundColor: '#ecf0f1',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '15px',
    textTransform: 'uppercase',
  },
  bigNumber: {
    fontSize: '52px',
    fontWeight: '900',
    margin: '0',
    lineHeight: '1.2',
  },
  cardInfo: {
    fontSize: '14px',
    color: '#777',
    marginTop: '5px',
  },
  bmiCategory: {
    fontWeight: 'bold',
    fontSize: '18px',
    marginTop: '10px',
  },
  dietPlan: {
    textAlign: 'left',
    padding: '30px',
    backgroundColor: '#f6faff', 
    borderRadius: '10px',
    borderLeft: '8px solid #3498db',
    marginBottom: '40px',
  },
  dietTitle: {
    color: '#2c3e50',
    fontSize: '26px',
    marginBottom: '15px',
  },
  dietText: {
    fontSize: '17px',
    lineHeight: '1.8',
    color: '#444',
  },
  statsViewContainer: {
    padding: '20px',
    backgroundColor: '#ecf0f1',
    borderRadius: '10px',
    marginBottom: '40px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  },
  statsViewTitle: {
    color: '#2c3e50',
    fontSize: '24px',
    marginBottom: '20px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    flex: 1,
    minWidth: '250px',
    textAlign: 'left',
  },
  statCardTitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '5px',
    textTransform: 'uppercase',
  },
  statCardValue: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: '#2c3e50',
  },
  statCardUnit: {
    fontSize: '18px',
    fontWeight: '600',
    marginLeft: '5px',
  },
  logHistoryContainer: {
    textAlign: 'left',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    border: '1px solid #ddd',
  },
  logHistoryTitle: {
    color: '#2c3e50',
    fontSize: '24px',
    marginBottom: '20px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  toggleButton: {
      padding: '8px 15px',
      backgroundColor: '#f39c12',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginBottom: '15px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.3s',
  },
  deleteButton: { 
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '15px',
    lineHeight: '1',
  },
  dailyLogList: { 
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', 
  },
  dayContainer: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  dayHeader: { 
    backgroundColor: '#ecf0f1',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '18px',
  },
  dayDate: {
      color: '#2c3e50',
  },
  dayTotalCalories: {
      color: '#FF5733',
  },
  logList: { 
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #ddd', 
  },
  logItem: {
    backgroundColor: '#fff',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '15px',
    borderBottom: '1px solid #eee',
  },
  logTime: { 
    color: '#7f8c8d',
    fontSize: '13px',
    minWidth: '75px',
  },
  logMealType: {
    fontWeight: 'bold',
    color: '#3498db',
    minWidth: '80px',
    textAlign: 'center',
    fontSize: '14px',
  },
  logFoodItem: {
    flexGrow: 1,
    paddingLeft: '10px',
    textAlign: 'left',
    fontWeight: '500',
  },
  logCalories: {
    fontWeight: 'bold',
    color: '#FF5733',
    minWidth: '70px',
    textAlign: 'right',
    fontSize: '16px',
  },
  loadingText: {
      color: '#3498db',
      fontSize: '18px',
      padding: '10px',
  },
  noDataText: {
      color: '#e74c3c',
      fontSize: '18px',
      padding: '10px',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#a00',
    marginTop: '40px',
  }
};


export default HealthDashboard;
