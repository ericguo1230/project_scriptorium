"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function OpenApiDocsPage() {
  return (
    <div
      style={{ backgroundColor: "white", height: "100vh", overflow: "auto" }}
    >
      <SwaggerUI url={"/openapi.json"} displayOperationId={true} />
    </div>
  );
}
