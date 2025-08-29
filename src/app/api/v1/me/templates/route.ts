import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticate } from "@/utils/auth.server";

import templateService from "@/services/templateService";
import { querySchema } from "@/schemas/querySchema";

/**
 * @swagger
 * /api/v1/me/templates:
 *   get:
 *     summary: Retrieve a list of templates created by the authenticated user
 *     description: Fetches a paginated list of templates with optional filters for the authenticated user.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter templates by title.
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter templates by description.
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by.
 *       - in: query
 *         name: languages
 *         schema:
 *           type: string
 *         description: Comma-separated list of programming languages to filter by.
 *     responses:
 *       200:
 *         description: Templates retrieved successfully.
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
 *                       description: Total number of templates.
 *                       example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Template"
 *       400:
 *         description: Bad request, possibly due to invalid query parameters.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });

    const title = request.nextUrl.searchParams.get("title");
    const description = request.nextUrl.searchParams.get("description");

    const tags = request.nextUrl.searchParams.get("tags");
    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : null;

    const languages = request.nextUrl.searchParams.get("languages");
    const languagesArray = languages
      ? languages.split(",").map((languages) => languages.trim())
      : null;

    const { data, count, pageCount } = await templateService.getTemplates({
      page,
      limit,
      title,
      description,
      userId,
      languages: languagesArray,
      tags: tagsArray,
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
