import NextAuth, { type NextAuthConfig } from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Social providers are each enabled only when their credentials are present,
 * so the app runs as a guest experience until you add them — and each provider
 * activates independently. The UI auto-shows a button for every enabled
 * provider (it reads /api/auth/providers), so no extra flags are needed.
 *
 * For each provider you want, create an OAuth app, set its redirect URL to
 *   <your-domain>/api/auth/callback/<provider>
 * and add the env vars below (see .env.example):
 *   - LinkedIn: AUTH_LINKEDIN_ID / AUTH_LINKEDIN_SECRET
 *               (add "Sign In with LinkedIn using OpenID Connect" product)
 *   - Google:   AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
 *   - Facebook: AUTH_FACEBOOK_ID / AUTH_FACEBOOK_SECRET
 * Plus AUTH_SECRET for all of them.
 */
const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET) {
  providers.push(
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    })
  );
}

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    // Persist a stable per-user id on the token. OIDC providers (LinkedIn,
    // Google) expose `sub`; others (Facebook) use `id`. Fall back to NextAuth's
    // default token.sub if neither is present.
    async jwt({ token, profile }) {
      const p = profile as { sub?: string; id?: string } | undefined;
      const id = p?.sub ?? p?.id;
      if (id) token.sub = String(id);
      return token;
    },
    // Expose that id on the session so server code can scope data per user.
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  // Trust the deployment host (Vercel preview/prod). Fallback secret keeps the
  // guest/demo deploy from 500-ing before real credentials are configured —
  // it signs nothing sensitive since no providers are active without real env.
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? "cupidlist-dev-insecure-secret",
});
