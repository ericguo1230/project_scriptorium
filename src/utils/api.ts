import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import createHttpError, { isHttpError } from "http-errors";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { capitalize } from "@/utils/misc";
import { AuthenticationError, AuthorizationError } from "@/utils/auth.server";
import { JOSEError } from "jose/errors";

export function parseIntOrThrow(string: string, name?: string) {
  const result = parseInt(string);

  if (isNaN(result)) {
    throw createHttpError(
      StatusCodes.BAD_REQUEST,
      `Invalid ${name || "param"}.`,
    );
  }

  return result;
}

export function createPaginatedResponse<T>({
  data,
  page,
  limit,
  pageCount,
  totalCount,
  metadata,
}: {
  data: T;
  page: number;
  limit: number;
  pageCount: number;
  totalCount: number;
  metadata?: object;
}) {
  return NextResponse.json({
    _metadata: {
      page,
      perPage: limit,
      pageCount,
      totalCount,
      ...metadata,
    },
    data,
  });
}

export function errorHandler(error: unknown) {
  if (!(error instanceof Error)) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }

  if (error instanceof z.ZodError) {
    const formattedErrors: Record<string, string> = {};
    
    error.errors.forEach((err) => {
      const path = err.path[err.path.length - 1];
      if (typeof path === 'string') {
        formattedErrors[path] = err.message;
      }
    });

    return NextResponse.json(
      { 
        error: "Validation Error",
        details: formattedErrors
      },
      { status: StatusCodes.UNPROCESSABLE_ENTITY },
    );
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const field = error.meta?.target as string[];
      const message = field 
        ? `${capitalize(field[0])} already exists`
        : "A unique constraint violation occurred";

      return NextResponse.json(
        { 
          error: "Duplicate Entry",
          details: {
            [field?.[0] || 'unknown']: message
          }
        },
        { status: StatusCodes.CONFLICT },
      );
    } else if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Not Found", message: error.message },
        { status: StatusCodes.NOT_FOUND },
      );
    } else if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Not Found", message: error.message },
        { status: StatusCodes.NOT_FOUND },
      );
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: "Unprocessable Entity", message: error.message },
      { status: StatusCodes.UNPROCESSABLE_ENTITY },
    );
  } else if (isHttpError(error)) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  } else if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: "Unauthorized", message: error.message },
      { status: StatusCodes.UNAUTHORIZED },
    );
  } else if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: "Forbidden", message: error.message },
      { status: StatusCodes.FORBIDDEN },
    );
  } else if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Bad Request", message: error.message },
      { status: StatusCodes.BAD_REQUEST },
    );
  } else if (error instanceof JOSEError) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid Token" },
      { status: StatusCodes.UNAUTHORIZED },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: error.message },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
