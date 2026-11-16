import Image from "next/image";
import Link from "next/link";
import styles from "../css/hero.module.css";

export const Hero = () => {
  return (
    <>
      <section className={`${styles.hero} container-fluid`}>
        {/* ── Background Image ──────────────────────────────── */}
        <Image
          src="/hero.jpg"
          alt="Students preparing for exams"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />

        {/* ── Overlay ───────────────────────────────────────── */}
        <div className={styles.overlay} aria-hidden="true" />

        {/* ── Content ───────────────────────────────────────── */}
        <div className={styles.content}>
          {/* Eyebrow badge */}
          <div className={styles.badge}>
            <i className="bi bi-stars" aria-hidden="true"></i>
            Smart Exam Preparation Platform
          </div>

          {/* Headline */}
          <h1>
            Prepare for Your Exams{" "}
            <span className={styles.accent}>with Confidence</span>
          </h1>

          {/* Sub-heading */}
          <p>
            Access a vast library of practice questions, take timed mock exams,
            and track your progress with detailed performance insights.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <Link
              href="/account/Register"
              className={styles.btnPrimary}
            >
              Get Started Free
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link
              href="/question"
              className={styles.btnSecondary}
            >
              <i className="bi bi-collection" aria-hidden="true"></i>
              Browse Questions
            </Link>
          </div>

          {/* Quick Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>Questions</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>10+</span>
              <span className={styles.statLabel}>Subjects</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>Free</span>
              <span className={styles.statLabel}>To Join</span>
            </div>
          </div>
        </div>

        {/* ── Scroll Cue ────────────────────────────────────── */}
        <div className={styles.scrollCue} aria-hidden="true">
          <i className="bi bi-chevron-down"></i>
        </div>
      </section>
    </>
  );
};
