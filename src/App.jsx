import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import StationAnalytics from '@/pages/StationAnalytics';

function App() {
  const [filters, setFilters] = useState({
    plant: 'Pune',
    line: 'FCPV',
    station: 'All',
    dateRange: 'Today'
  });

  return (
    <Router>
      <Layout filters={filters} setFilters={setFilters}>
        <Routes>
          <Route path="/" element={<Dashboard filters={filters} />} />
          <Route path="/station/:id" element={<StationAnalytics filters={filters} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
