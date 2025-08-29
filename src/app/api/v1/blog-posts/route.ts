import { NextRequest, NextResponse } from "next/server";
import { authenticate, authenticateOptional } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import { StatusCodes } from "http-status-codes";

import blogPostService from "@/services/blogPostService";
import {
  blogPostCreateSchema,
  blogPostGetSchema,
} from "@/schemas/blogPostSchema";
import { querySchema } from "@/schemas/querySchema";

/**
 * @swagger
 * /api/v1/blog-posts:
 *   get:
 *     summary: Retrieve a list of blog posts
 *     description: Fetches a paginated list of blog posts with optional filters and sorting.
 *     tags:
 *       - Blog Posts
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
 *         description: Filter blog posts by title.
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter blog posts by description.
 *       - in: query
 *         name: templateContent
 *         schema:
 *           type: string
 *         description: Filter blog posts by template content.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["createdAt", "rating", "controversial"]
 *         description: Field to sort by (e.g., 'createdAt'). Options are 'createdAt', 'rating', and 'controversial', 'controversial' is determined by the total number of ratings.
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           example: "asc"
 *         description: Sort direction, either ascending (asc) or descending (desc).
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by.
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
 *         description: Bad request, possibly due to invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateOptional(request);
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });
    const { query } = blogPostGetSchema.parse({
      query: {
        title: request.nextUrl.searchParams.get("title"),
        description: request.nextUrl.searchParams.get("description"),
        templateContent: request.nextUrl.searchParams.get("templateContent"),
        sortBy: request.nextUrl.searchParams.get("sortBy"),
        sortDirection: request.nextUrl.searchParams.get("sortDirection"),
        tags: request.nextUrl.searchParams.get("tags"),
      },
    });

    const tagsArray = query.tags
      ? query.tags.split(",").map((tag: string) => tag.trim())
      : null;

    const { data, count, pageCount } = await blogPostService.getBlogPosts({
      userId: userId || undefined,
      showAll: false,
      page,
      limit,
      title: query.title,
      description: query.description,
      tags: tagsArray,
      templateContent: query.templateContent,
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

/**
 * @swagger
 * /api/v1/blog-posts:
 *   post:
 *     summary: Create a new blog post
 *     description: Allows an authenticated user to create a new blog post.
 *     tags:
 *       - Blog Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog post.
 *                 example: "Getting Started with Templates"
 *               description:
 *                 type: string
 *                 description: Short description of the blog post.
 *                 example: "An introductory guide on templates."
 *               content:
 *                 type: string
 *                 description: Full content of the blog post.
 *                 example: "Lorem ipsum dolor sit amet..."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with the blog post.
 *                 example: ["guide", "templates"]
 *               links:
 *                 type: array
 *                 items:
 *                   type: number
 *                   description: Templates associated with the blog post.
 *                 example: [1, 2]
 *             required:
 *               - title
 *               - description
 *               - content
 *     responses:
 *       201:
 *         description: Blog post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Blog"
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid input data.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const data = await request.json();

    const { body } = await blogPostCreateSchema.parseAsync({ body: data });

    const blogPost = await blogPostService.createBlogPost({
      userId,
      ...body,
    });

    return NextResponse.json(blogPost, { status: StatusCodes.CREATED });
  } catch (error) {
    return errorHandler(error);
  }
}
