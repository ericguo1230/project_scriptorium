import { BaseAPI } from "@/clients/api/baseAPI.client";

export class AuthAPI extends BaseAPI {
  async login({ email, password }: { email: string; password: string }) {
    return await fetch(`${this.configuration.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken({ refreshToken }: { refreshToken: string }) {
    return await fetch(`${this.configuration.baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  async register({ 
    email, 
    password, 
    firstName, 
    lastName, 
    confirmPassword, 
    phoneNumber 
  }: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    confirmPassword: string; 
    phoneNumber?: string; 
  }) {
    return await fetch(`${this.configuration.baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email, 
        password, 
        firstName, 
        lastName, 
        confirmPassword, 
        phoneNumber 
      }),
    });
  }
}
