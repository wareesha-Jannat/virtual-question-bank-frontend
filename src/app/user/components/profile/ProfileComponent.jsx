"use client";
import { useState } from "react";
import styles from "./ProfileComponent.module.css";
import {MyProfile} from './MyProfile';
import { PersonalInfo } from "./PersonalInfo";
import { ChangePassword } from "./ChangePassword";

export function ProfileComponent() {
  const [activeTab, setActiveTab] = useState("myProfile");
 

  return (
    <div className={styles.content}>
      <h1>Profile</h1>
      <div className="container-xxl ">
        <ul className="nav ">
          <li onClick={(e) => setActiveTab("myProfile")}>My Profile</li>
          <li onClick={(e) => setActiveTab("personalInfo")}>Personal Info</li>
          <li onClick={(e) => setActiveTab("changePassword")}>Change Password</li>
        </ul>
        {activeTab === "myProfile" && <MyProfile />}
        {activeTab === "personalInfo" && <PersonalInfo />}
        {activeTab === "changePassword" && <ChangePassword />}
      </div>
    
    </div>
  );
}
