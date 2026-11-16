import Link from "next/link";
import styles from "../css/footer.module.css";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container-xxl">
        {/* ── Brand block ───────────────────────────────────── */}
        <div className={styles.brand}>
          <i className="bi bi-journal-text" aria-hidden="true"></i>
          <span>Virtual Question Bank</span>
        </div>
        <p className={styles.brandTagline}>
          Smart exam preparation for every student.
        </p>

        {/* ── Divider ───────────────────────────────────────── */}
        <hr className={styles.divider} />

        {/* ── Bottom Bar ────────────────────────────────────── */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {year} Virtual Question Bank. All rights reserved.
          </p>

          <div className={styles.footerLinks}>
            <Link href="#">Privacy Policy</Link>
            <span className={styles.separator} aria-hidden="true">·</span>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
