import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import { StatusCodes } from "http-status-codes";

import reportService from "@/services/reportService";
import { blogPostReportSchema } from "@/schemas/blogPostSchema";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/comments/{commentId}/report:
 *   post:
 *     summary: Report a comment
 *     description: Allows an authenticated user to report a specific blog post with an explanation.
 *     tags:
 *       - Blog Post Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the comment to report.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               explanation:
 *                 type: string
 *                 description: Explanation of why the comment is being reported.
 *                 example: "This comment contains inappropriate content."
 *             required:
 *               - explanation
 *     responses:
 *       201:
 *         description: Report submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportId:
 *                   type: integer
 *                   description: Unique identifier for the report.
 *                   example: 101
 *                 userId:
 *                   type: integer
 *                   description: ID of the user who submitted the report.
 *                   example: 123
 *                 blogPostId:
 *                   type: integer
 *                   description: ID of the reported blog post.
 *                   example: 456
 *                 commentId:
 *                   type: integer
 *                   description: ID of the reported comment.
 *                   example: 456
 *                 explanation:
 *                   type: string
 *                   description: Explanation provided by the user.
 *                   example: "This comment contains inappropriate content."
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Date and time when the report was created.
 *                   example: "2024-10-31T12:00:00.000Z"
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Comment not found.
 *       409:
 *         description: Conflict due to duplicate data.
 *       422:
 *        description: Unprocessable entity, possibly due to invalid input data.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try {
    const { userId } = await authenticate(request);
    const data = await request.json();
    const commentId = parseInt(params.commentId);

    const { body } = await blogPostReportSchema.parseAsync({ body: data });

    const report = await reportService.reportComment(
      userId,
      commentId,
      body.explanation,
    );

    return NextResponse.json(report, { status: StatusCodes.CREATED });
  } catch (error) {
    return errorHandler(error);
  }
}
