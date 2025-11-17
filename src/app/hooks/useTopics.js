import { useQuery } from "@tanstack/react-query";
import { getTopics } from "../utils";

export const useTopics = (subjectId, options = {}) => {
  return useQuery({
    queryKey: ["topics", subjectId],
    queryFn: () => getTopics(subjectId),
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 10,
    enabled: !!subjectId,
    ...options,
  });
};
