import { prisma } from "@/clients";
import { fileClient } from "@/clients";

import { StatusCodes } from "http-status-codes";
import createHttpError from "http-errors";

interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  email?: string;
}

export class UserService {
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw createHttpError(StatusCodes.NOT_FOUND, "User not found");
    }
    
    return user;
  }

  async updateUser(userId: number, data: UpdateUserParams) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw createHttpError(StatusCodes.NOT_FOUND, "User not found");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
      omit: {
        password: true,
      },
    });

    return updatedUser;
  }

  async uploadAvatar(userId: number, file: File) {
    const fileUrl = await fileClient.uploadFile(file, "avatars");

    await this.updateUser(userId, {
      avatar: fileUrl,
    });

    return fileUrl;
  }
}

const userService = new UserService();
export default userService;
