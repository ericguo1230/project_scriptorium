import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticateOptional } from "@/utils/auth.server";


import codeExecutionService from "@/services/codeExecutionService";
import { codeExecutionSchema } from "@/schemas/codeExecutionSchema";

/**
 * @swagger
 * /api/v1/execute:
 *   post:
 *     summary: Execute code
 *     description: Execute code.
 *     tags:
 *       - Code Execution
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               stdin:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: ["python", "javascript", "java", "c", "cpp"]
 *                 example: python
 *             required:
 *               - code
 *               - language
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
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateOptional(request);
    const data = await request.json();

    const { body } = await codeExecutionSchema.parseAsync({ body: data });
    const result = await codeExecutionService.executeCode(userId, body);

    return NextResponse.json({ data: result });
  } catch (error) {
    return errorHandler(error);
  }
}
