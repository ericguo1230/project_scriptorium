import { NextRequest, NextResponse } from "next/server";
import { authenticateOptional } from "@/utils/auth.server";

import { errorHandler } from "@/utils/api";

import blogPostService from "@/services/blogPostService";
import { querySchema } from "@/schemas/querySchema";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/comments/{commentId}/replies:
 *   get:
 *     summary: Retrieve replies to a specific comment
 *     description: Fetches a paginated list of replies for a specific comment on a blog post, with optional authentication to view hidden comments.
 *     tags:
 *       - Blog Post Comments
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post the comment belongs to.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the comment to retrieve replies for.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: Replies retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _metadata:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     pageCount:
 *                       type: integer
 *                       description: Total number of pages.
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       description: Total number of replies.
 *                       example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogComment'
 *       400:
 *         description: Bad request, possibly due to invalid query parameters.
 *       404:
 *         description: Comment not found or has no replies.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogPostId: string; commentId: string }> },
) {
  try {
    const { userId } = await authenticateOptional(request);
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });

    const { commentId } = await params;
    const commentIdInt = parseInt(commentId);

    const { data, count, pageCount } = await blogPostService.getCommentReplies({
      page,
      limit,
      userId: userId || undefined,
      commentId: commentIdInt,
    });

    return NextResponse.json({
      _metadata: {
        page,
        perPage: limit,
        pageCount,
        totalCount: count,
      },
      data,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
