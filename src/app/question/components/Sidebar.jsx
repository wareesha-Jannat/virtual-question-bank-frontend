import styles from "./Sidebar.module.css";
import { useEffect, useState } from "react";
import { useTopics } from "@/app/hooks/useTopics";
import Loader from "@/app/components/Loader";

export const Sidebar = ({ isOpen, subjectId, onTopicSelect }) => {
  const [activeTopicId, setActiveTopicId] = useState(null);
  const { data, error, isLoading } = useTopics(subjectId);
  const topics = data?.status === "success" ? data.topics : [];

  // Auto-select first topic when topics load
  useEffect(() => {
    if (!activeTopicId && topics.length > 0) {
      const defaultTopicId = topics[0]._id;
      setActiveTopicId(defaultTopicId);
      onTopicSelect(defaultTopicId);
    }
  }, [topics, activeTopicId]);

  // Reset active topic when subject changes
  useEffect(() => {
    setActiveTopicId(null);
  }, [subjectId]);

  const handleTopicClick = (topicId) => {
    setActiveTopicId(topicId);
    onTopicSelect(topicId);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? "" : styles.sidebarClosed}`}
      aria-label="Topics navigation"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className={styles.sidebarHeader}>
        <p className={styles.sidebarTitle}>Topics</p>
      </div>

      {/* ── Topic list ─────────────────────────────────────── */}
      <ul className={styles.topicList}>
        {isLoading || !subjectId ? (
          <div className={styles.loadingWrap}>
            <Loader height={28} width={28} size={28} color="#93b4f5" />
          </div>
        ) : topics && topics.length > 0 ? (
          topics.map((topic) => (
            <li
              key={topic._id}
              className={`${styles.topicItem} ${
                topic._id === activeTopicId ? styles.active : ""
              }`}
              onClick={() => handleTopicClick(topic._id)}
              role="button"
              aria-pressed={topic._id === activeTopicId}
            >
              {capitalize(topic.name)}
            </li>
          ))
        ) : (
          <li className={styles.noTopics}>No topics available</li>
        )}

        {error && (
          <li className={styles.noTopics}>Error loading topics</li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
