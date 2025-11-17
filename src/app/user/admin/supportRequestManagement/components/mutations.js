import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRequestDeleteMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ reqId }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support/deleteRequest?reqId=${reqId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete request");
      return data;
    },
    onSuccess: async (data, variables) => {
      if (!data.success) return;
      const { debouncedSearch } = variables;
      const queryKey = ["respondedRequests", debouncedSearch];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            nextCursor: page.nextCursor,
            requests: page.requests.filter((r) => r._id !== data.reqId),
          })),
        };
      });
    },
  });
  return mutation;
}

export function useRequestUpdateMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (requestData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support/saveRequestResponse`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save response");
      return data;
    },
    onSuccess: async (data) => {
      if (!data.success) return;
      const queryKey = ["respondedRequests", ""];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueriesData(queryKey, (oldData) => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0];
        return {
          pageParams: oldData.pageParams,
          pages: [
            {
              nextCursor: firstPage.nextCursor,
              requests: [data.updatedReq, ...firstPage.requests],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
      const queryKey2 = ["newRequests"];
      await queryClient.cancelQueries({ queryKey: queryKey2 });

      queryClient.setQueryData(queryKey2, (oldData) => {
        if (!oldData) return oldData;
        return {
          newRequests: oldData.newRequests.filter(
            (r) => r._id !== data.updatedReq._id
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: queryKey2 });
    },
  });
  return mutation;
}
