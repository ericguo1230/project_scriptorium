"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import client from "@/clients/api";
import { Status } from "@/app/actions";

export async function editBlogPost(prevState: Status, formData: FormData) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const blogPostId = parseInt(formData.get("blogPostId") as string);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const templateLinks = formData.get("templateLinks") as string;
    const templateLinksDecoded: { id: number; title: string }[] =
      JSON.parse(templateLinks);

    const response = await client.PATCH("/api/v1/blog-posts/{blogPostId}", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          blogPostId,
        },
      },
      body: {
        title,
        description,
        tags: tags ? tags.split(",") : [],
        links: templateLinksDecoded.map((link) => link.id),
      },
    });

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
