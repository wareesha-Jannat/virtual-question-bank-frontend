'use client'
import { useState } from 'react';
import {Analytics} from './components/Analytics.jsx';
import {Reporting} from './components/Reporting.jsx';

export default function AnalyticsReportingPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Analytics & Reporting</h2>

      {/* Tabs for Analytics and Reporting */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'reporting' ? 'active' : ''}`}
            onClick={() => setActiveTab('reporting')}
          >
            Reporting
          </button>
        </li>
      </ul>

      {/* Content for the selected tab */}
      <div className="mt-4">
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'reporting' && <Reporting />}
      </div>
    </div>
  );
}
