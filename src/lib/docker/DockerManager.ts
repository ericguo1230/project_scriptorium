import { CodeLanguage } from "@/schemas/codeExecutionSchema";
import Docker, { Container, ContainerCreateOptions } from "dockerode";
import { PassThrough } from "node:stream";
import tar from "tar-stream";

export type ImageConfig = {
  language: CodeLanguage;
  imageName: string;
};

export type ExecutionOptions = {
  imageName: string;
  command: string[];
  binds?: string[];
  memoryLimit?: number;
  cpuShares?: number;
  networkMode?: string;
  autoRemove?: boolean;
  code?: string;
  filename?: string;
  stdin?: string;
};

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
};

export type CompilationResult = {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export class DockerManager {
  private docker: Docker;
  private static instance: DockerManager;
  private images: Map<CodeLanguage, ImageConfig>;

  private constructor() {
    this.docker = new Docker({
      socketPath: process.env.DOCKER_DAEMON_SOCKET,
    });
    this.images = new Map();
  }

  static async getInstance(): Promise<DockerManager> {
    if (!DockerManager.instance) {
      DockerManager.instance = new DockerManager();
      DockerManager.instance.images = DockerManager.instance.initializeImages();
    }
    return DockerManager.instance;
  }

  private initializeImages(): Map<CodeLanguage, ImageConfig> {
    const imagesMap = new Map<CodeLanguage, ImageConfig>();

    // Configure Python image
    const pythonConfig: ImageConfig = {
      language: "python",
      imageName: "code-executor-python:latest",
    };

    // Configure JavaScript image
    const javascriptConfig: ImageConfig = {
      language: "javascript",
      imageName: "code-executor-javascript:latest",
    };

    // Configure TypeScript image
    const typescriptConfig: ImageConfig = {
      language: "typescript",
      imageName: "code-executor-javascript:latest", // ts can be run in the js image
    };

    // Configure Java image
    const javaConfig: ImageConfig = {
      language: "java",
      imageName: "code-executor-java:latest",
    };

    // Configure C image
    const cConfig: ImageConfig = {
      language: "c",
      imageName: "code-executor-cpp:latest", // c is run in the cpp image
    };

    // Configure C++ image
    const cppConfig: ImageConfig = {
      language: "cpp",
      imageName: "code-executor-cpp:latest",
    };

    // Configure Go image
    const goConfig: ImageConfig = {
      language: "go",
      imageName: "code-executor-go:latest",
    };

    // Configure Swift image
    const swiftConfig: ImageConfig = {
      language: "swift",
      imageName: "code-executor-swift:latest",
    };

    // Configure Rust image
    const rustConfig: ImageConfig = {
      language: "rust",
      imageName: "code-executor-rust:latest",
    };

    // Configure Ruby image
    const rubyConfig: ImageConfig = {
      language: "ruby",
      imageName: "code-executor-ruby:latest",
    };

    imagesMap.set("python", pythonConfig);
    imagesMap.set("javascript", javascriptConfig);
    imagesMap.set("typescript", typescriptConfig);
    imagesMap.set("java", javaConfig);
    imagesMap.set("c", cConfig);
    imagesMap.set("cpp", cppConfig);
    imagesMap.set("go", goConfig);
    imagesMap.set("swift", swiftConfig);
    imagesMap.set("rust", rustConfig);
    imagesMap.set("ruby", rubyConfig);
    return imagesMap;
  }

  /**
   * Retrieves the Docker image configuration for the specified language.
   * Assumes images are already built via startup.sh.
   * @param language The programming language to retrieve the image for.
   * @returns The image configuration.
   * @throws Error if the image does not exist.
   */
  public async getImage(language: CodeLanguage): Promise<ImageConfig> {
    const imageConfig = this.images.get(language);
    if (!imageConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    try {
      await this.docker.getImage(imageConfig.imageName).inspect();
      return imageConfig;
    } catch {
      throw new Error(
        `Docker image "${imageConfig.imageName}" does not exist. Please build the image using startup.sh.`
      );
    }
  }

  /**
   * Creates a tar stream containing a single file with the provided content
   */
  private createTarStream(
    filename: string,
    content: string
  ): NodeJS.ReadableStream {
    const pack = tar.pack();

    const entry = pack.entry({
      name: filename,
      size: Buffer.from(content).length,
    });

    entry.end(content);
    pack.finalize();

    return pack;
  }

  /**
   * Copies content into a container as a file
   */
  private async copyContentToContainer(
    container: Container,
    filename: string,
    content: string
  ): Promise<void> {
    const tarStream = this.createTarStream(filename, content);
    await container.putArchive(tarStream, { path: "/app" });
  }

  /**
   * Creates and runs a Docker container based on the provided execution options.
   * @param options Configuration options for container execution.
   * @returns The result of the execution including stdout, stderr, and exit code.
   * @throws Error if container creation or execution fails.
   */
  public async runContainer(
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const {
      imageName,
      command,
      memoryLimit = 50 * 1024 * 1024,
      cpuShares = 512,
      networkMode = "none",
      autoRemove = true,
      code,
      filename,
      stdin,
    } = options;

    const containerOptions: ContainerCreateOptions = {
      Image: imageName,
      Cmd: command,
      Tty: false,
      OpenStdin: true,
      StdinOnce: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: "/app",
      HostConfig: {
        Memory: memoryLimit,
        CpuShares: cpuShares,
        NetworkMode: networkMode,
        AutoRemove: autoRemove,
      },
    };

    let container: Container | null = null;
    let stream: NodeJS.ReadWriteStream | null = null;

    try {
      console.log(`Creating container with image: ${imageName}`);
      container = await this.docker.createContainer(containerOptions);

      stream = await container.attach({
        stdin: true,
        hijack: true,
        stream: true,
        stdout: true,
        stderr: true,
      });

      if (!container) {
        throw new Error("Container creation failed");
      }

      // Copy the code file into the container
      if (code && filename) {
        console.log(`Copying code file: ${filename}`);
        await this.copyContentToContainer(container, filename, code);
      }

      console.log("Starting container");

      // Create buffers to capture stdout and stderr
      const stdoutStream = new PassThrough();
      const stderrStream = new PassThrough();
      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      // Set up stream handlers
      stdoutStream.on('data', (chunk) => stdoutChunks.push(chunk));
      stderrStream.on('data', (chunk) => stderrChunks.push(chunk));

      // Set up demuxing
      container.modem.demuxStream(stream, stdoutStream, stderrStream);

      // Start container
      const startTime = Date.now();
      await container.start();

      // Write stdin if needed
      if (stdin) {
        stream.write(stdin + '\n');
        stream.end();
      }

      const timeoutMs = 10000;

      const streamPromise = new Promise<ExecutionResult>((resolve) => {
        container!.wait().then((result) => {
          const stdoutString = Buffer.concat(stdoutChunks).toString('utf-8')
            .replace(/^\x01\x00\x00\x00[\s\S]{4}/, '') // Remove potential Docker header
            .replace(/^\x02\x00\x00\x00[\s\S]{4}/, '') // Remove potential Docker header
            .replace(/^{"stdin":.*?"hijack":true}\s*/, ''); // Remove any leaked attach options
          const stderrString = Buffer.concat(stderrChunks).toString('utf-8');

          const endTime = Date.now();
          resolve({
            stdout: stdoutString.trim(),
            stderr: stderrString.trim(),
            exitCode: result.StatusCode,
            executionTimeMs: endTime - startTime,
          });
        });
      });

      const timeoutPromise = new Promise<ExecutionResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Execution timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      return await Promise.race([streamPromise, timeoutPromise]);
    } catch (error) {
      console.error("Container execution failed:", error);
      
      // Attempt to get logs if container exists
      if (container) {
        try {
          const logs = await container.logs({ stdout: true, stderr: true });
          console.error("Container logs:", logs.toString());
        } catch (logError) {
          console.error("Failed to fetch container logs:", logError);
        }
      }

      throw error;
      
    } finally {
      // Cleanup
      if (stream) {
        stream.removeAllListeners();
      }
      
      if (container) {
        try {
          await container.kill().catch(() => {});
          if (!autoRemove) {
            await container.remove().catch(() => {});
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }
    }
  }
}
