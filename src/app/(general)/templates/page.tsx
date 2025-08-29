"use server";

import client from "@/clients/api";
import TemplatePage from "@/components/TemplatePage";
import { cookies } from "next/headers";

async function fetchTemplates(searchParams: Record<string, string>) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await client.GET("/api/v1/templates", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
    params: { query: searchParams },
  });
  
  if (!response.data?.data) {
    throw new Error("Failed to fetch templates.");
  }
  return response.data;
}

export default async function Page({ searchParams }: { searchParams : { page?: string }}) {
  const response = await fetchTemplates(searchParams);

  return (
    <TemplatePage responseData={response} searchParams={searchParams} />
  )
}
