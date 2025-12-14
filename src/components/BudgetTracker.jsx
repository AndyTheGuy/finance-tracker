"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

export default function BudgetTracker() {
  const [mounted, setMounted] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [emergencyFund, setEmergencyFund] = useState(0);
  const [view, setView] = useState('weekly');
  
  const [newShift, setNewShift] = useState({
    date: '',
    hours: '',
    tips: '',
    notes: ''
  });

  const [newExpense, setNewExpense] = useState({
    date: '',
    category: 'Food',
    amount: '',
    notes: ''
  });

  // Load from localStorage after component mounts
  useEffect(() => {
    setMounted(true);
    const savedShifts = localStorage.getItem('shifts');
    const savedExpenses = localStorage.getItem('expenses');
    const savedFund = localStorage.getItem('emergencyFund');
    
    if (savedShifts) setShifts(JSON.parse(savedShifts));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedFund) setEmergencyFund(parseFloat(savedFund));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('shifts', JSON.stringify(shifts));
    }
  }, [shifts, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('emergencyFund', emergencyFund.toString());
    }
  }, [emergencyFund, mounted]);

  const weeklyBudget = {
    'Petrol': 300,
    'Food': 700,
    'Utilities': 140,
    'Gym': 25,
    'Personal Care': 115,
    'Girlfriend': 250,
    'Going Out': 125
  };

  const hourlyRate = 30;
  const tipKeepPercentage = 0.75;
  const totalWeeklyBudget = Object.values(weeklyBudget).reduce((a, b) => a + b, 0);
  const emergencyFundGoal = 10000;

  // Calculate shift earnings
  const calculateShiftEarnings = (hours, tips) => {
    const hourlyEarnings = hours * hourlyRate;
    const tipsKept = tips * tipKeepPercentage;
    return hourlyEarnings + tipsKept;
  };

  // Add shift
  const addShift = () => {
    if (newShift.date && newShift.hours && newShift.tips) {
      const hours = parseFloat(newShift.hours);
      const tips = parseFloat(newShift.tips);
      const totalEarned = calculateShiftEarnings(hours, tips);
      
      setShifts([...shifts, {
        ...newShift,
        hours,
        tips,
        totalEarned,
        id: Date.now()
      }]);
      setNewShift({ date: '', hours: '', tips: '', notes: '' });
    }
  };

  // Add expense
  const addExpense = () => {
    if (newExpense.amount && newExpense.date) {
      setExpenses([...expenses, { 
        ...newExpense, 
        amount: parseFloat(newExpense.amount),
        id: Date.now()
      }]);
      setNewExpense({ date: '', category: 'Food', amount: '', notes: '' });
    }
  };

  // Get data for current week
  const getCurrentWeekData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekShifts = shifts.filter(s => new Date(s.date) >= startOfWeek);
    const weekExpenses = expenses.filter(e => new Date(e.date) >= startOfWeek);
    
    return { weekShifts, weekExpenses };
  };

  // Get data for current month
  const getCurrentMonthData = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthShifts = shifts.filter(s => new Date(s.date) >= startOfMonth);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
    
    return { monthShifts, monthExpenses };
  };

  const { weekShifts, weekExpenses } = getCurrentWeekData();
  const { monthShifts, monthExpenses } = getCurrentMonthData();

  const weekIncome = weekShifts.reduce((sum, s) => sum + s.totalEarned, 0);
  const weekSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weekBalance = weekIncome - weekSpent;

  const monthIncome = monthShifts.reduce((sum, s) => sum + s.totalEarned, 0);
  const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthBalance = monthIncome - monthSpent;

  // Category spending
  const categorySpending = (view === 'weekly' ? weekExpenses : monthExpenses).reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  // Savings calculator - dynamic based on actual performance
  const avgMonthlySavings = monthBalance > 0 ? monthBalance : 1450;
  const remainingForEmergencyFund = emergencyFundGoal - emergencyFund;
  const monthsToGoal = emergencyFund >= emergencyFundGoal ? 0 : 
    Math.ceil(remainingForEmergencyFund / avgMonthlySavings);
  const goalDate = new Date();
  goalDate.setMonth(goalDate.getMonth() + monthsToGoal);

  // Dynamic days until dad contribution
  const daysToGoal = monthsToGoal * 30;
  const daysUntilDad = emergencyFund >= emergencyFundGoal ? 0 : daysToGoal;

  // Week status
  const weekStatus = weekBalance >= 0 ? 'good' : 'over';
  const weekBudgetMultiplier = view === 'weekly' ? 1 : 4;

  const emergencyFundProgress = (emergencyFund / emergencyFundGoal) * 100;

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Command Center</h1>
          <p className="text-gray-600">Track income, expenses, and build your emergency fund</p>
          
          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold ${view === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold ${view === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Monthly View
            </button>
          </div>
        </div>

        {/* Top Row: Emergency Fund, Dad Contribution & TFSA */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Emergency Fund Progress */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Emergency Fund</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold">R{Math.round(emergencyFund)}</span>
                <span className="text-lg">/ R{emergencyFundGoal}</span>
              </div>
              <div className="bg-white bg-opacity-30 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${Math.min(emergencyFundProgress, 100)}%` }}
                ></div>
              </div>
              <div className="text-sm opacity-90">{emergencyFundProgress.toFixed(1)}% complete</div>
              {monthsToGoal > 0 && (
                <div className="text-sm opacity-90">
                  <strong>{monthsToGoal} months</strong> to goal at current rate
                  <div className="text-xs mt-1">Target: {goalDate.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}</div>
                  {monthBalance > 0 && (
                    <div className="text-xs mt-1 bg-white bg-opacity-20 p-2 rounded">
                      Saving R{Math.round(monthBalance)}/month based on actual performance
                    </div>
                  )}
                </div>
              )}
              {emergencyFund >= emergencyFundGoal && (
                <div className="text-lg font-bold">🎉 GOAL REACHED!</div>
              )}
              {monthBalance > 0 && emergencyFund < emergencyFundGoal && (
                <div className="bg-white bg-opacity-20 p-3 rounded-lg mt-2">
                  <p className="text-sm font-semibold">💡 Suggested Savings This Month:</p>
                  <p className="text-2xl font-bold">R{Math.round(monthBalance)}</p>
                  <p className="text-xs opacity-90 mt-1">Based on your current income vs expenses</p>
                </div>
              )}
              <input
                type="number"
                placeholder="Add savings amount"
                className="w-full p-2 rounded text-gray-800 mt-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setEmergencyFund(emergencyFund + parseFloat(e.target.value));
                    e.target.value = '';
                  }
                }}
              />
              <p className="text-xs opacity-75">Press Enter to add</p>
            </div>
          </div>

          {/* Dad Contribution Countdown */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-6 h-6" />
              <h2 className="text-xl font-bold">Dad Contribution</h2>
            </div>
            <div className="space-y-3">
              {emergencyFund >= emergencyFundGoal ? (
                <>
                  <div className="text-3xl font-bold">Ready to Start!</div>
                  <div className="text-base">You can now contribute R500/month</div>
                  <div className="text-sm opacity-90 mt-4">
                    Emergency fund complete ✓<br/>
                    Time to give back to Dad
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold">{daysUntilDad}</div>
                  <div className="text-base">days until contributions start</div>
                  <div className="text-sm opacity-90 mt-2">
                    Target: {goalDate.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}<br/>
                    Amount: R500/month
                  </div>
                  <div className="text-xs opacity-75 bg-white bg-opacity-20 p-2 rounded mt-2">
                    💡 Countdown updates based on your actual savings rate. Have a great month to speed it up!
                  </div>
                </>
              )}
            </div>
          </div>

          {/* TFSA Tracker */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-xl font-bold">TFSA (Long-term)</h2>
            </div>
            <div className="space-y-3">
              {emergencyFund < emergencyFundGoal ? (
                <>
                  <div className="text-3xl font-bold">🔒 Locked</div>
                  <div className="text-base">Available after emergency fund</div>
                  <div className="text-sm opacity-90 mt-4">
                    Once you hit R10,000 and start Dad contributions, you'll have R950/month for your TFSA
                  </div>
                  <div className="text-xs opacity-75 bg-white bg-opacity-20 p-2 rounded mt-2">
                    Annual limit: R36,000<br/>
                    Lifetime limit: R500,000<br/>
                    100% tax-free growth forever
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">✓ Unlocked!</div>
                  <div className="text-base">Ready to start investing</div>
                  <div className="text-sm opacity-90 mt-4">
                    Suggested: R950/month<br/>
                    Annual total: R11,400/year
                  </div>
                  <div className="text-xs opacity-75 bg-white bg-opacity-20 p-2 rounded mt-2">
                    You're using 32% of your annual R36,000 limit
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Income vs Expenses Summary - Good/Bad Week Indicator */}
        <div className={`rounded-lg shadow-lg p-6 ${weekStatus === 'good' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'} text-white`}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            {weekStatus === 'good' ? '✓' : '⚠️'} {view === 'weekly' ? 'This Week' : 'This Month'} - {weekStatus === 'good' ? 'On Track!' : 'Over Budget'}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-sm opacity-90">Income Earned</p>
              <p className="text-3xl font-bold">R{Math.round(view === 'weekly' ? weekIncome : monthIncome)}</p>
              <p className="text-xs opacity-75">{view === 'weekly' ? weekShifts.length : monthShifts.length} shifts worked</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-sm opacity-90">Total Spent</p>
              <p className="text-3xl font-bold">R{Math.round(view === 'weekly' ? weekSpent : monthSpent)}</p>
              <p className="text-xs opacity-75">Budget: R{totalWeeklyBudget * weekBudgetMultiplier}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-sm opacity-90">Balance</p>
              <p className="text-3xl font-bold">{view === 'weekly' ? weekBalance >= 0 ? '+' : '' : monthBalance >= 0 ? '+' : ''}R{Math.round(view === 'weekly' ? weekBalance : monthBalance)}</p>
              <p className="text-xs opacity-75">{weekStatus === 'good' ? 'Available for savings' : 'Need to cut back'}</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Spending by Category</h2>
          <div className="space-y-3">
            {Object.entries(weeklyBudget).map(([category, budget]) => {
              const budgetAmount = view === 'weekly' ? budget : budget * 4;
              const spent = categorySpending[category] || 0;
              const percentage = (spent / budgetAmount) * 100;
              const isOver = spent > budgetAmount;
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className={isOver ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      R{Math.round(spent)} / R{budgetAmount}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column: Income & Expenses */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Log Shift Income */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Log Shift
            </h2>
            <div className="space-y-3">
              <input
                type="date"
                value={newShift.date}
                onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Hours worked"
                value={newShift.hours}
                onChange={(e) => setNewShift({...newShift, hours: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Tips earned (before split)"
                value={newShift.tips}
                onChange={(e) => setNewShift({...newShift, tips: e.target.value})}
                className="w-full p-2 border rounded"
              />
              {newShift.hours && newShift.tips && (
                <div className="bg-green-50 p-3 rounded text-sm">
                  <p className="text-gray-600">Breakdown:</p>
                  <p>Hourly: R{(parseFloat(newShift.hours) * hourlyRate).toFixed(2)}</p>
                  <p>Tips kept (75%): R{(parseFloat(newShift.tips) * tipKeepPercentage).toFixed(2)}</p>
                  <p className="font-bold text-green-700 mt-1">
                    Total earned: R{calculateShiftEarnings(parseFloat(newShift.hours), parseFloat(newShift.tips)).toFixed(2)}
                  </p>
                </div>
              )}
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newShift.notes}
                onChange={(e) => setNewShift({...newShift, notes: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={addShift}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log Shift
              </button>
            </div>

            {/* Recent Shifts */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Recent Shifts</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shifts.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No shifts logged yet</p>
                ) : (
                  shifts.slice().reverse().slice(0, 10).map(shift => (
                    <div key={shift.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                      <div>
                        <div className="font-semibold text-green-700">R{Math.round(shift.totalEarned)}</div>
                        <div className="text-xs text-gray-600">{shift.date} • {shift.hours}hrs • R{shift.tips} tips</div>
                      </div>
                      <button
                        onClick={() => setShifts(shifts.filter(s => s.id !== shift.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Log Expense */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-red-600" />
              Log Expense
            </h2>
            <div className="space-y-3">
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full p-2 border rounded"
              >
                {Object.keys(weeklyBudget).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (R)"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={addExpense}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log Expense
              </button>
            </div>

            {/* Recent Expenses */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Recent Expenses</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {expenses.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No expenses logged yet</p>
                ) : (
                  expenses.slice().reverse().slice(0, 10).map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm">
                      <div>
                        <div className="font-semibold text-red-700">R{Math.round(expense.amount)}</div>
                        <div className="text-xs text-gray-600">{expense.date} • {expense.category}</div>
                        {expense.notes && <div className="text-xs text-gray-500">{expense.notes}</div>}
                      </div>
                      <button
                        onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}