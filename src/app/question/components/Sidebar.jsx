import styles from "./Sidebar.module.css";

import { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useTopics } from "@/app/hooks/useTopics";

export const Sidebar = ({ isOpen, subjectId, onTopicSelect }) => {
  const [activeTopicId, setActiveTopicId] = useState(null);
  const { data, error } = useTopics(subjectId);
  const topics = data?.status === "success" ? data.topics : [];

  // Effect hook to set a default topic when topics are fetched
  useEffect(() => {
    if (!activeTopicId && topics.length > 0) {
      const defaultTopicId = topics[0]._id;
      setActiveTopicId(defaultTopicId);
      onTopicSelect(defaultTopicId);
    }
  }, [topics, activeTopicId]);
  useEffect(() => {
    // reset topic when subject changes
    setActiveTopicId(null);
  }, [subjectId]);

  // Function to handle when a topic is clicked
  const handleTopicClick = (topicId) => {
    setActiveTopicId(topicId);
    onTopicSelect(topicId); // Notify the parent component of the selected topic ID
  };

  // Helper function to capitalize the first letter of a string
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className={`${styles.sidebar}  ${isOpen ? "" : styles.sidebarClosed}`}>
      {/* Sidebar header and topic list */}
      <h3 className={styles.sidebarHeader}>Topics</h3>
      <ul className={styles.topicList}>
        {topics && topics.length > 0 ? (
          topics.map((topic) => (
            <li
              key={topic._id}
              className={`${styles.topicItem} p-2 ${
                topic._id === activeTopicId ? styles.active : ""
              }`}
              onClick={() => handleTopicClick(topic._id)}
            >
              {capitalize(topic.name)}{" "}
              {/* Display the topic name with the first letter capitalized */}
            </li>
          ))
        ) : (
          <li className={styles.noTopics}>No Topics available</li>
        )}
        {error && <li className={styles.noTopics}>Error loading topics</li>}
      </ul>
    </div>
  );
};

export default Sidebar;
