import { prisma } from "@/clients";
import { User } from "@prisma/client";

import { StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";

import * as jose from "jose";
import * as argon2 from "argon2";

interface RegisterUserParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface LoginParams {
  email: string;
  password: string;
}

const alg = "HS256";

export class AuthService {
  async registerUser({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
  }: RegisterUserParams) {
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
      },
      omit: {
        password: true,
      },
    });

    return user;
  }

  async generateAccessToken(user: User) {
    const secret = new TextEncoder().encode(
      process.env.JWT_ACCESS_TOKEN_SECRET,
    );
    const token = await new jose.SignJWT({
      userRole: user.role,
      tokenType: "access",
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setSubject(user.id.toString())
      .setExpirationTime(process.env.JWT_ACCESS_TOKEN_EXPIRATION)
      .sign(secret);

    return token;
  }

  async generateRefreshToken(user: User) {
    const secret = new TextEncoder().encode(
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );
    const token = await new jose.SignJWT({ tokenType: "refresh" })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setSubject(user.id.toString())
      .setExpirationTime(process.env.JWT_REFRESH_TOKEN_EXPIRATION)
      .sign(secret);

    return token;
  }

  async loginUser({ email, password }: LoginParams) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "User with given credentials not found",
      );
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async refreshUserToken(refreshToken: string) {
    const secret = new TextEncoder().encode(
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );
    const { payload } = await jose.jwtVerify(refreshToken, secret, {
      requiredClaims: ["exp", "sub", "tokenType"],
    });

    const userId = parseInt(payload.sub!);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createHttpError(StatusCodes.NOT_FOUND, "User not found");
    }

    const accessToken = await this.generateAccessToken(user);

    return accessToken;
  }

  async resetPassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !(await argon2.verify(user.password, currentPassword))) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "User with given credentials not found",
      );
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }
}

const authService = new AuthService();
export default authService;
