"use server";
import { Configuration } from "@/clients/api/baseAPI.client";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserAPI } from "@/clients/api/userAPI.client";
import { cookies } from "next/headers";
import type { Id } from "react-toastify";
import client from "@/clients/api";
import { LoginFormState } from "./(general)/login/page";
import { RegisterFormState } from "./(general)/signup/page";
import { revalidatePath } from "next/cache";


export type Status = {
  type: string;
  message?: string;
  toastId?: Id /* Added a toastId field of type Id */;
};

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return {
      error: {
        password: !password ? "Password is required" : null,
        email: !email ? "Email is required" : null,
      },
      message: null,
    };
  }

  const tokens = await client.POST("/api/v1/auth/login", {
    body: {
      email: email as string,
      password: password as string,
    },
  });

  if (!tokens.data) {
    return {
      error: {
        password: null,
        email: null,
      },
      message:
        tokens.response.status === 401 ? "Unauthorized" : "Unknown error",
    };
  }

  await createSession(
    tokens.data.data.accessToken,
    tokens.data.data.refreshToken!
  );
  redirect("/");
}

export async function logout(redirectAfter: boolean = true) {
  await deleteSession();
  revalidatePath("/");
  
  if (redirectAfter) {
    redirect("/login");
  }
}

export async function auth() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const config = new Configuration({ accessToken });
  const userApi = new UserAPI(config);
  const response = await userApi.getUserProfile();

  if (!response.ok) {
    return { session: null };
  }

  const responseData = await response.json();
  return {
    session: responseData.data,
  };
}

export async function register(
  prevState: RegisterFormState,
  formData: FormData
) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    return {
      error: {
        password: !password ? "Password is required" : null,
        email: !email ? "Email is required" : null,
        confirmPassword: !confirmPassword
          ? "Please enter password again"
          : null,
        firstName: !firstName ? "First name is required" : null,
        lastName: !lastName ? "Last name is required" : null,
      },
      message: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: {
        password: null,
        email: null,
        confirmPassword: "Passwords do not match",
        firstName: null,
        lastName: null,
      },
      message: null,
    };
  }

  const response = await client.POST("/api/v1/auth/register", {
    body: {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
    },
  });

  if (
    !response.response.ok &&
    response.error &&
    typeof response.error === "object" &&
    "details" in response.error
  ) {
  const errorDetails = (response.error as { details?: Record<string, string>; error?: string }).details || {};
  return {
    error: {
      password: errorDetails.password ?? null,
      email: errorDetails.email ?? null,
      confirmPassword: errorDetails.confirmPassword ?? null,
      firstName: errorDetails.firstName ?? null,
      lastName: errorDetails.lastName ?? null,
    },
    message: "Failed to register",
  };
}

  redirect("/login?registered=true");
}

export async function setTheme(theme: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const cookieStore = cookies();
  cookieStore.set("theme", theme, {
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getTheme() {
  const cookieStore = cookies();
  return cookieStore.get("theme")?.value === "dark" ? "dark" : "cmyk";
}

export async function createComment(previousState: Status, formData: FormData) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const blogPostId = parseInt(formData.get("postId") as string);
    const comment = formData.get("comment") as string;

    const newComment = await client.POST(
      "/api/v1/blog-posts/{blogPostId}/comments",
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        params: {
          path: {
            blogPostId,
          },
        },
        body: {
          content: comment,
        },
      }
    );

    revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
    return {
      type: newComment.response.ok ? "success" : "error",
    };
  } catch {
    return {
      type: "error",
    };
  }
}

export async function deleteBlogPost(blogPostId: number) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  await client.DELETE("/api/v1/blog-posts/{blogPostId}", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
    params: {
      path: {
        blogPostId,
      },
    },
  });

  redirect("/blogs");
}

export async function rateBlogPost(blogPostId: number, rating: string) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await client.POST("/api/v1/blog-posts/{blogPostId}/rate", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
    params: {
      path: {
        blogPostId,
      },
    },
    body: {
      rating,
    },
  });

  revalidatePath(`/api/v1/blog-posts/${blogPostId}`);
  return {
    type: response.response.ok ? "success" : "error",
  };
}

export async function createTemplate(formData: {
  language: string;
  name: string,
  description: string,
  tags: string[],
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let language = ""
  if (formData.language === "C++"){
    language = "cpp"
  }else{
    language = formData.language.toLowerCase()
  }
  // Construct the data object
  const data = {
    title: formData.name,
    description: formData.description,
    code: "", // Default value for code
    stdin: "", // Default value for stdin
    language: language,
    tags: formData.tags || [],
  };

  try {
    // Send the POST request to create a new template
    const newTemplate = await client.POST("/api/v1/templates", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      body: data,
    });

    return {
      type: newTemplate.response.ok ? "success" : "error",
      title: data.title,
    };
  } catch (error) {
    console.error("Error creating template:", error);

    return {
      type: "error",
      title: data.title,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateCode(formData: {
  id: number,
  title: string,
  language?: string,
  code?: string,
  stdin?: string,
  fork: boolean,
  description?: string,
  tags?: string[],
}){
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  console.log(formData)
  try{
    let id = formData.id
    if (formData.fork){
      const forkTemplate = await client.POST("/api/v1/templates/{templateId}/fork", {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        params:{
          path: {templateId: id},
        }
      })
      if (forkTemplate.data){
        id = forkTemplate.data.templateId
      } else {
        return {
          type: "error",
          message: "Failed to fork template",
        };
      }
    }

    //updated template
    const data = {
      title: formData.title,
      ...(formData.language && { language: formData.language }),
      ...(formData.code && { code: formData.code }),
      ...(formData.stdin && { stdin: formData.stdin }),
      ...(formData.description && { description: formData.description }),
      ...(formData.tags && { tags: formData.tags }),
    };

    const updateTemplate = await client.PATCH("/api/v1/templates/{templateId}", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params:{
        path: {templateId: id},
      },
      body:data,
    })

    revalidatePath(`/api/v1/templates/${id}`);
    return {
      type: updateTemplate.response.ok ? "success" : "error",
    };
  }catch(error){
    console.error("Error updating or forking template:", error);

    return {
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function saveCode(formData:{
  language: string,
  title: string,
  code: string,
  stdin: string,
}){
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Construct the data object
  const data = {
    title: formData.title,
    description: "",
    code: formData.code, 
    stdin: formData.stdin,
    language: formData.language,
    tags: [],
  };

  try {
    // Send the POST request to create a new template
    const newTemplate = await client.POST("/api/v1/templates", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      body: data,
    });

    return {
      type: newTemplate.response.ok ? "success" : "error",
    };
  } catch (error) {
    console.error("Error creating template:", error);

    return {
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteTemplate(formData:{
  templateId: number,
}){
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try{
    const deleteTemplate = await client.DELETE("/api/v1/templates/{templateId}", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params:{
        path: {templateId: formData.templateId},
      }
    })

    revalidatePath("/templates");
    return {
      type: deleteTemplate.response.ok ? "success" : "error",
    };
  }catch(error){
    console.error("Error deleting template:", error);

    return {
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function executeCode(formData:{
  code: string,
  stdin: string,
  language: "python" | "javascript" | "java" | "c" | "cpp";
}) {
  const data = {
    code: formData.code,
    ...(formData.stdin && { stdin: formData.stdin }),
    language: formData.language,
  }
  try{
    const execute = await client.POST("/api/v1/execute", {
      body: data,
    })
    
    return {
      type: execute.response.ok ? "success" : "error",
      stdout: execute.data?.data?.stdout ?? "No output available",
      stderr: execute.data?.data?.stderr ?? "No output available"
    };
  }catch(error){ 
    console.error("Error executing code", error)
    return {
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTitle(formData:{
  templateId: number,
}){
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  try{
    const response = await client.GET("/api/v1/templates/{templateId}", {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params:{path: {templateId: formData.templateId}}
    })
    return {
      type: response.response.ok ? "success" : "error",
      title: response.data?.data?.title ?? "No title",
    };
  }catch(error){
    console.error("Error executing code", error)
    return {
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}