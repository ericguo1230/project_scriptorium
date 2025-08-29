import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/utils/api";
import { fileClient } from "@/clients";

function getMimeType(extension: string) {
  const mimeTypes: { [key: string]: string } = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    txt: "text/plain",
    html: "text/html",
    json: "application/json",
    csv: "text/csv",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

// Local file service is dev only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    
    const filePath = slug.join("/");
    const blob = await fileClient.getFile(filePath);
    const fileExtension = filePath.split(".").pop() || "";
    const contentType = getMimeType(fileExtension);

    const response = new NextResponse(blob);
    response.headers.set("content-type", contentType);

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}
