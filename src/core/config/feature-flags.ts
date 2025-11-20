/**
 * Feature flags configuration
 * Allows enabling/disabling features at runtime
 */

export const isFeatureEnabled = (feature: string): boolean => {
  const envValue = import.meta.env[`VITE_FEATURE_${feature}`];
  return envValue === "true" || envValue === true;
};
