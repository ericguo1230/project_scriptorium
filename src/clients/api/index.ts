import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "./v1";

export class ClientRequestError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "ClientRequestError";
    this.code = code;
  }
}

export class ClientAuthenticationError extends ClientRequestError {
  constructor(message: string, code?: number) {
    super(message, code);
    this.name = "ClientAuthenticationError";
  }
}

const authErrorMiddleware: Middleware = {
  async onResponse({ response, schemaPath }) {
    if (schemaPath === "/api/v1/auth/login") {
      return undefined;
    }
    
    if (response.status === 401) {
      throw new ClientAuthenticationError("Unauthorized", 401);
    }

    return response;
  },
};

const client = createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
client.use(authErrorMiddleware);

export default client;
