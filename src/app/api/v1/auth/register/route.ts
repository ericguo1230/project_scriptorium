import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "@/utils/api";

import authService from "@/services/authService";
import { authRegisterSchema } from "@/schemas/authSchema";

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided registration details.
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
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password. Must be at least the minimum length required.
 *                 example: "SecurePassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the user's password. Must match the password field.
 *                 example: "SecurePassword123"
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 example: "Doe"
 *               phoneNumber:
 *                 type: string
 *                 description: Optional phone number of the user.
 *                 example: "+1234567890"
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - firstName
 *               - lastName
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   $ref: "#/components/schemas/User"
 *       400:
 *         description: Bad request, possibly due to invalid input format.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid or missing input values (e.g., non-matching passwords).
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { body } = await authRegisterSchema.parseAsync({ body: data });

    const user = await authService.registerUser(body);

    return NextResponse.json({ data: user }, { status: StatusCodes.CREATED });
  } catch (error) {
    return errorHandler(error);
  }
}
