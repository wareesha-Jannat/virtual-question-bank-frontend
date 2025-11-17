import { Roller } from "react-css-spinners";

function Loading() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Roller color="#3498db" size={30} />
      </div>
    </>
  );
}

export default Loading;
