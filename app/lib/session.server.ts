import { createCookieSessionStorage, redirect } from "react-router";
import { getDbSession, createDbSession, deleteDbSession, getUserById } from "./db.server";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__mitrostart_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "dev-secret-change-me"],
    secure: process.env.NODE_ENV === "production",
  },
});

function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserFromRequest(request: Request) {
  const session = await getSession(request);
  const sessionId = session.get("sessionId");
  if (!sessionId) return null;

  const dbSession = getDbSession(sessionId);
  if (!dbSession) return null;

  const user = getUserById(dbSession.userId);
  return user || null;
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  const dbSessionId = createDbSession(userId);
  session.set("sessionId", dbSessionId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request);
  const sessionId = session.get("sessionId");
  if (sessionId) {
    deleteDbSession(sessionId);
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function requireUser(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  }
  return user;
}
