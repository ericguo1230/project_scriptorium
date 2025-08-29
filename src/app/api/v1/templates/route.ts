import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { authenticate } from "@/utils/auth.server";
import { StatusCodes } from "http-status-codes";

import templateService from "@/services/templateService";
import { templateCreateSchema } from "@/schemas/templateSchema";
import { querySchema } from "@/schemas/querySchema";

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: Retrieve a list of templates
 *     description: Fetches a paginated list of templates with optional filters.
 *     tags:
 *       - Templates
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
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter templates by user ID.
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
 *                       example: 1
 *                     totalCount:
 *                       type: integer
 *                       description: Total number of templates.
 *                       example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Template"
 *       400:
 *         description: Bad request, possibly due to invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });

    const title = request.nextUrl.searchParams.get("title");
    const description = request.nextUrl.searchParams.get("description");
    const userId = request.nextUrl.searchParams.get("userId");
    const userIdInt = userId ? parseInt(userId) : null;

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
      userId: userIdInt,
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

/**
 * @swagger
 * /api/v1/templates:
 *   post:
 *     summary: Create a new template
 *     description: Allows an authenticated user to create a new template with specified details.
 *     tags:
 *       - Templates
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
 *                 description: The title of the template. Each user can have only one template with the same title.
 *                 example: "Sample Template"
 *               description:
 *                 type: string
 *                 description: The description of the template.
 *                 example: "A description of the sample template."
 *               code:
 *                 type: string
 *                 description: The code content of the template.
 *                 example: "console.log('Hello, world!');"
 *               stdin:
 *                 type: string
 *                 description: Optional standard input for code execution.
 *                 example: "input data"
 *               language:
 *                 type: string
 *                 description: Programming language of the template.
 *                 example: "javascript"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with the template.
 *                 example: ["example", "template"]
 *             required:
 *               - title
 *               - description
 *               - code
 *               - language
 *     responses:
 *       201:
 *         description: Template created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   $ref: "#/components/schemas/Template"
 *       400:
 *         description: Bad request, possibly due to invalid input format.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid or missing input values.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const data = await request.json();

    await templateCreateSchema.parseAsync({ body: data });

    const template = await templateService.createTemplate({
      userId: userId,
      title: data.title,
      description: data.description,
      code: data.code,
      stdin: data.stdin,
      language: data.language,
      tags: data.tags,
    });

    return NextResponse.json(
      { data: template },
      { status: StatusCodes.CREATED },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
