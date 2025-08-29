import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";

import authService from "@/services/authService";

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses a valid refresh token to issue a new access token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token provided during login.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
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
    const { refreshToken } = await request.json();

    const accessToken = await authService.refreshUserToken(refreshToken);

    return NextResponse.json({ data: { accessToken } });
  } catch (error) {
    return errorHandler(error);
  }
}
