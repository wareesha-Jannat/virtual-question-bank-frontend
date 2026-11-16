import styles from "../css/features.module.css";

const FEATURES = [
  {
    icon: "bi-journal-text",
    colorClass: "iconWrapBlue",
    title: "Extensive Question Bank",
    description:
      "Access thousands of categorized questions across subjects and topics — all in one place for comprehensive exam preparation.",
  },
  {
    icon: "bi-check2-circle",
    colorClass: "iconWrapGreen",
    title: "Real-Time Feedback",
    description:
      "Receive instant, detailed explanations for every answer to reinforce understanding and accelerate your learning.",
  },
  {
    icon: "bi-alarm",
    colorClass: "iconWrapOrange",
    title: "Simulated Exams",
    description:
      "Take full timed practice exams that mirror real test conditions, then review detailed performance breakdowns.",
  },
];

export const Features = () => {
  return (
    <section id="Features" className={styles.features}>
      <div className="container-xxl">
        {/* ── Section Header ───────────────────────────────── */}
        <div className={styles.sectionHeader}>
          <p className="vqb-section-label">What We Offer</p>
          <h2 className="vqb-section-title">
            Everything You Need to Succeed
          </h2>
          <p className="vqb-section-subtitle">
            Powerful tools designed to make your exam preparation smarter,
            faster, and more effective.
          </p>
        </div>

        {/* ── Feature Cards ─────────────────────────────────── */}
        <div className="row g-4 justify-content-center">
          {FEATURES.map(({ icon, colorClass, title, description }) => (
            <div key={title} className="col-sm-10 col-md-6 col-lg-4">
              <article className={styles.featureCard}>
                <div className={styles[colorClass]}>
                  <i className={`bi ${icon}`} aria-hidden="true"></i>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
