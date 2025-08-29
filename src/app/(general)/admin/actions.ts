"use server";

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import client from "@/clients/api";

export default async function authorize_admin(page: number | undefined){
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const payload = await decrypt(accessToken);

    if (payload.userRole !== "admin") {
        return redirect("/404");
    }

    const response = await client.GET("/api/v1/admin/reports", {
        headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        params: {
        query: {
            page,
        },
        },
    });

    return response

}