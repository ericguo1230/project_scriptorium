declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";

    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_ACCESS_TOKEN_EXPIRATION: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_EXPIRATION: string;

    NEXT_PUBLIC_API_URL: string;
    
    FILE_UPLOAD_DIR: string;
    DOCKER_DAEMON_SOCKET: string;
  }
}
