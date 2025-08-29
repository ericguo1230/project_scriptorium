import { prisma } from "@/clients";
import { Prisma } from "@prisma/client";
import { paginate, PaginationParams } from "@/utils/pagination";

import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

interface TemplateGetParams extends PaginationParams {
  title?: string | null;
  description?: string | null;
  userId?: number | null;
  languages?: string[] | null;
  tags?: string[] | null;
}

interface TemplateCreateParams {
  userId: number;
  title: string;
  description: string;
  code: string;
  stdin?: string;
  language: string;
  tags?: string[];
}

interface TemplateUpdateParams {
  title?: string;
  description?: string;
  code?: string;
  stdin?: string;
  language?: string;
  tags?: string[];
}

export class TemplateService {
  async getTemplates({
    page,
    limit,
    title,
    description,
    userId,
    languages,
    tags,
  }: TemplateGetParams) {
    const { skip, take } = paginate({ page, limit });

    const where = {
      title: title ? { contains: title } : undefined,
      description: description ? { contains: description } : undefined,
      userId: userId ? { equals: userId } : undefined,
      language: languages ? { in: languages } : undefined,
      tamplateTags: tags ? { some: { tag: { in: tags } } } : undefined,
    };

    const [templates, count] = await prisma.$transaction([
      prisma.template.findMany({
        take,
        skip,
        include: {
          tamplateTags: { select: { id: true, tag: true } },
        },
        where,
      }),
      prisma.template.count({
        where,
      }),
    ]);

    const pageCount = Math.ceil(count / limit);

    return { data: templates, count, pageCount };
  }

  async getTemplateById(templateId: number) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        tamplateTags: { select: { id: true, tag: true } },
      },
    });

    if (!template) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Template not found");
    }

    return template;
  }

  async createTemplate({
    userId,
    title,
    description,
    code,
    stdin,
    language,
    tags,
  }: TemplateCreateParams) {
    return await prisma.$transaction(async (tx) => {
      const tagRecords = await this.upsertTemplateTags(tx, tags);

      const template = await tx.template.create({
        data: {
          userId,
          title,
          description,
          code,
          stdin,
          language,
          isForked: false,
          tamplateTags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
        },
        include: { tamplateTags: true },
      });

      return template;
    });
  }

  async updateTemplate(
    userId: number,
    templateId: number,
    data: TemplateUpdateParams,
  ) {
    const template = await prisma.template.findUniqueOrThrow({
      where: { id: templateId },
    });

    if (template.userId !== userId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to update template",
      );
    }

    return await prisma.$transaction(async (tx) => {
      const tagRecords = await this.upsertTemplateTags(tx, data.tags);

      const updatedTemplate = await tx.template.update({
        where: { id: templateId },
        data: {
          title: data.title,
          description: data.description,
          code: data.code,
          stdin: data.stdin,
          language: data.language,
          tamplateTags: data.tags
            ? {
                set: tagRecords.map((tag) => ({ id: tag.id })),
              }
            : undefined,
        },
      });

      return updatedTemplate;
    });
  }

  async deleteTemplate(userId: number, templateId: number) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Template not found");
    }

    if (template.userId !== userId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        "User is not authorized to delete template",
      );
    }

    const forks = await prisma.template.findMany({
      where: { forkedFromId: template.id },
    });

    if (forks.length > 0) {
      const newParent = forks[0];

      await prisma.$transaction([
        prisma.template.update({
          where: { id: template.id },
          data: { forkedFromId: newParent.id },
        }),
        prisma.template.updateMany({
          where: { forkedFromId: template.id },
          data: { forkedFromId: newParent.id },
        }),
      ]);
    }

    await prisma.template.delete({ where: { id: templateId } });
  }

  async forkTemplate(userId: number, templateId: number) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { tamplateTags: { select: { id: true } } },
    });

    if (!template) {
      throw createHttpError(StatusCodes.NOT_FOUND, "Template not found");
    }

    if (template.userId === userId) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        "User cannot fork their own template",
      );
    }

    const newTemplate = await prisma.template.create({
      data: {
        userId,
        title: template.title,
        description: template.description,
        code: template.code,
        stdin: template.stdin,
        language: template.language,
        isForked: true,
        forkedFromId: template.id,
        tamplateTags: {
          connect: template.tamplateTags.map((tag) => ({ id: tag.id })),
        },
      },
      select: {
        id: true,
      }
    });
    return newTemplate.id
  }

  private async upsertTemplateTags(
    tx: Prisma.TransactionClient,
    tags?: string[],
  ) {
    let tagRecords: { id: number; tag: string }[] = [];

    if (tags && tags.length > 0) {
      // Step 1: Fetch existing tags in a single query
      const existingTagRecords = await tx.templateTag.findMany({
        where: { tag: { in: tags } },
        select: { id: true, tag: true },
      });

      // Step 2: Create a Set for efficient lookup of existing tags
      const existingTagSet = new Set(existingTagRecords.map((t) => t.tag));

      // Step 3: Filter out tags that already exist
      const newTags = tags.filter((tag) => !existingTagSet.has(tag));

      // Step 4: Create new tags in a single query
      const newTagRecords = newTags
        ? await tx.templateTag.createManyAndReturn({
            data: newTags.map((tag) => ({ tag })),
          })
        : [];

      tagRecords = [...existingTagRecords, ...newTagRecords];
    }

    return tagRecords;
  }
}

const templateService = new TemplateService();
export default templateService;
