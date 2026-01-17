import React, { useState } from 'react';
import { ActivityCard, Metric, Goal } from '@/components/ui/activity-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const FinancialReports: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', label: 'Review monthly expense report', completed: true },
    { id: '2', label: 'Approve pending payments', completed: true },
    { id: '3', label: 'Update budget forecast', completed: false },
  ]);

  // Financial metrics adapted for TMS
  const financialMetrics: Metric[] = [
    {
      label: 'Revenue',
      value: '125.5K',
      unit: 'PLN',
      percentage: 85,
      color: 'text-green-500',
    },
    {
      label: 'Expenses',
      value: '89.2K',
      unit: 'PLN',
      percentage: 70,
      color: 'text-red-500',
    },
    {
      label: 'Profit',
      value: '36.3K',
      unit: 'PLN',
      percentage: 83,
      color: 'text-blue-500',
    },
  ];

  const handleGoalToggle = (goalId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      label: 'New financial goal',
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleViewDetails = () => {
    navigate('/expenses');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Track your financial performance and goals</p>
        </div>
      </div>

      {/* Activity Card */}
      <ActivityCard
        title="This Month's Progress"
        subtitle="Financial Overview"
        metrics={financialMetrics}
        goals={goals}
        onGoalToggle={handleGoalToggle}
        onAddGoal={handleAddGoal}
        onViewDetails={handleViewDetails}
      />

      {/* Additional Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Revenue</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">125,500 PLN</div>
            <p className="text-sm text-gray-500 mt-2">↑ 12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Expenses</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">89,200 PLN</div>
            <p className="text-sm text-gray-500 mt-2">↓ 5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Net Profit</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">36,300 PLN</div>
            <p className="text-sm text-gray-500 mt-2">↑ 28% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReports;
