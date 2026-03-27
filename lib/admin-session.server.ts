import { createCookie, redirect } from "react-router";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "laodev-admin-secret-change-in-production"
);

const adminSessionCookie = createCookie("__admin_session", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 1, // 1 day (shorter than user sessions)
  path: "/",
});

export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
}

export async function createAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(ADMIN_JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function createAdminSession(admin: AdminSession) {
  const token = await createAdminToken(admin);
  return adminSessionCookie.serialize(token);
}

export async function getAdmin(request: Request): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("Cookie");
  const token = await adminSessionCookie.parse(cookieHeader);
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function destroyAdminSession() {
  return adminSessionCookie.serialize("", { maxAge: 0 });
}

export async function requireAdmin(request: Request): Promise<AdminSession> {
  const admin = await getAdmin(request);
  if (!admin) {
    throw redirect("/admin/login", {
      headers: { "Set-Cookie": await destroyAdminSession() },
    });
  }
  return admin;
}
