/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/clients";
import { PaginationParams, paginate } from "@/utils/pagination";
import { Prisma } from "@prisma/client";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

interface BlogPostGetParams extends PaginationParams {
  userId?: number;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  templateContent: string | null;
  showAll?: boolean;
  sortOption?: {
    field: "createdAt" | "rating" | "report" | "controversial" | null;
    direction: "asc" | "desc" | null;
  };
}

interface BlogPostCreateParams {
  userId: number;
  title: string;
  description: string;
  tags?: string[];
  links?: number[]; // Assuming links are template IDs
}

interface BlogPostUpdateParams {
  title?: string;
  description?: string;
  tags?: string[];
  links?: number[];
}

interface CommentGetParams extends PaginationParams {
  blogPostId: number;
  userId?: number;
  showAll?: boolean;
  sortOption?: {
    field: "createdAt" | "rating" | "report" | "controversial" | null;
    direction: "asc" | "desc" | null;
  };
}

interface CommentReplyGetParams extends PaginationParams {
  commentId: number;
  userId?: number;
}

interface CommentUpdateParams {
  content: string;
}

interface CommentCreateParams {
  userId: number;
  blogPostId: number;
  parentId?: number;
  content: string;
}

export class BlogPostService {
  async createBlogPost({
    userId,
    title,
    description,
    tags,
    links,
  }: BlogPostCreateParams) {
    return await prisma.$transaction(async (tx) => {
      const tagRecords = await this.upsertBlogPostTags(tx, tags);

      const blogPost = await tx.blogPost.create({
        data: {
          userId,
          title,
          description,
          tags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
          links: {
            connect: links?.map((linkId) => ({ id: linkId })) || [],
          },
        },
        include: {
          tags: true,
          links: {
            select: {
              id: true,
            },
          },
        },
      });

      return blogPost;
    });
  }

  async updateBlogPost(
    userId: number,
    blogPostId: number,
    data: BlogPostUpdateParams
  ) {
    const blogPost = await prisma.blogPost.findUniqueOrThrow({
      where: { id: blogPostId },
    });

    if (blogPost.userId !== userId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to update this blog post"
      );
    }

    return await prisma.$transaction(async (tx) => {
      const tagRecords = await this.upsertBlogPostTags(tx, data.tags);

      return await tx.blogPost.update({
        where: { id: blogPostId },
        data: {
          title: data.title,
          description: data.description,
          tags: data.tags
            ? {
                set: [],
                connect: tagRecords.map((tag) => ({ id: tag.id })),
              }
            : undefined,
          links: data.links
            ? {
                set: [],
                connect: data.links.map((linkId) => ({ id: linkId })),
              }
            : undefined,
        },
        include: {
          tags: true,
          links: { select: { id: true } },
        },
      });
    });
  }

  async deleteBlogPost(userId: number, blogPostId: number) {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId },
    });

    if (!blogPost) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Blog post not found");
    }

    if (blogPost.userId !== userId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to delete this blog post"
      );
    }

    // Now delete the blog post
    await prisma.blogPost.delete({ where: { id: blogPostId } });
  }

  async getBlogPosts({
    userId,
    page,
    limit,
    title,
    description,
    tags,
    templateContent,
    showAll,
    sortOption,
  }: BlogPostGetParams) {
    // Build filters based on parameters
    const where = {
      ...(!showAll && { OR: [{ isVisible: true }, { userId }] }),
      ...(title && { title: { contains: title } }),
      ...(description && { description: { contains: description } }),
      ...(tags && { tags: { some: { tag: { in: tags } } } }),
      ...(templateContent && {
        links: {
          some: {
            OR: [
              { title: { contains: templateContent } },
              { description: { contains: templateContent } },
              { code: { contains: templateContent } },
            ],
          },
        },
      }),
    };

    // Fetch all blog posts matching the filters (no pagination in the query)
    const blogPosts = await prisma.blogPost.findMany({
      where,
      include: {
        tags: true,
        links: {
          select: {
            id: true,
          },
        },
        ratings: { select: { rating: true } },
        _count: { select: { reports: true } },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Calculate net rating for each post
    const blogPostsWithRatings = blogPosts.map((post) => ({
      ...post,
      netRating: post.ratings.reduce(
        (total, r) =>
          total + (r.rating === "+1" ? 1 : r.rating === "-1" ? -1 : 0),
        0
      ),
    }));

    // Define the Sorter object with different strategies
    const Sorter = {
      createdAt: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      report: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? a._count.reports - b._count.reports
          : b._count.reports - a._count.reports,
      controversial: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? a._count.ratings - b._count.ratings
          : b._count.ratings - a._count.ratings,
      rating: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? a.netRating - b.netRating
          : b.netRating - a.netRating,
    };

    // Sort in memory using the appropriate sorter
    const sortedBlogPosts = blogPostsWithRatings.sort(
      Sorter[sortOption?.field || "createdAt"]
    );

    // Apply manual pagination after sorting
    const paginatedPosts = sortedBlogPosts.slice(
      (page - 1) * limit,
      page * limit
    );

    // Calculate the total number of pages
    const pageCount = Math.ceil(blogPostsWithRatings.length / limit);

    // Filter out _count and ratings from the final response
    const finalPosts = paginatedPosts.map((post) => {
      return {
        ...post,
        ratings: undefined,
      };
    });

    return {
      data: finalPosts,
      count: blogPostsWithRatings.length,
      pageCount,
    };
  }

  async getBlogPostById(blogPostId: number, userId?: number) {
    const blog = await prisma.blogPost.findUniqueOrThrow({
      where: {
        id: blogPostId,
        ...(userId
          ? { OR: [{ isVisible: true }, { userId }] }
          : { isVisible: true }),
      },
      include: {
        tags: true,
        links: {
          select: {
            id: true,
            title: true,
          }
        },
        ratings: true,
        _count: { select: { ratings: true } },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    const blogWithNetRating = {
      ...blog,
      netRating: blog.ratings.reduce(
        (total, r) =>
          total + (r.rating === "+1" ? 1 : r.rating === "-1" ? -1 : 0),
        0
      ),
      ratings: undefined,
    };

    return blogWithNetRating;
  }

  async addComment({
    userId,
    blogPostId,
    parentId,
    content,
  }: CommentCreateParams) {
    if (parentId) {
      const parent = await prisma.comment.findUniqueOrThrow({
        where: {
          id: parentId,
          blogPostId,
          isVisible: true,
        },
      });

      if (parent.parentId !== null) {
        throw createHttpError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          "You can only comment directly or reply to top-level comment"
        );
      }
    }

    return await prisma.comment.create({
      data: {
        userId,
        blogPostId,
        parentId,
        content,
      },
    });
  }

  async getCommentById(commentId: number, userId?: number) {
    const comment = await prisma.comment.findUniqueOrThrow({
      where: {
        id: commentId,
        ...(userId
          ? { OR: [{ isVisible: true }, { userId }] }
          : { isVisible: true }),
        blogPost: {
          ...(userId
            ? { OR: [{ isVisible: true }, { userId }] }
            : { isVisible: true }),
        },
      },
      include: {
        ratings: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        blogPost: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    const commentWithNetRating = {
      ...comment,
      netRating: comment.ratings.reduce(
        (total, r) =>
          total + (r.rating === "+1" ? 1 : r.rating === "-1" ? -1 : 0),
        0
      ),
      ratings: undefined,
    };

    return commentWithNetRating;
  }

  async updateComment(
    userId: number,
    commentId: number,
    data: CommentUpdateParams
  ) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Comment not found");
    }

    if (comment.userId !== userId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to update this comment"
      );
    }

    return await prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
    });
  }

  async rateBlogPost(userId: number, blogPostId: number, rating: string) {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId, isVisible: true },
    });

    if (!blogPost) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Blog post not found");
    }

    const existingRating = await prisma.rating.findUnique({
      where: { userId_blogPostId: { userId, blogPostId } },
    });

    if (existingRating) {
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
      await prisma.rating.create({
        data: {
          userId,
          blogPostId,
          rating,
        },
      });
    }

    // Return a success message
    return { message: "Blog post rated successfully" };
  }

  async rateComment(userId: number, commentId: number, rating: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId, isVisible: true },
    });

    if (!comment) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Comment not found");
    }

    const existingRating = await prisma.rating.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingRating) {
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
      await prisma.rating.create({
        data: {
          userId,
          commentId,
          rating,
        },
      });
    }
  }

  async getBlogPostsByTemplate(
    templateId: number,
    { page, limit }: PaginationParams
  ) {
    await prisma.template.findUniqueOrThrow({
      where: { id: templateId },
    });

    const { skip, take } = paginate({ page, limit });

    const where = {
      links: {
        some: {
          id: templateId,
        },
      },
    };

    const [blogs, count] = await prisma.$transaction([
      prisma.blogPost.findMany({
        take,
        skip,
        where,
      }),
      prisma.blogPost.count({ where }),
    ]);

    const pageCount = Math.ceil(count / limit);

    return { data: blogs, count, pageCount };
  }

  async getComments({
    page,
    limit,
    blogPostId,
    userId,
    showAll,
    sortOption,
  }: CommentGetParams) {
    await prisma.blogPost.findUniqueOrThrow({
      where: {
        id: blogPostId,
        ...(!showAll && { OR: [{ isVisible: true }, { userId }] }),
      },
    });

    // Construct the where clause
    const whereClause = {
      blogPostId,
      ...(!showAll && { OR: [{ isVisible: true }, { userId }] }),
      parentId: null,
    };

    // Fetch comments with related ratings and reports
    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        ratings: true,
        _count: { select: { reports: true, ratings: true, replies: true } },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Calculate net rating and report count for each comment
    const commentsWithNetRating = comments.map((comment) => ({
      ...comment,
      netRating: comment.ratings.reduce(
        (total, r) =>
          total + (r.rating === "+1" ? 1 : r.rating === "-1" ? -1 : 0),
        0
      ),
    }));

    // Define the Sorter object with different sorting strategies
    const Sorter = {
      createdAt: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      rating: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? a.netRating - b.netRating
          : b.netRating - a.netRating,
      controversial: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? a._count.ratings - b._count.ratings
          : b._count.ratings - a._count.ratings,
      report: (a: any, b: any) =>
        sortOption?.direction === "asc"
          ? a._count.reports - b._count.reports
          : b._count.reports - a._count.reports,
    };

    // Sort comments based on the sortBy parameter
    const sortedComments = commentsWithNetRating.sort(
      Sorter[sortOption?.field || "createdAt"]
    );

    // Apply manual pagination after sorting
    const paginatedComments = sortedComments.slice(
      (page - 1) * limit,
      page * limit
    );

    // Calculate the total number of pages
    const pageCount = Math.ceil(commentsWithNetRating.length / limit);

    // Filter out _count and ratings from the final response
    const finalComments = paginatedComments.map((comment) => {
      return {
        ...comment,
        ratings: undefined,
      };
    });

    return {
      data: finalComments,
      pageCount,
      count: commentsWithNetRating.length,
    };
  }

  async getCommentReplies({
    page,
    limit,
    commentId,
    userId,
  }: CommentReplyGetParams) {
    const { skip, take } = paginate({ page, limit });

    const where = {
      OR: [{ isVisible: true }, { userId }],
      parentId: commentId,
    };

    const [commentReplies, count] = await prisma.$transaction([
      prisma.comment.findMany({
        take,
        skip,
        where,
        include: {
          ratings: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.comment.count({
        where,
      }),
    ]);

    const commentsWithNetRating = commentReplies.map((comment) => ({
      ...comment,
      netRating: comment.ratings.reduce(
        (total, r) =>
          total + (r.rating === "+1" ? 1 : r.rating === "-1" ? -1 : 0),
        0
      ),
      ratings: undefined,
    }));

    const pageCount = Math.ceil(count / limit);

    return { data: commentsWithNetRating, count, pageCount };
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Comment not found");
    }

    if (comment.userId !== userId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to delete this comment"
      );
    }

    // Now delete the blog post
    await prisma.comment.delete({ where: { id: commentId } });
  }

  private async upsertBlogPostTags(
    tx: Prisma.TransactionClient,
    tags?: string[]
  ) {
    let tagRecords: { id: number; tag: string }[] = [];

    if (tags && tags.length > 0) {
      // Step 1: Fetch existing tags in a single query
      const existingTagRecords = await tx.blogPostTag.findMany({
        where: { tag: { in: tags } },
        select: { id: true, tag: true },
      });

      // Step 2: Create a Set for efficient lookup of existing tags
      const existingTagSet = new Set(existingTagRecords.map((t) => t.tag));

      // Step 3: Filter out tags that already exist
      const newTags = tags.filter((tag) => !existingTagSet.has(tag));

      // Step 4: Create new tags in a single query
      const newTagRecords = newTags
        ? await tx.blogPostTag.createManyAndReturn({
            data: newTags.map((tag) => ({ tag })),
          })
        : [];

      tagRecords = [...existingTagRecords, ...newTagRecords];
    }

    return tagRecords;
  }
}

const blogPostService = new BlogPostService();
export default blogPostService;
