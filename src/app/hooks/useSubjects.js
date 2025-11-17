import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "../utils";

export const useSubjects = () => {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => getSubjects(),
    staleTime: Infinity,
    fetchOnReconnect: true,
  });
};
