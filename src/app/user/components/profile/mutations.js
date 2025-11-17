import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAccountMutation() {
  const mutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/deleteAccount/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete Account");
      return data;
    },
  });
  return mutation;
}

export function useUpdatePersonalInfoMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, formData }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/updatePersonalInfo/${userId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      if (!res.ok) throw new Error(data.message || "failed to update info");
      const data = await res.json();
      return data;
    },
    onSuccess: async (data) => {
      if (!data.success) return;
      const queryKey = ["user profile"];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user: data.updatedInfo,
        };
      });
    },
  });
  return mutation;
}
