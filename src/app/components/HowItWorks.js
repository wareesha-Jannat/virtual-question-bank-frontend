import styles from "../css/howitworks.module.css";

const STEPS = [
  {
    num: "1",
    icon: "bi-person-plus-fill",
    title: "Sign Up",
    description:
      "Create a free account in seconds and log in to start your exam prep journey.",
  },
  {
    num: "2",
    icon: "bi-journal-bookmark-fill",
    title: "Select Subject",
    description:
      "Browse subjects and topics to find exactly the questions you need to practice.",
  },
  {
    num: "3",
    icon: "bi-pencil-fill",
    title: "Practice Questions",
    description:
      "Test yourself with our extensive collection of curated practice questions.",
  },
  {
    num: "4",
    icon: "bi-bar-chart-fill",
    title: "Track Performance",
    description:
      "Review analytics and detailed feedback to identify weak areas and improve.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="Howitworks" className={styles.howitworks}>
      <div className="container-xxl">
        {/* ── Section Header ───────────────────────────────── */}
        <div className={styles.sectionHeader}>
          <p className="vqb-section-label">Simple Process</p>
          <h2 className="vqb-section-title">How It Works</h2>
          <p className="vqb-section-subtitle">
            Get started in minutes and make every study session count.
          </p>
        </div>

        {/* ── Steps ─────────────────────────────────────────── */}
        <div className={`row g-4 justify-content-center ${styles.stepsRow}`}>
          {STEPS.map(({ num, icon, title, description }) => (
            <div key={num} className="col-6 col-md-3">
              <div className={styles.stepCard}>
                {/* Numbered circle with icon */}
                <div className={styles.stepCircle}>
                  <i className={`bi ${icon}`} aria-hidden="true"></i>
                  <span className={styles.stepNum} aria-hidden="true">
                    {num}
                  </span>
                </div>
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
