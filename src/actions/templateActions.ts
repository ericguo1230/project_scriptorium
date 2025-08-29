"use server";

import client from "@/clients/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function fetchTemplates() {
  const templates = await client.GET("/api/v1/templates");

  return templates.data;
}

export async function fetchTemplate(templateId: number) {
  const template = await client.GET("/api/v1/templates/{templateId}", {
    params: {
      path: {
        templateId,
      },
    },
  });

  if (!template.data?.data) {
    redirect("/error");
  }

  return template.data.data;
}

export async function fetchTemplateBlogs(templateId: number, page: number) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const blogs = await client.GET("/api/v1/templates/{templateId}/blog-posts", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          templateId,
        },
        query: {
          page,
        },
      },
    });

    return blogs.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
