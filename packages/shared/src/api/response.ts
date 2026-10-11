import type { ApiResponse } from "../types";

export function normalizeApiResponse<T>(payload: unknown): ApiResponse<T> {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload as ApiResponse<T>;
  }

  return { data: payload as T };
}
