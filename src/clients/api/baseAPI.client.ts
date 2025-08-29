const BASE_URL = "http://localhost:3000";

export class Configuration {
  baseUrl?: string;
  accessToken?: string;
  refreshToken?: string;

  constructor({
    baseUrl,
    accessToken,
    refreshToken,
  }: {
    baseUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    this.baseUrl = baseUrl || BASE_URL;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

export class BaseAPI {
  configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }
}
