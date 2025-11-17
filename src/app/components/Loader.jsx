"use client";
import { Roller } from "react-css-spinners";

export default function Loader({
  height = "100%",
  width = "100%",
  size = 30,
  color = "#3498db",
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
      }}
    >
      <Roller color={color} size={size} />
    </div>
  );
}
