import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticate } from "@/utils/auth.server";

import templateService from "@/services/templateService";
import { templateUpdateSchema } from "@/schemas/templateSchema";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

/**
 * @swagger
 * /api/v1/templates/{templateId}:
 *   get:
 *     summary: Retrieve a template by ID
 *     description: Fetches a specific template by its unique ID.
 *     tags:
 *       - Templates
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the template to retrieve.
 *     responses:
 *       200:
 *         description: Template retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/Template"
 *       400:
 *         description: Bad request, possibly due to an invalid template ID.
 *       404:
 *         description: Template not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const templateId = parseInt(slug);

    if (isNaN(templateId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid template ID");
    }

    // Fetch the template details
    const template = await templateService.getTemplateById(templateId);

    return NextResponse.json({ data: template });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/templates/{templateId}:
 *   patch:
 *     summary: Update a template
 *     description: Updates the specified fields of a template owned by the authenticated user.
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
 *         description: The unique ID of the template to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the template.
 *                 example: "My Updated Template"
 *               description:
 *                 type: string
 *                 description: The description of the template.
 *                 example: "An updated description of the template."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: An array of tags associated with the template.
 *                 example: ["tag1", "tag2"]
 *               language:
 *                 type: string
 *                 description: The language of the template.
 *                 example: "javascript"
 *               stdin:
 *                 type: string
 *                 description: Optional standard input for code execution.
 *                 example: "input data"
 *               code:
 *                 type: string
 *                 description: The code content of the template.
 *                 example: "console.log('Hello, world!');"
 *     responses:
 *       200:
 *         description: Template updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/Template"
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       403:
 *         description: Forbidden, possibly due to insufficient permissions.
 *       404:
 *         description: Template not found.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { userId } = await authenticate(request);
    const { slug } = await params;
    const templateId = parseInt(slug);

    const data = await request.json();
    await templateUpdateSchema.parseAsync({ body: data });

    const updatedTemplate = await templateService.updateTemplate(
      userId,
      templateId,
      data,
    );

    return NextResponse.json({ data: updatedTemplate });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/templates/{templateId}:
 *   delete:
 *     summary: Delete a template
 *     description: Deletes a template owned by the authenticated user.
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
 *         description: The unique ID of the template to delete.
 *     responses:
 *       200:
 *         description: Template deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Template deleted successfully"
 *       400:
 *         description: Bad request, possibly due to an invalid template ID.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Template not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { userId } = await authenticate(request);
    const { slug } = await params;
    const templateId = parseInt(slug);

    await templateService.deleteTemplate(userId, templateId);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    return errorHandler(error);
  }
}
