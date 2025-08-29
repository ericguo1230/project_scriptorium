import { NextRequest } from "next/server";
import * as jose from "jose";

interface JwtPayload {
  sub: string;
  userRole: string;
  exp: number;
  tokenType: string;
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationErrorError";
  }
}

async function verifyToken(token: string): Promise<{ payload: JwtPayload }> {
  const secret = new TextEncoder().encode(process.env.JWT_ACCESS_TOKEN_SECRET);
  return await jose.jwtVerify(token, secret, {
    requiredClaims: ["exp", "sub", "userRole", "tokenType"],
  });
}

export async function authenticate(
  request: NextRequest,
  requiredRoles?: string[],
) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await verifyToken(token);

    if (requiredRoles && !requiredRoles.includes(payload.userRole)) {
      throw new AuthorizationError("User doesn't have enough permission.");
    }

    return {
      userId: parseInt(payload.sub),
      userRole: payload.userRole,
    };
  } catch (error) {
    if (error instanceof jose.errors.JOSEError) {
      throw new AuthenticationError("Invalid Token");
    }

    throw error;
  }
}

export async function authenticateOptional(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { userId: null, userRole: null };
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await verifyToken(token);

    return {
      userId: parseInt(payload.sub),
      userRole: payload.userRole,
    };
  } catch (error) {
    if (error instanceof jose.errors.JOSEError) {
      return { userId: null, userRole: null };
    }

    throw error;
  }
}
