import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import { StatusCodes } from "http-status-codes";

import reportService from "@/services/reportService";
import { blogPostReportSchema } from "@/schemas/blogPostSchema";
import createHttpError from "http-errors";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/report:
 *   post:
 *     summary: Report a blog post
 *     description: Allows an authenticated user to report a specific blog post with an explanation.
 *     tags:
 *       - Blog Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to report.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               explanation:
 *                 type: string
 *                 description: Explanation of why the blog post is being reported.
 *                 example: "This post contains inappropriate content."
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
 *                 explanation:
 *                   type: string
 *                   description: Explanation provided by the user.
 *                   example: "This post contains inappropriate content."
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
 *         description: Blog post not found.
 *       409:
 *         description: Conflict due to duplicate data.
 *       422:
 *        description: Unprocessable entity, possibly due to invalid input data.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { blogPostId: string } },
) {
  try {
    const { userId } = await authenticate(request);
    const data = await request.json();

    const { body } = await blogPostReportSchema.parseAsync({ body: data });

    const blogPostId = parseInt(params.blogPostId);
    if (isNaN(blogPostId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid blog post ID.");
    }

    const report = await reportService.reportBlogPost({
      userId,
      blogPostId,
      explanation: body.explanation,
    });

    return NextResponse.json({ data: report }, { status: StatusCodes.CREATED });
  } catch (error) {
    return errorHandler(error);
  }
}
