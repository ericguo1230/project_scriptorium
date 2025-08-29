"use server";

import { logout } from "@/app/actions";
import { ClientAuthenticationError } from "@/clients/api";

export async function handleKnownErrors(error: unknown) {
  if (error instanceof ClientAuthenticationError) {
    await logout();
  }

  throw error;
}
