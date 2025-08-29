"use server";

import { Status } from "@/app/actions";
import client from "@/clients/api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function reportContent(prevState: Status, formData: FormData) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const commentId = parseInt(formData.get("commentId") as string);
    const blogPostId = parseInt(formData.get("blogPostId") as string);
    const explanation = formData.get("explanation") as string;

    if (!isNaN(commentId) && !isNaN(blogPostId)) {
      const response = await client.POST(
        "/api/v1/blog-posts/{blogPostId}/comments/{commentId}/report",
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
            explanation,
          },
        }
      );

      if (!response.data) {
        return {
          type: "error",
          message: response.error!["error"] || "Failed to report",
        };
      }

      revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
      revalidatePath("/api/v1/blog-posts/");
      return {
        type: "success",
      };
    } else if (!isNaN(blogPostId)) {
      const response = await client.POST(
        "/api/v1/blog-posts/{blogPostId}/report",
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
            explanation,
          },
        }
      );

      if (!response.data) {
        console.error(response);
        return {
          type: "error",
          message: response.error!["error"] || "Failed to report",
        };
      }

      revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
      revalidatePath("/api/v1/blog-posts/");
      return {
        type: "success",
      };
    }
    
    return {
      type: "error",
    };
  } catch (error) {
    console.error(error);
    return {
      type: "error",
    };
  }
}

export async function modifyReportStatus(prevState: Status, formData: FormData) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const reportId = parseInt(formData.get("reportId") as string);
    const status = formData.get("status") as string;

    if (isNaN(reportId) || !["approve", "close"].includes(status)) {
      return {
        type: "error",
        message: "Invalid report ID or status",
      };
    }

    let endpoint: "/api/v1/admin/reports/{reportId}/approve" | "/api/v1/admin/reports/{reportId}/close";
    if (status === "approve") {
      endpoint = "/api/v1/admin/reports/{reportId}/approve";
    } else {
      endpoint = "/api/v1/admin/reports/{reportId}/close";
    }

    const response = await client.POST(endpoint, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          reportId,
        },
      },
    });

    if (!response.data) {
      return {
        type: "error",
        message: response.error!["error"] || "Failed to modify report status",
      };
    }

    revalidatePath("/api/v1/admin/reports");
    return {
      type: "success",
    };
  } catch (error) {
    console.error(error);
    return {
      type: "error",
    };
  }
}