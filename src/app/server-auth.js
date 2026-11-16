import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const VALID_ROLES = new Set(["Admin", "Student"]);

function getRoleFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const role = decodeJwt(token).role;
    return typeof role === "string" && VALID_ROLES.has(role) ? role : null;
  } catch {
    return null;
  }
}

export const getAuth = async () => {
  try {
    const cookieStore = await cookies();
    const role =
      getRoleFromToken(cookieStore.get("accessToken")?.value) ??
      getRoleFromToken(cookieStore.get("refreshToken")?.value);

    if (!role) {
      return { role: "unauthorized", status: "unauthorized" };
    }

    return {
      role,
    };
  } catch {
    return { role: "unauthorized", status: "unauthorized" };
  }
};
