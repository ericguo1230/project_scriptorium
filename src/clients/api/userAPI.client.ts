import { BaseAPI } from "@/clients/api/baseAPI.client";

export class UserAPI extends BaseAPI {
    async getUserProfile() {
        return await fetch(`${this.configuration.baseUrl}/api/v1/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.configuration.accessToken ? `Bearer ${this.configuration.accessToken}` : "",
            },
        });
    }
}