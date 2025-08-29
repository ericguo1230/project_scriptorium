"use server";

import type { Status } from "@/app/actions";
import client from "@/clients/api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateProfile(prevState: Status, formData: FormData) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const avatar = formData.get("avatar") as File;
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (avatar.size > 0) {
    const avatarFormData = new FormData();
    avatarFormData.append("file", avatar);

    const avatarHeaders = new Headers();
    if (accessToken) {
      avatarHeaders.append("Authorization", `Bearer ${accessToken}`);
    }

    const url = new URL("/api/v1/me/avatar", process.env.NEXT_PUBLIC_API_URL).toString();
    const avatarResponse = await fetch(url, {
      method: "PUT",
      headers: avatarHeaders,
      body: avatarFormData,
    });

    if (!avatarResponse.ok) {
      const avatarResponseText = await avatarResponse.json();

      return {
        type: "error",
        message: avatarResponseText.details.file || "Failed to upload avatar",
      };
    }
  }

  const profile = await client.PATCH("/api/v1/me", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
    body: {
      email: email === "" ? undefined : email,
      firstName: firstName === "" ? undefined : firstName,
      lastName: lastName === "" ? undefined : lastName,
      phoneNumber: phoneNumber === "" ? undefined : phoneNumber,
    },
  });

  if (!profile.data) {
    return {
      type: "error",
    };
  }

  revalidatePath("/");

  return {
    type: "success",
  };
}
