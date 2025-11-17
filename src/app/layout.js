import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ReactQueryProvider from "./components/ReactQueryProvider";
import RoleProvider from "./components/RoleProvider";

export const metadata = {
  title: {
    template: "%s | Virtual Question Bank",
    default: "Virtual Question Bank",
  },
  description:
    "Prepare for your exams with MCQs and descriptive questions across multiple subjects.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <RoleProvider>
            <ToastContainer className="customToast" />
            {children}
          </RoleProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
