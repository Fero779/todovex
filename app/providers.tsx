"use client";
import { ReactNode, useMemo } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";
import { Session as NextAuthSession } from "next-auth"; // Import Session from next-auth

// Define a new type that includes the properties of NextAuthSession and convexToken
type ExtendedSession = NextAuthSession & {
  convexToken?: string;
};

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convexTokenFromSession(session: ExtendedSession | null): string | null {
  return session?.convexToken ?? null;
}

function useAuth() {
  const { data: session, update } = useSession();

  const convexToken = convexTokenFromSession(session as ExtendedSession | null);
  return useMemo(
    () => ({
      isLoading: false,
      isAuthenticated: session !== null,
      fetchAccessToken: async ({
        forceRefreshToken,
      }: {
        forceRefreshToken: boolean;
      }) => {
        if (forceRefreshToken) {
          const updatedSession = await update();
          return convexTokenFromSession(updatedSession as ExtendedSession);
        }
        return convexToken;
      },
    }),
    [JSON.stringify(session?.user)] // Memoize based on session user
  );
}

export default function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session: ExtendedSession | null;
}) {
  return (
    <SessionProvider session={session}>
      <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuth>
    </SessionProvider>
  );
}
