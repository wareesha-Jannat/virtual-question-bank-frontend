import Image from "next/image";
import styles from "../css/hero.module.css";
export const Hero = () => {
  return (
    <>
      <section className={`${styles.hero} container-fluid`}>
        {/* Background Image */}
        <Image
          src="/hero.jpg"
          alt="Exam preparation hero background"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />

        {/* Overlay */}
        <div className={styles.overlay} />

        {/* Content */}
        <div className={styles.content}>
          <h1>Prepare for Your Exams with Confidence</h1>
          <p>
            Enhance your exam preparation with a vast library of questions and
            performance analysis tools.
          </p>
        </div>
      </section>
    </>
  );
};
