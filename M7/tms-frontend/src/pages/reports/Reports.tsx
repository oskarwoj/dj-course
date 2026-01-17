import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialReports from './FinancialReports';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current route
  const activeTab = location.pathname === '/reports/financial' ? 'financial' : 'financial';

  const handleTabChange = (value: string) => {
    if (value === 'financial') {
      navigate('/reports/financial');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">View and analyze your transportation management data</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="operational" disabled>Operational Reports</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="financial" className="mt-6">
          <FinancialReports />
        </TabsContent>
        <TabsContent value="operational" className="mt-6">
          <div className="text-center py-12 text-gray-500">
            Operational Reports coming soon...
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-12 text-gray-500">
            Analytics coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
