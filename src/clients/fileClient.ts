import { writeFile, access, readFile } from "fs/promises";
import { constants, mkdirSync } from "fs";
import { join } from "path";

interface IFileClient {
  uploadFile(file: File, prefix: string): Promise<string>;
  getFile(filename: string): Promise<File>;
  getFileUrl(filename: string): string;
}

export class LocalFileClient implements IFileClient {
  private static FILE_UPLOAD_DIR = "/uploads";

  async uploadFile(file: File, prefix: string) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUploadDir = join(
      "./public",
      LocalFileClient.FILE_UPLOAD_DIR,
      prefix,
    );
    let filename = file.name.replaceAll(" ", "_");

    // Create the directory if it doesn't exist
    await access(fileUploadDir, constants.F_OK).catch(() =>
      mkdirSync(fileUploadDir, { recursive: true }),
    );

    // Check if the file already exists and resolve collisions by appending a unique number
    filename = await this.resolveFileCollision(fileUploadDir, filename);

    const filePath = join(fileUploadDir, filename);

    await writeFile(filePath, buffer);
    return this.getFileUrl(join(prefix, filename));
  }

  async getFile(filename: string) {
    const filePath = join(
      "./public",
      LocalFileClient.FILE_UPLOAD_DIR,
      filename,
    );
    const buffer = await readFile(filePath);

    return new File([buffer], filename);
  }

  getFileUrl(filename: string) {
    return `/blobs/${filename}`;
  }

  private async resolveFileCollision(
    dir: string,
    filename: string,
  ): Promise<string> {
    let baseName = filename;
    let extension = "";

    // Extract file extension if it exists
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex !== -1) {
      baseName = filename.substring(0, dotIndex);
      extension = filename.substring(dotIndex);
    }

    let uniqueFilename = filename;
    let counter = 1;

    // Check if the file exists, and append a counter if necessary
    while (await this.fileExists(join(dir, uniqueFilename))) {
      uniqueFilename = `${baseName}_${counter}${extension}`;
      counter++;
    }

    return uniqueFilename;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

const fileClient: IFileClient = new LocalFileClient();
export default fileClient;
