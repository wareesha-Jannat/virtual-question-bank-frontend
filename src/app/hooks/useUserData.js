import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useUserData() {
  const router = useRouter();
  return useQuery({
    queryKey: ["user profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) throw new Error(data.message || "Failed to fetch data");
      return data;
    },
    retry: false, // don't retry login failures
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 5,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });
}
