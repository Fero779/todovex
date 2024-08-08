"use client";
import { ReactNode, useMemo } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

// Define the ExtendedSession interface that includes the optional convexToken
interface ExtendedSession extends Omit<Session, "convexToken"> {
  convexToken?: string;
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convexTokenFromSession(session: ExtendedSession | null): string | null {
  return session?.convexToken ?? null;
}

function useAuth() {
  const { data: session, update } = useSession<ExtendedSession>();

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
          const updatedSession = await update();

          return convexTokenFromSession(updatedSession as ExtendedSession);
        }
        return convexToken;
      },
    }),
    // We only care about the user changes, and don't want to
    // bust the memo when we fetch a new token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
