import { NextResponse } from "next/server";
import { openapiSpecification } from "@/utils/openapi";

export function GET() {
  return NextResponse.json(openapiSpecification);
}
