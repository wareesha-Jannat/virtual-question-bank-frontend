import { useQuery } from "@tanstack/react-query";
import { checkUnreadNotifications } from "../utils";

export function useUnreadNot(options={}) {
  return useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: () => checkUnreadNotifications(),
    refetchInterval: 1000 * 60 * 2,
    enabled: options.enabled,
  });
}
