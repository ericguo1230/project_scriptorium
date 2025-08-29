import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import authService from "@/services/authService";
import { authResetPasswordSchema } from "@/schemas/authSchema";

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     description: Allows an authenticated user to reset their password by providing the current password and a new password.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: The user's current password.
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The user's new password. Must meet the required minimum length and complexity.
 *                 example: "NewSecurePassword456"
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request, possibly due to invalid input format.
 *       401:
 *         description: Unauthorized, possibly due to an invalid or missing authentication token.
 *       422:
 *         description: Unprocessable entity, possibly due to incorrect current password or password policy violation.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const data = await request.json();

    const { body } = await authResetPasswordSchema.parseAsync({ body: data });

    await authService.resetPassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    return errorHandler(error);
  }
}
