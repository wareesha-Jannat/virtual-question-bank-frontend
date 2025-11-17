import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddSubjectMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (subject) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subjects/createSubject`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: subject }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add subject");

      return data;
    },
    onSuccess: async (data) => {
      const queryKey = ["subjects"];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData || !oldData.subjects) {
          return {
            status: "success",
            subjects: [data.newSubject],
          };
        }
        return {
          ...oldData,
          subjects: [...oldData.subjects, data.newSubject],
        };
      });

      queryClient.invalidateQueries({ queryKey });
    },
  });

  return mutation;
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (subject) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subjects/deleteSubject/${subject}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add subject");

      return data;
    },
    onSuccess: async (data) => {
      const queryKey = ["subjects"];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData || !oldData.subjects) return oldData;
        return {
          ...oldData,
          subjects: oldData.subjects.filter(
            (s) => s._id !== data.deletedSubjectId
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return mutation;
}

export function useAddTopicMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ newTopic, selectedSubject }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/topics/addTopic`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subjectId: selectedSubject, topic: newTopic }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add subject");

      return data;
    },
    onSuccess: async (data) => {
      const queryKey = ["topics", data.SubjectId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData || !oldData.topics) {
          return {
            status: "success",
            topics: [data.newTopic],
          };
        }
        return {
          ...oldData,
          subjects: [...oldData.topics, data.newTopic],
        };
      });

      queryClient.invalidateQueries({ queryKey });
    },
  });

  return mutation;
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (selectedTopic) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/topics/deleteTopic/${selectedTopic}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add subject");

      return data;
    },
    onSuccess: async (data) => {
    
      const queryKey = ["topics", data.subjectId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData || !oldData.topics) return oldData;
        return {
          ...oldData,
          topics: oldData.topics.filter((t) => t._id !== data.deletedTopicId),
        };
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return mutation;
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ questionId }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/deleteQuestion/${questionId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete Question");
      return data;
    },
    onSuccess: async (data, variables) => {
      const { currentPage, debouncedSearch, filterSubject, questionsPerPage } =
        variables;
      const queryKey = [
        "adminQuestions",
        { currentPage, debouncedSearch, filterSubject, questionsPerPage },
      ];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          questions: oldData.questions.filter((q) => q._id !== data.questionId),
        };
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });
  return mutation;
}

export function useAddQuestionMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (questionPayload) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/addQuestion`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionPayload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add Question");
      return data;
    },
    onSuccess: async (data) => {
      const queryKey = [
        "adminQuestions",
        {
          currentPage: 1,
          debouncedSearch: "",
          filterSubject: "",
          questionsPerPage: 10,
        },
      ];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          questions: [data.newQuestion, ...oldData.questions],
        };
      });

      queryClient.invalidateQueries({ queryKey });
    },
  });
  return mutation;
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ questionPayload, questionId }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/updateQuestion/${questionId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionPayload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update Question");
      return data;
    },
    onSuccess: async (data, variables) => {
      const { currentPage, debouncedSearch, filterSubject, questionsPerPage } =
        variables;
      const queryKey = [
        "adminQuestions",
        {
          currentPage,
          debouncedSearch,
          filterSubject,
          questionsPerPage,
        },
      ];

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          questions: oldData.questions.map((q) =>
            q._id === data.updatedQuestion._id ? (q = data.updatedQuestion) : q
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey });
    },
  });
  return mutation;
}
