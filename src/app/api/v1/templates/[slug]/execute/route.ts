import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticateOptional } from "@/utils/auth.server";


import codeExecutionService from "@/services/codeExecutionService";

/**
 * @swagger
 * /api/v1/templates/{templateId}/execute:
 *   post:
 *     summary: Execute code.
 *     description: Execute code.
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
 *         description: The unique ID of the template to retrieve blog posts for.
 *     responses:
 *       200:
 *         description: Code executed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/CodeExecution"
 *       422:
 *         description: Unprocessable entity, possibly due to invalid input data.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { userId } = await authenticateOptional(request);

    const { slug } = await params;
    const templateId = parseInt(slug);

    const result = await codeExecutionService.executeCodeFromTemplate(
      userId,
      templateId,
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    return errorHandler(error);
  }
}
