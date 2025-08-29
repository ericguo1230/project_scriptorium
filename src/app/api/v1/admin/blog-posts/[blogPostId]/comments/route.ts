import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";

import { errorHandler } from "@/utils/api";

import blogPostService from "@/services/blogPostService";
import { querySchema } from "@/schemas/querySchema";
import { commentGetSchema } from "@/schemas/adminBlogPostSchema";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

/**
 * @swagger
 * /api/v1/admin/blog-posts/{blogPostId}/comments:
 *   get:
 *     summary: Retrieve comments for a blog post for admin, which enables sort by reports.
 *     description: Fetches a paginated list of comments for a specific blog post with optional sorting.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to retrieve comments for.
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["createdAt", "rating", "controversial", "report"]
 *           example: "createdAt"
 *         description: Field to sort by (e.g., 'createdAt').
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *         description: Sort direction, either ascending (asc) or descending (desc).
 *     responses:
 *       200:
 *         description: Comments retrieved successfully.
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
 *                       description: Total number of comments.
 *                       example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogComment'
 *       400:
 *         description: Bad request, possibly due to invalid query parameters.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Blog post not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogPostId: string }> },
) {
  try {
    await authenticate(request, ["admin"]);
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });

    const { blogPostId } = await params;
    const blogPostIdInt = parseInt(blogPostId);
    if (isNaN(blogPostIdInt)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid blog post ID.");
    }

    const { query } = await commentGetSchema.parseAsync({
      query: {
        sortBy: request.nextUrl.searchParams.get("sortBy"),
        sortDirection: request.nextUrl.searchParams.get("sortDirection"),
      },
    });

    const { data, count, pageCount } = await blogPostService.getComments({
      page,
      limit,
      blogPostId: blogPostIdInt,
      showAll: true,
      sortOption: { field: query.sortBy, direction: query.sortDirection },
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
