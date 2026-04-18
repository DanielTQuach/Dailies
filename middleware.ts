import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk is integrated here. Route protection for private areas is added in the next commit.
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
