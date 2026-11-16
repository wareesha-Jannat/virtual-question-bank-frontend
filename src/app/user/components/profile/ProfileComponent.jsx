"use client";
import { useState } from "react";
import styles from "./ProfileComponent.module.css";
import { MyProfile } from "./MyProfile";
import { PersonalInfo } from "./PersonalInfo";
import { ChangePassword } from "./ChangePassword";

export function ProfileComponent() {
  const [activeTab, setActiveTab] = useState("myProfile");

  const tabs = [
    { id: "myProfile", label: "My Profile", icon: "bi-person-circle" },
    { id: "personalInfo", label: "Personal Info", icon: "bi-person-lines-fill" },
    { id: "changePassword", label: "Change Password", icon: "bi-shield-lock" },
  ];

  return (
    <div className={styles.profilePage}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-person-gear"></i>
        </span>
        <div>
          <span className={styles.eyebrow}>Account</span>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageDescription}>
            Manage your account details and security settings.
          </p>
        </div>
      </header>

      <nav aria-label="Profile sections">
        <ul className={styles.tabList} role="tablist">
          {tabs.map((tab) => (
            <li className={styles.tabItem} key={tab.id}>
              <button
                type="button"
                id={`profile-tab-${tab.id}`}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.tabButtonActive : ""
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="profile-tabpanel"
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`bi ${tab.icon}`} aria-hidden="true"></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="profile-tabpanel"
        className={styles.tabPanel}
        role="tabpanel"
        aria-labelledby={`profile-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === "myProfile" && <MyProfile />}
        {activeTab === "personalInfo" && <PersonalInfo />}
        {activeTab === "changePassword" && <ChangePassword />}
      </section>
    </div>
  );
}
