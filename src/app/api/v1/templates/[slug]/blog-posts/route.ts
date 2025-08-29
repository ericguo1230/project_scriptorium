import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";

import blogPostService from "@/services/blogPostService";
import { querySchema } from "@/schemas/querySchema";
import { StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";

/**
 * @swagger
 * /api/v1/templates/{templateId}/blog-posts:
 *   get:
 *     summary: Retrieve blog posts by template ID
 *     description: Fetches a paginated list of blog posts associated with a specific template.
 *     tags:
 *       - Templates
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the template to retrieve blog posts for.
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
 *         description: Blog posts retrieved successfully.
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
 *                       description: Total number of blog posts.
 *                       example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Blog"
 *       400:
 *         description: Bad request, possibly due to invalid query parameters or template ID.
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
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });

    const { slug } = await params;
    const templateId = parseInt(slug);

    if (isNaN(templateId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid template ID.");
    }

    const { data, count, pageCount } =
      await blogPostService.getBlogPostsByTemplate(templateId, { page, limit });

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
