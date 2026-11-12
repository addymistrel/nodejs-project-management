type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  functionName?: string;
  userId?: string;
  event?: string;
  projectId?: number;
  fileId?: number;
  jobId?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  log(message: string | Record<string, unknown>): void {
    this.write('info', message);
  }

  info(message: string | Record<string, unknown>, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string | Record<string, unknown>, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string | Record<string, unknown>, error?: unknown, context?: LogContext): void {
    this.write('error', message, context, error);
  }

  debug(message: string | Record<string, unknown>, context?: LogContext): void {
    this.write('debug', message, context);
  }

  private write(
    level: LogLevel,
    message: string | Record<string, unknown>,
    context?: LogContext,
    error?: unknown,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.getMessage(message),
      ...(context ? { context } : {}),
      ...(error ? { error: this.serializeError(error) } : {}),
    };

    const output = JSON.stringify(entry);

    if (level === 'error') {
      process.stderr.write(`${output}\n`);
      return;
    }

    process.stdout.write(`${output}\n`);
  }

  private getMessage(message: string | Record<string, unknown>): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  private serializeError(error: unknown): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        ...(error.stack ? { stack: error.stack } : {}),
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
    };
  }
}

const logger = new Logger();

export { logger };
export type { LogContext };
