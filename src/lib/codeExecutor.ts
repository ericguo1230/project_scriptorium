import * as javaParser from "java-parser"

import { DockerManager, ExecutionOptions, ExecutionResult } from "./docker/DockerManager";
import { CodeLanguage } from "@/schemas/codeExecutionSchema";


abstract class CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> { // eslint-disable-line
    throw new Error("Method not implemented");
  }
}

class PythonExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("python");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["python", "main.py"],
        memoryLimit: 500 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.py",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class JavaScriptExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("javascript");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["node", "main.js"],
        memoryLimit: 50 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.js",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class TypeScriptExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("typescript");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: [
          "ts-node",
          "--transpile-only",
          "--compilerOptions", 
          '{"module":"CommonJS","target":"ES2018"}',
          "-e",
          code
        ],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error
    }
  }
}

class JavaExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("java");

      // First, find the public class name
      const collector = new PublicClassCollector();
      
      try {
        const cst = javaParser.parse(code);
        collector.visit(cst);
      } catch (parseError: any) {
        return {
          stdout: "",
          stderr: parseError.message || "Failed to parse Java code",
          exitCode: 1,
          executionTimeMs: 0
        };
      }
      
      const publicClassName = collector.customResult[0];
      if (!publicClassName) {
        return {
          stdout: "",
          stderr: "No public class found in Java code",
          exitCode: 1,
          executionTimeMs: 0
        };
      }

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["bash", "-c", `
          # Compile and capture any errors
          javac ${publicClassName}.java 2>&1 && java ${publicClassName}
        `],
        memoryLimit: 512 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: `${publicClassName}.java`,
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      return {
        stdout: "",
        stderr: error instanceof Error ? error.message : "An unknown error occurred",
        exitCode: 1,
        executionTimeMs: 0
      };
    }
  }
}

class CExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("c");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["bash", "-c", `
          gcc main.c -o program
          ./program
        `],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.c",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class CppExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("cpp");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["bash", "-c", `
          g++ -std=c++17 main.cpp -o program
          ./program
        `],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.cpp",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class GoExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("go");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["go", "run", "main.go"],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.go",
        stdin: stdin ? stdin + "\n" : undefined
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class SwiftExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("swift");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["bash", "-c", `
          swift main.swift
        `],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.swift",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class RustExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("rust");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["bash", "-c", `
          rustc main.rs -o program
          ./program
        `],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.rs",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

class RubyExecutor extends CodeExecutor {
  async execute(code: string, stdin?: string): Promise<ExecutionResult> {
    try {
      const dockerManager = await DockerManager.getInstance();
      const imageConfig = await dockerManager.getImage("ruby");

      const executionOptions: ExecutionOptions = {
        imageName: imageConfig.imageName,
        command: ["ruby", "main.rb"],
        memoryLimit: 256 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        autoRemove: true,
        code: code,
        filename: "main.rb",
        stdin: stdin
      };

      return await dockerManager.runContainer(executionOptions);
    } catch (error) {
      throw error;
    }
  }
}

export class CodeExecutorFactory {
  static createExecutor(language: CodeLanguage): CodeExecutor {
    switch (language.toLowerCase()) {
      case "python":
        return new PythonExecutor();
      case "javascript":
        return new JavaScriptExecutor();
      case "typescript":
        return new TypeScriptExecutor();
      case "java":
        return new JavaExecutor();
      case "c":
        return new CExecutor();
      case "cpp":
        return new CppExecutor();
      case "go":
        return new GoExecutor();
      case "swift":
        return new SwiftExecutor();
      case "rust":
        return new RustExecutor();
      case "ruby":
        return new RubyExecutor();
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
}

class PublicClassCollector extends javaParser.BaseJavaCstVisitorWithDefaults {
  customResult: string[];

  constructor() {
    super();
    this.customResult = [];
    this.validateVisitor();
  }

  classDeclaration(ctx: javaParser.ClassDeclarationCtx) {
    const hasPublicModifier = ctx.classModifier?.some(mod => mod.children.Public);

    if (hasPublicModifier) {
      const className = this.getClassName(ctx);
      if (className) {
        this.customResult.push(className);
      }
    }
  }

  private getClassName(ctx: javaParser.ClassDeclarationCtx): string | undefined {
    const normalClassDeclaration = ctx.normalClassDeclaration?.[0];
    const typeIdentifier = normalClassDeclaration?.children.typeIdentifier?.[0];
    const identifier = typeIdentifier?.children.Identifier?.[0];

    return identifier?.image;
  }
}
