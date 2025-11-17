import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({userId}) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/deleteUser/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete User");
      return data;
    },
    onSuccess: async (data, variables) => {
      const { currentPage, debouncedSearch, filterRole, usersPerPage } =
        variables;
      const queryKey = [
        "users",
        { currentPage, debouncedSearch, filterRole, usersPerPage },
      ];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users: oldData.users.filter((u) => u._id !== data.userId),
        };
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });
  return mutation;
}

export function useAddUserMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/addUser`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add User");
      return data;
    },
    onSuccess: async (data) => {
      const queryKey = [
        "users",
        {
          currentPage: 1,
          debouncedSearch: "",
          filterRole: "",
          usersPerPage: 10,
        },
      ];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users: [data.newUser, ...oldData.users],
        };
      });

      queryClient.invalidateQueries({ queryKey });
    },
  });
  return mutation;
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ formData, userId }) => {
     const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/updateUser/${userId}`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();;
      if (!res.ok) throw new Error(data.message || "Failed to update User");
      return data;
    },
    onSuccess: async (data, variables) => {
      const { currentPage, debouncedSearch, filterRole, usersPerPage } =
        variables;
      const queryKey = [
        "users",
        {
          currentPage,
          debouncedSearch,
          filterRole,
          usersPerPage,
        },
      ];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users: oldData.users.map((u) =>
            u._id === data.updatedUser._id ? (u = data.updatedUser) : u
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey });
    },
  });
  return mutation;
}
