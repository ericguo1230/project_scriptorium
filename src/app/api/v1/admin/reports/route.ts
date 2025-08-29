import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import reportService from "@/services/reportService";

import { adminReportGetSchema } from "@/schemas/adminReportSchema";
import { querySchema } from "@/schemas/querySchema";

/**
 * @swagger
 * /api/v1/admin/reports:
 *   get:
 *     summary: Retrieve a list of reports
 *     description: Allows an admin to retrieve a paginated list of reports with optional filters by status.
 *     tags:
 *       - Admin
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *           example: "open"
 *         description: Filter reports by their status.
 *     responses:
 *       200:
 *         description: Reports retrieved successfully.
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
 *                       description: Total number of reports.
 *                       example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the report.
 *                         example: 101
 *                       status:
 *                         type: string
 *                         description: Status of the report.
 *                         example: "pending"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the report was created.
 *                         example: "2024-10-31T12:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the report was last updated.
 *                         example: "2024-10-31T14:00:00.000Z"
 *                       explanation:
 *                         type: string
 *                         description: Explanation provided by the user for the report.
 *                         example: "This post contains inappropriate content."
 *       400:
 *         description: Bad request, possibly due to invalid query parameters.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       403:
 *         description: Forbidden, user lacks the necessary permissions to access this resource.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    await authenticate(request, ["admin"]);
    const { page, limit } = querySchema.parse({
      page: request.nextUrl.searchParams.get("page"),
      limit: request.nextUrl.searchParams.get("limit"),
    });

    const { query } = await adminReportGetSchema.parseAsync({
      query: {
        status: request.nextUrl.searchParams.get("status"),
      },
    });

    const { data, count, pageCount } = await reportService.getReports({
      page,
      limit,
      status: query.status || undefined,
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
