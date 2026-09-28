import { cookies } from "next/headers";

export const getAuth = async () => {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me/role`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );
    if (res.status === 401) {
      return {
        role: "unauthorized",
        status: "unauthorized",
      };
    }
    const data = await res.json();

    if (!res.ok) {
      return {
        role: "unauthorized",
      };
    }

    return {
      role: data?.role,
    };
  } catch (error) {
    return {
      role: "unauthorized",
    };
  }
};
