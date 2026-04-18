import { flattenError, z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),

    // Public values (safe to expose to the browser via NEXT_PUBLIC_*)
    NEXT_PUBLIC_APP_URL: z.string().trim().url().default("http://localhost:3000"),

    // Server-only secrets / infra (optional until you wire them up)
    DATABASE_URL: z.string().trim().min(1).optional(),
    CLERK_SECRET_KEY: z.string().trim().min(1).optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().trim().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    // Vercel sets VERCEL_ENV=production for Production deployments.
    // We only enforce a non-localhost public URL in that environment so local `next build` stays usable.
    if (data.NODE_ENV === "production" && data.VERCEL_ENV === "production") {
      if (!data.NEXT_PUBLIC_APP_URL || data.NEXT_PUBLIC_APP_URL === "http://localhost:3000") {
        ctx.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_APP_URL"],
          message:
            "NEXT_PUBLIC_APP_URL must be set to your deployed URL for Vercel Production (not the localhost default).",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const flattened = flattenError(parsed.error);
  const fieldErrors = flattened.fieldErrors;

  const details = Object.entries(fieldErrors)
    .map(([key, messages]) => `${key}: ${messages?.join(", ") ?? "invalid"}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;

export type Env = typeof env;
