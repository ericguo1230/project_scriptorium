import { NextRequest, NextResponse } from "next/server";
import { authenticate, authenticateOptional } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import blogPostService from "@/services/blogPostService";
import { blogPostUpdateSchema } from "@/schemas/blogPostSchema";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}:
 *   get:
 *     summary: Retrieve a specific blog post
 *     description: Fetches a specific blog post by its ID.
 *     tags:
 *       - Blog Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to retrieve.
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Bad request, possibly due to an invalid blog post ID.
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
    const { userId } = await authenticateOptional(request);
    const { blogPostId: rawBlogPostId } = await params;
    const blogPostId = parseInt(rawBlogPostId);

    if (isNaN(blogPostId)) {
      throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid blog post ID.");
    }

    const blogPost = await blogPostService.getBlogPostById(
      blogPostId,
      userId || undefined,
    );

    return NextResponse.json({ data: blogPost });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}:
 *   patch:
 *     summary: Update a blog post
 *     description: Allows an authenticated user to update specified fields of a blog post they own.
 *     tags:
 *       - Blog Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the blog post.
 *                 example: "Updated Blog Title"
 *               description:
 *                 type: string
 *                 description: The updated content of the blog post.
 *                 example: "This blog post provides updated content on templates."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated tags associated with the blog post.
 *                 example: ["tutorial", "updated"]
 *               links:
 *                 type: array
 *                 items:
 *                   type: number
 *                   description: Templates associated with the blog post.
 *     responses:
 *       200:
 *         description: Blog post updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Blog"
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Blog post not found.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ blogPostId: string }> },
) {
  try {
    const { userId } = await authenticate(request);
    const data = await request.json();

    const { body } = await blogPostUpdateSchema.parseAsync({ body: data });

    const { blogPostId: rawBlogPostId } = await params;
    const blogPostId = parseInt(rawBlogPostId);

    const updatedBlogPost = await blogPostService.updateBlogPost(
      userId,
      blogPostId,
      body,
    );

    return NextResponse.json({ data: updatedBlogPost });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Allows an authenticated user to delete a specific blog post they own.
 *     tags:
 *       - Blog Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to delete.
 *     responses:
 *       200:
 *         description: Blog post deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blog post deleted successfully"
 *       400:
 *         description: Bad request, possibly due to an invalid blog post ID.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Blog post not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { blogPostId: string } },
) {
  try {
    const { userId } = await authenticate(request);
    const { blogPostId: rawBlogPostId } = await params;
    const blogPostId = parseInt(rawBlogPostId);

    await blogPostService.deleteBlogPost(userId, blogPostId);

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    return errorHandler(error);
  }
}
