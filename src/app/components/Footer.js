import Link from "next/link";
import styles from "../css/footer.module.css";
export const Footer = () => {
  return (
    <footer className={` ${styles.footer} text-white py-4`}>
      <div className="container-xxl text-center">
        <p>&copy; 2024 Virtual Question Bank. All rights reserved.</p>
        <p>
          <Link href="#" className="text-white">
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link href="#" className="text-white">
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  );
};
