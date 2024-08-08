"use client";
import { ReactNode, useMemo } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

interface ExtendedSession extends Session {
  convexToken?: string;
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convexTokenFromSession(session: ExtendedSession | null): string | null {
  return session?.convexToken ?? null;
}

function useAuth() {
  const { data: session, update } = useSession();

  const convexToken = convexTokenFromSession(session);
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
          const session = await update() as ExtendedSession;

          return convexTokenFromSession(session);
        }
        return convexToken;
      },
    }),
   
    [JSON.stringify(session?.user)]
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
