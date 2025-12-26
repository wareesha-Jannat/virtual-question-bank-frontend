import styles from "../css/cta.module.css";
import Link from "next/link";

export const CTA = () => {
  return (
    <section className={` ${styles.cta} text-white text-center py-5`}>
      <div className="container-xxl">
        <h2 className="mb-4">Ready to Excel in Your Exams?</h2>
        <Link href="/account/Register" className="btn btn-lg btn-success">
          Join Now
        </Link>
      </div>
    </section>
  );
};
