export function resolveApiBaseURL(
  configuredURL: string | undefined,
  environment: string | undefined,
): string {
  const trimmedURL = configuredURL?.trim();
  if (trimmedURL) return trimmedURL.replace(/\/+$/, "");
  return environment === "production" ? "" : "http://localhost:8000";
}
