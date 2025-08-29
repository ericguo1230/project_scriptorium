"use server";

import client from "@/clients/api";
import { cookies } from "next/headers";
import { handleKnownErrors } from "@/utils/error.client";
import { Status } from "@/app/actions";
import { revalidatePath } from "next/cache";

export async function createBlog(previousState: Status, formData: FormData) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const templateLinks = formData.get("templateLinks") as string;
    const templateLinksDecoded: { id: number, title: string }[] = JSON.parse(templateLinks);

    const newBlog = await client.POST("/api/v1/blog-posts", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      body: {
        title,
        description,
        tags: tags ? tags.split(",") : undefined,
        links: templateLinksDecoded.map((link) => link.id),
      },
    });

    if (!newBlog.response.ok) {
      return { type: "error" };
    }

    revalidatePath("/blogs");
    return { type: "success" };
  } catch (error) {
    await handleKnownErrors(error);
    return { type: "error" };
  }
}
