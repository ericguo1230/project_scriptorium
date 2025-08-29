import { NextRequest, NextResponse } from "next/server";
import { authenticate, authenticateOptional } from "@/utils/auth.server";
import { errorHandler } from "@/utils/api";

import blogPostService from "@/services/blogPostService";
import { commentUpdateSchema } from "@/schemas/blogPostSchema";

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/comments/{commentId}:
 *   get:
 *     summary: Retrieve a specific comment
 *     description: Fetches a specific comment by its ID, with optional authentication.
 *     tags:
 *       - Blog Post Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to retrieve comments for.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the comment to retrieve.
 *     responses:
 *       200:
 *         description: Comment retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BlogComment'
 *       400:
 *         description: Bad request, possibly due to an invalid comment ID.
 *       404:
 *         description: Comment not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { userId } = await authenticateOptional(request);
    const { commentId: rawCommentId } = await params;
    const commentId = parseInt(rawCommentId);

    const comment = await blogPostService.getCommentById(
      commentId,
      userId || undefined,
    );

    return NextResponse.json({ data: comment });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/comments/{commentId}:
 *   patch:
 *     summary: Update a specific comment
 *     description: Allows an authenticated user to update their comment by its ID.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post to update a comment on.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the comment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the comment.
 *                 example: "This is an updated comment."
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Comment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BlogComment'
 *       400:
 *         description: Bad request, possibly due to invalid input data.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       403:
 *         description: Forbidden, possibly due to insufficient permissions.
 *       404:
 *         description: Comment not found.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid input data.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { userId } = await authenticate(request);
    const { commentId: rawCommentId } = await params;
    const commentId = parseInt(rawCommentId);

    const data = await request.json();
    const { body } = await commentUpdateSchema.parseAsync({ body: data });

    const updatedComment = await blogPostService.updateComment(
      userId,
      commentId,
      body,
    );

    return NextResponse.json({ data: updatedComment });
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * @swagger
 * /api/v1/blog-posts/{blogPostId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment on a blog post
 *     description: Allows an authenticated user to delete a specific comment they made on a blog post.
 *     tags:
 *       - Blog Post Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogPostId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the blog post.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       400:
 *         description: Bad request, possibly due to an invalid comment ID.
 *       401:
 *         description: Unauthorized, possibly due to missing or invalid authentication token.
 *       404:
 *         description: Comment not found.
 *       422:
 *         description: Unprocessable entity, possibly due to invalid input data.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { userId } = await authenticate(request);
    const { commentId } = await params;
    const commentIdInt = parseInt(commentId);

    await blogPostService.deleteComment(userId, commentIdInt);

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    return errorHandler(error);
  }
}
