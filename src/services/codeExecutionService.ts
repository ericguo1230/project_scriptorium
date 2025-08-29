import { prisma } from "@/clients";
import { CodeExecutorFactory } from "@/lib/codeExecutor";
import { CodeLanguage } from "@/schemas/codeExecutionSchema";

const EXECUTION_STATUS = {
  PENDING: "pending",
  STARTED: "started",
  COMPLETED: "completed",
} as const;

export type ExecutionStatus =
  (typeof EXECUTION_STATUS)[keyof typeof EXECUTION_STATUS];

interface ExecuteCodeParams {
  code: string;
  language: string;
  stdin?: string;
}

export class CodeExecutionService {
  async executeCode(
    userId: number | null,
    { code, language, stdin }: ExecuteCodeParams,
  ) {
    const codeExecutionRecord = await prisma.codeExecution.create({
      data: {
        code,
        language,
        stdin,
        userId,
        status: EXECUTION_STATUS.STARTED,
      },
    });

    const executor = CodeExecutorFactory.createExecutor(language as CodeLanguage);

    const result = await executor.execute(code, stdin);

    const updatedCodeExecutionRecord = await prisma.codeExecution.update({
      where: { id: codeExecutionRecord.id },
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: result.executionTimeMs,
        exitCode: result.exitCode,
        status: EXECUTION_STATUS.COMPLETED,
      },
    });

    return updatedCodeExecutionRecord;
  }

  async executeCodeFromTemplate(userId: number | null, templateId: number) {
    const { code, language, stdin } = await prisma.template.findUniqueOrThrow({
      where: { id: templateId },
    });

    const codeExecutionRecord = await prisma.codeExecution.create({
      data: {
        code,
        language,
        stdin,
        userId,
        status: EXECUTION_STATUS.STARTED,
      },
    });

    const executor = CodeExecutorFactory.createExecutor(language as CodeLanguage);

    const result = await executor.execute(
      code,
      stdin || undefined,
    );

    const updatedCodeExecutionRecord = await prisma.codeExecution.update({
      where: { id: codeExecutionRecord.id },
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: result.executionTimeMs,
        exitCode: result.exitCode,
        status: EXECUTION_STATUS.COMPLETED,
      },
    });

    return updatedCodeExecutionRecord;
  }
}

const codeExecutionService = new CodeExecutionService();
export default codeExecutionService;
