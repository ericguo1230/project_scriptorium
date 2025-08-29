import { prisma } from "@/clients";
import { PaginationParams, paginate } from "@/utils/pagination";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

interface BlogPostReportParams {
  userId: number;
  blogPostId: number;
  explanation: string;
}

interface ReportGetParams extends PaginationParams {
  status?: "open" | "closed";
}

class ReportService {
  async reportBlogPost({
    userId,
    blogPostId,
    explanation,
  }: BlogPostReportParams) {
    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id: blogPostId,
        isVisible: true,
      },
    });

    if (!blogPost) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Blog post not found");
    }

    const existingReport = await prisma.report.findUnique({
      where: { userId_blogPostId: { userId, blogPostId } },
    });

    if (existingReport) {
      throw createHttpError(
        StatusCodes.CONFLICT,
        "User has already reported this blog post",
      );
    }

    return await prisma.report.create({
      data: {
        userId,
        blogPostId,
        explanation,
      },
    });
  }

  async reportComment(userId: number, commentId: number, explanation: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId, isVisible: true },
    });

    if (!comment) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Comment not found");
    }

    const existingReport = await prisma.report.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingReport) {
      throw createHttpError(
        StatusCodes.CONFLICT,
        "User has already reported this comment",
      );
    }

    return await prisma.report.create({
      data: {
        userId,
        commentId,
        explanation,
      },
    });
  }

  async getReports({ page, limit, status }: ReportGetParams) {
    const { skip, take } = paginate({ page, limit });

    const where = {
      status,
    };

    const [reports, count] = await prisma.$transaction([
      prisma.report.findMany({
        take,
        skip,
        where,
      }),
      prisma.report.count({
        where,
      }),
    ]);

    const pageCount = Math.ceil(count / limit);

    return { data: reports, count, pageCount };
  }

  async approveReport(reportId: number) {
    const report = await prisma.report.findUniqueOrThrow({
      where: { id: reportId },
    });

    if (report.status !== "open") {
      throw createHttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        "Report already closed.",
      );
    }

    if (report.commentId) {
      await prisma.comment.update({
        where: {
          id: report.commentId,
        },
        data: {
          isVisible: false,
          replies: {
            updateMany: {
              where: {
                isVisible: true,
              },
              data: {
                isVisible: false,
              },
            },
          }
        },
      });
    }

    if (report.blogPostId) {
      await prisma.blogPost.update({
        where: {
          id: report.blogPostId,
        },
        data: {
          isVisible: false,
          comments: {
            updateMany: {
              where: {
                isVisible: true,
              },
              data: {
                isVisible: false,
              },
            },
          },
        },
      });
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "closed",
      },
    });
  }

  async closeReport(reportId: number) {
    const report = await prisma.report.findUniqueOrThrow({
      where: { id: reportId },
    });

    if (report.status !== "open") {
      throw createHttpError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        "Report already closed.",
      );
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "closed",
      },
    });
  }
}

const reportService = new ReportService();
export default reportService;
