import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticate } from "@/utils/auth.server";
import { StatusCodes } from "http-status-codes";

import templateService from "@/services/templateService";

/**
 * @swagger
 * /api/v1/templates/{templateId}/fork:
 *   post:
 *     summary: Fork a template
 *     description: Creates a fork of an existing template for the authenticated user. Note that you cannot fork your own template.
 *     tags:
 *       - Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the template to fork.
 *     responses:
 *       201:
 *         description: Template forked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Template forked successfully"
 *       400:
 *         description: Bad request, possibly due to an invalid template ID.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Template not found.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { userId } = await authenticate(request);

    const { slug } = await params;
    const templateId = parseInt(slug);

    const id = await templateService.forkTemplate(userId, templateId);

    return NextResponse.json(
      { message: "Template forked successfully",
        templateId: id,
       },
      { status: StatusCodes.CREATED },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
