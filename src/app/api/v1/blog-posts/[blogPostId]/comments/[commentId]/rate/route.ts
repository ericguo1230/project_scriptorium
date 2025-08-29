import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import blogPostService from "@/services/blogPostService";
import { errorHandler } from "@/utils/api";
import { blogPostRateSchema } from "@/schemas/blogPostSchema";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/comments/{commentId}/rate:
 *   post:
 *     summary: Rate a comment on a blog post
 *     description: Allows an authenticated user to rate a specific comment on a blog post.
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
 *         description: The unique ID of the comment to rate.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: string
 *                 enum: ["+1", "-1"]
 *                 description: Rating given to the blog post (e.g., +1 for upvote, -1 for downvote).
 *                 example: "+1"
 *             required:
 *               - rating
 *     responses:
 *       200:
 *         description: Comment rated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment rated successfully"
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Comment not found.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid input data.
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

    const { body } = await blogPostRateSchema.parseAsync({ body: data });

    await blogPostService.rateComment(userId, commentId, body.rating);

    return NextResponse.json({ message: "Comment rated successfully" });
  } catch (error) {
    return errorHandler(error);
  }
}
