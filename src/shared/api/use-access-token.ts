import { useSyncExternalStore } from "react";
import { getAccessToken, subscribeAccessToken } from "./access-token";

export const useAccessToken = () =>
  useSyncExternalStore(subscribeAccessToken, getAccessToken, getAccessToken);
