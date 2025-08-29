import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticate } from "@/utils/auth.server";

import userService from "@/services/userService";
import { avatarUploadSchema } from "@/schemas/userSchema";

/**
 * @swagger
 * /api/v1/me/avatar:
 *   put:
 *     summary: Upload or update user avatar
 *     description: Allows an authenticated user to upload and update their avatar image.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file to be uploaded.
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       description: The filename of the uploaded avatar.
 *                       example: "avatar12345.png"
 *       400:
 *         description: Bad request, possibly due to invalid file format or missing file.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid file upload data.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);

    const formData = await request.formData();
    const { body } = await avatarUploadSchema.parseAsync({ body: formData });

    const filename = await userService.uploadAvatar(userId, body.file);

    return NextResponse.json({ data: { filename } });
  } catch (error) {
    return errorHandler(error);
  }
}
