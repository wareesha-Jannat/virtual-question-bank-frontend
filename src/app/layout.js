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
    "Prepare smarter for exams with a virtual question bank. Practice MCQs, track performance, and strengthen concepts with topic-wise questions.",
  keywords: [
    "question bank",
    "exam preparation",
    "online test system",
    "mcq practice",
    "virtual question bank",
  ],
  authors: [{ name: "Wareesha Jannat" }],
  creator: "Wareesha Jannat",
  metadataBase: new URL("https://virtual-question-bank-frontend.vercel.app/"),
  openGraph: {
    title: "Virtual Question Bank",
    description:
      "A smart platform for exam preparation with topic-wise practice questions.",
    url: "https://virtual-question-bank-frontend.vercel.app",
    siteName: "Virtual Question Bank",
    images: [
      {
        url: "/og-image.png",
        width: 1300,
        height: 630,
        alt: "Virtual Question Bank",
      },
    ],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
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
