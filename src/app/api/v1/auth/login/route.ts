import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";

import authService from "@/services/authService";
import { authLoginSchema } from "@/schemas/authSchema";

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user by validating the credentials and returns access and refresh tokens.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: "Password123!"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully, returning tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request, possibly due to invalid input format.
 *       401:
 *         description: Unauthorized access due to incorrect credentials.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid or missing input values.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { body } = await authLoginSchema.parseAsync({ body: data });

    const tokens = await authService.loginUser(body);

    return NextResponse.json({ data: tokens });
  } catch (error) {
    return errorHandler(error);
  }
}
