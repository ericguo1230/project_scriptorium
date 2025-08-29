import client from "@/clients/api";
import CodeExecutor from "@/components/CodeExecution";
import { redirect } from "next/navigation"
import { cookies } from "next/headers";

async function fetchTemplate(slug: number) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const templateData = await client.GET("/api/v1/templates/{templateId}", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
    params: {
      path: {
        templateId: slug,
      },
    },
  });

  if (!templateData.data?.data) {
    redirect("/");
  }
  return templateData.data.data;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number }>;
}) {
  const { slug } = await params;
  const templateData = await fetchTemplate(slug);
  return (
    <div className="h-full flex-grow relative">
      <CodeExecutor 
        id={templateData.id}
        code={templateData.code}
        stdin={templateData.stdin}
        title={templateData.title}
        language={templateData.language}
        userID={templateData.userId}
        isForked={templateData.isForked}
        forkedFromId={templateData.forkedFromId}
        />
    </div>
  );
}
