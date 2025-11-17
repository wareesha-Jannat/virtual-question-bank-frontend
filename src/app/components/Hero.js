import styles from "../css/hero.module.css";
export const Hero = () => {
  return (
    <>
      <div className="container-fluid">
        <div className={` ${styles.hero} row `}>
          <div className=" col-md-10 ">
            <h1>Prepare for Your Exams with Confidence</h1>
            <p>
              Enhance your exam preparation with a vast library of questions and
              performance analysis tools.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
