import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notId) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/updateNotification/markAsRead/${notId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as read");
      return data;
    },
    onSuccess: async (data) => {
      const queryKey = ["notifications"];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((n) =>
            n._id === data.notification._id ? data.notification : n
          ),
        };
      });
    },
  });
  return mutation
}
