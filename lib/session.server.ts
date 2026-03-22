import { createCookie, redirect } from "react-router";
import { verifyToken, createToken } from "./auth.server";

const sessionCookie = createCookie("__session", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
});

export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// Set session cookie with JWT token
export async function createSession(user: SessionUser) {
  const token = await createToken(user);
  return sessionCookie.serialize(token);
}

// Get user from session cookie (returns null if not authenticated)
export async function getUser(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get("Cookie");
  const token = await sessionCookie.parse(cookieHeader);
  if (!token) return null;
  return verifyToken(token);
}

// Destroy session cookie
export async function destroySession() {
  return sessionCookie.serialize("", { maxAge: 0 });
}

// Require authentication — throws redirect to /login if not authenticated
export async function requireUser(request: Request, allowedRoles?: string[]): Promise<SessionUser> {
  const user = await getUser(request);

  if (!user) {
    throw redirect("/login", {
      headers: { "Set-Cookie": await destroySession() },
    });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw redirect("/login", {
      headers: { "Set-Cookie": await destroySession() },
    });
  }

  return user;
}
