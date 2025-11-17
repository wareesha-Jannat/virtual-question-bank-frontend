import StudentLayoutWrapper from "./StudentLayoutWrapper";

export default function StudentLayout({ children }) {
  return (
    <>
      <StudentLayoutWrapper>{children}</StudentLayoutWrapper>
    </>
  );
}
