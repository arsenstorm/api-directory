export function checkEnv(env: string[]) {
  for (const envVar of env) {
    if (!process.env[envVar]) {
      return {
        check: false,
        message: `Missing environment variable: ${envVar}`,
      };
    }
  }
  return {
    check: true,
    message: "All environment variables are set.",
  };
}
