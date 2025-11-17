import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support/createRequest`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
        
      }

      if (!res.ok) throw new Error(data.message || "Failed to create request");
      return data;
    },
    onSuccess: async (data) => {
      if (!data.success) return;
      const queryKey = ["userRequests", ""];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueriesData(queryKey, (oldData) => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0];
        return {
          pageParams: oldData.pageParams,
          pages: [
            {
              nextCursor: firstPage.nextCursor,
              requests: [data.newSupportRequest, ...firstPage.requests],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });
  return mutation;
}
