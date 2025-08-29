"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import client from "@/clients/api";
import { Status } from "@/app/actions";

export async function rateComment(
  blogPostId: number,
  commentId: number,
  rating: string
) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await client.POST(
    "/api/v1/blog-posts/{blogPostId}/comments/{commentId}/rate",
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          blogPostId,
          commentId,
        },
      },
      body: {
        rating,
      },
    }
  );

  revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
  return {
    type: response.response.ok ? "success" : "error",
  };
}

export async function deleteComment(blogPostId: number, commentId: number) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const response = await client.DELETE(
      "/api/v1/blog-posts/{blogPostId}/comments/{commentId}",
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        params: {
          path: {
            blogPostId,
            commentId,
          },
        },
      }
    );

    revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
    return {
      type: response.response.ok ? "success" : "error",
    };
  } catch {
    return {
      type: "error",
    };
  }
}

export async function createCommentReply(
  previousState: Status,
  formData: FormData
) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const blogPostId = parseInt(formData.get("postId") as string);
  const parentId = parseInt(formData.get("parentId") as string);
  const comment = formData.get("comment") as string;

  const response = await client.POST(
    "/api/v1/blog-posts/{blogPostId}/comments",
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          blogPostId,
        },
      },
      body: {
        content: comment,
        parentId: parentId,
      },
    }
  );

  revalidatePath(`/blogs/${blogPostId}/comments/${parentId}`);
  return {
    type: response.response.ok ? "success" : "error",
  };
}

export async function updateComment(previousState: Status, formData: FormData) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const blogPostId = parseInt(formData.get("postId") as string);
    const commentId = parseInt(formData.get("commentId") as string);
    const comment = formData.get("comment") as string;

    const response = await client.PATCH(
      "/api/v1/blog-posts/{blogPostId}/comments/{commentId}",
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        params: {
          path: {
            blogPostId,
            commentId,
          },
        },
        body: {
          content: comment,
        },
      }
    );

    revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
    return {
      type: response.response.ok ? "success" : "error",
    };
  } catch {
    return {
      type: "error",
    };
  }
}
