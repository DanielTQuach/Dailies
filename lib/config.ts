import packageJson from "../package.json";
import { env } from "./env";

export const appConfig = {
  name: packageJson.name,
  version: packageJson.version,
  url: env.NEXT_PUBLIC_APP_URL,
  nodeEnv: env.NODE_ENV,
} as const;
