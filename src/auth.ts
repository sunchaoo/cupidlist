import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";

/**
 * Auth.js (NextAuth v5) configuration — "Sign in with LinkedIn" via OIDC.
 *
 * The LinkedIn provider is only enabled when its credentials are present, so
 * the app runs fine as a guest experience until you add them. To turn real
 * login on:
 *   1. Create a LinkedIn app (https://www.linkedin.com/developers/apps) and add
 *      the "Sign In with LinkedIn using OpenID Connect" product.
 *   2. Set the redirect URL to: <your-domain>/api/auth/callback/linkedin
 *   3. Provide these env vars (see .env.example):
 *        AUTH_SECRET, AUTH_LINKEDIN_ID, AUTH_LINKEDIN_SECRET
 *        NEXT_PUBLIC_AUTH_ENABLED=true   (shows the sign-in button in the UI)
 */
const linkedInConfigured =
  !!process.env.AUTH_LINKEDIN_ID && !!process.env.AUTH_LINKEDIN_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: linkedInConfigured
    ? [
        LinkedIn({
          clientId: process.env.AUTH_LINKEDIN_ID,
          clientSecret: process.env.AUTH_LINKEDIN_SECRET,
        }),
      ]
    : [],
  session: { strategy: "jwt" },
  // Trust the deployment host (Vercel preview/prod). Fallback secret keeps the
  // guest/demo deploy from 500-ing before real credentials are configured —
  // it signs nothing sensitive since no providers are active without real env.
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? "cupidlist-dev-insecure-secret",
});
