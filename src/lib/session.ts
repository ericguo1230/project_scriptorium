import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { JWTPayload, SignJWT, jwtVerify } from "jose";

import { Configuration } from "@/clients/api/baseAPI.client";
import { AuthAPI } from "@/clients/api/authAPI.client";

const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET is not defined in environment variables");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Set token expiration to 7 days
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined = "") {
  if (!token) throw new Error("Session token is undefined");

  const { payload } = await jwtVerify(token, encodedKey, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function createSession(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("session");
}

export async function isAuthenticated() {
  try {
    const token = cookies().get("accessToken")?.value;
    if (!token) return false;

    await decrypt(token);
    return true;
  } catch {
    return false;
  }
}

export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }
}

export async function refreshAccessToken(): Promise<{ accessToken: string }> {
  const refreshToken = cookies().get("refreshToken")?.value;
  if (!refreshToken) {
    throw new Error("Refresh token is not found");
  }

  const configuration = new Configuration({});
  const authApi = new AuthAPI(configuration);

  const response = await authApi.refreshToken({ refreshToken });
  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const responseData = await response.json();
  return responseData.data;
}

export async function refreshAccessTokenOptional() {
  const refreshToken = cookies().get("refreshToken")?.value;

  if (!refreshToken) {
    return;
  }

  return await refreshAccessToken();
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const payload = await decrypt(accessToken);

    return {
      id: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
