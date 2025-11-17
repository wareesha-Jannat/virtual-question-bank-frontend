import AdminLayoutWrapper from "./AdminLayoutWrapper";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </>
  );
}
