import { BaseAPI } from "@/clients/api/baseAPI.client";

export class BlogAPI extends BaseAPI {
  async getBlogs({ page }: { page?: string } = {}) {
    const params = new URLSearchParams();
    if (page) params.set("page", page);

    return await fetch(`${this.configuration.baseUrl}/api/v1/blog-posts?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
