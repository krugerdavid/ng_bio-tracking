export const getEnvironment = (): string => {
  return import.meta.env.VITE_ENVIRONMENT || "development";
};

export const isStaging = (): boolean => {
  const env = getEnvironment();
  return env === "staging";
};

export const isProduction = (): boolean => {
  const env = getEnvironment();
  return env === "production";
};

export const isDevelopment = (): boolean => {
  const env = getEnvironment();
  return env === "development";
};

