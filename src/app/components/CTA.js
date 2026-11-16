import Link from "next/link";
import styles from "../css/cta.module.css";

export const CTA = () => {
  return (
    <section className={styles.cta}>
      <div className="container-xxl">
        <div className={styles.ctaInner}>
          {/* Eyebrow */}
          <div className={styles.ctaEyebrow}>
            <i className="bi bi-lightning-fill" aria-hidden="true"></i>
            Start for Free
          </div>

          {/* Headline */}
          <h2>Ready to Excel in Your Exams?</h2>

          {/* Supporting text */}
          <p className={styles.ctaSubtext}>
            Join thousands of students already preparing smarter. No credit card
            required — just create an account and start practicing today.
          </p>

          {/* Buttons */}
          <div className={styles.ctaBtnGroup}>
            <Link href="/account/Register" className={styles.btnMain}>
              Create Free Account
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link href="/question" className={styles.btnAlt}>
              <i className="bi bi-collection" aria-hidden="true"></i>
              Browse Questions
            </Link>
          </div>

          {/* Trust strip */}
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
              <span>Free to join</span>
            </div>
            <div className={styles.trustItem}>
              <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
              <span>No credit card needed</span>
            </div>
            <div className={styles.trustItem}>
              <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
