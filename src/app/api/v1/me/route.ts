import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticate } from "@/utils/auth.server";

import userService from "@/services/userService";
import { userUpdateSchema } from "@/schemas/userSchema";

/**
 * @swagger
 * /api/v1/me:
 *   get:
 *     summary: Get user information
 *     description: Retrieves the authenticated user's information by their user ID.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const users = await userService.getUserById(userId);

    return NextResponse.json({ data: users });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/me:
 *   patch:
 *     summary: Update user information
 *     description: Updates the authenticated user's information with the provided data.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
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
 *                 example: "updateduser@example.com"
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 example: "Jane"
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 example: "Smith"
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: Optional URL for the user's avatar image.
 *                 example: "https://example.com/avatar.jpg"
 *               phoneNumber:
 *                 type: string
 *                 description: Optional phone number of the user.
 *                 example: "+9876543210"
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   $ref: "#/components/schemas/User"
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid or missing input values.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);

    const data = await request.json();
    const { body } = await userUpdateSchema.parseAsync({ body: data });

    const updatedUser = await userService.updateUser(userId, body);

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    return errorHandler(error);
  }
}
