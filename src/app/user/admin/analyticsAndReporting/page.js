'use client'
import { useState } from 'react';
import {Analytics} from './components/Analytics.jsx';
import {Reporting} from './components/Reporting.jsx';
import styles from '../AdminPages.module.css';

export default function AnalyticsReportingPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-graph-up" />
        </span>
        <div>
          <span className={styles.eyebrow}>Administration</span>
          <h1 className={styles.pageTitle}>Analytics &amp; Reporting</h1>
          <p className={styles.pageDescription}>
            Review usage, engagement, and performance across the platform.
          </p>
        </div>
      </header>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Analytics and reporting"
      >
        <button
          id="analytics-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "analytics"}
          aria-controls="analytics-reporting-panel"
          className={`${styles.tabButton} ${
            activeTab === "analytics" ? styles.tabButtonActive : ""
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          <i className="bi bi-bar-chart-line" aria-hidden="true" />
          Analytics
        </button>
        <button
          id="reporting-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "reporting"}
          aria-controls="analytics-reporting-panel"
          className={`${styles.tabButton} ${
            activeTab === "reporting" ? styles.tabButtonActive : ""
          }`}
          onClick={() => setActiveTab("reporting")}
        >
          <i className="bi bi-file-earmark-bar-graph" aria-hidden="true" />
          Reporting
        </button>
      </div>

      <div
        id="analytics-reporting-panel"
        role="tabpanel"
        aria-labelledby={activeTab === "analytics" ? "analytics-tab" : "reporting-tab"}
      >
        {activeTab === "analytics" ? <Analytics /> : <Reporting />}
      </div>
    </div>
  );
}
