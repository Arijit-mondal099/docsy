type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  data?: Record<string, unknown>;
}

const isProduction = process.env.NODE_ENV === 'production';

function writeLog(entry: LogEntry): void {
  if (isProduction) {
    // Structured JSON in production for log aggregators
    console[entry.level](JSON.stringify(entry));
  } else {
    // Human-readable in development
    const prefix = entry.requestId ? `[${entry.requestId}]` : '';
    const meta = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    console[entry.level](`${prefix} ${entry.message}${meta}`);
  }
}

/** Generate a short request ID for tracing. */
export function requestId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const logger = {
  info(message: string, data?: Record<string, unknown>): void {
    writeLog({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  },

  warn(message: string, data?: Record<string, unknown>): void {
    writeLog({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  },

  error(message: string, data?: Record<string, unknown>): void {
    writeLog({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  },
};
