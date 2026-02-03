/** Base URL for the Laravel REST API (e.g. https://ng-api.krugerdavid.com/api). */
export const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL ?? "https://ng-api.krugerdavid.com";
  return url.endsWith("/api") ? url : `${url.replace(/\/$/, "")}/api`;
};
