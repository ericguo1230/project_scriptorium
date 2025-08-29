import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import blogPostService from "@/services/blogPostService";
import { errorHandler } from "@/utils/api";
import { blogPostRateSchema } from "@/schemas/blogPostSchema";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/rate:
 *   post:
 *     summary: Rate a blog post
 *     description: Allows an authenticated user to rate a specific blog post. New ratings will overwrite existing ratings.
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
 *         description: The unique ID of the blog post to rate.
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
 *         description: Blog post rated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blog post rated successfully"
 *                 netRating:
 *                   type: integer
 *                   description: Updated net rating of the blog post.
 *                   example: 5
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Blog post not found.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid input data.
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

    const blogPostId = parseInt(params.blogPostId);

    const { body } = await blogPostRateSchema.parseAsync({ body: data });

    const response = await blogPostService.rateBlogPost(
      userId,
      blogPostId,
      body.rating,
    );

    return NextResponse.json(response);
  } catch (error) {
    return errorHandler(error);
  }
}
