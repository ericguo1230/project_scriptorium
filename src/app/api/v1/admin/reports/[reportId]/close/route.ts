import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import { StatusCodes } from "http-status-codes";
import reportService from "@/services/reportService";
import createHttpError from "http-errors";

/**
 * @swagger
 * /api/v1/admin/reports/{reportId}/close:
 *   post:
 *     summary: Close a report
 *     description: Allows an admin to close a specific report which hides the post or comment.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the report to close.
 *     responses:
 *       200:
 *         description: Report closed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report successfully closed."
 *       400:
 *         description: Bad request, possibly due to invalid report ID.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       403:
 *         description: Forbidden, user lacks the necessary permissions to approve reports.
 *       404:
 *         description: Report not found.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    await authenticate(request, ["admin"]);
    const { reportId } = await params;
    const reportIdInt = parseInt(reportId);
    if (isNaN(reportIdInt)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid report ID.");
    }

    await reportService.closeReport(reportIdInt);

    return NextResponse.json(
      { message: "Report successfully closed." },
      { status: StatusCodes.OK },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
