import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, colorize, printf, errors } = format;

export function logger(moduleName: string): Logger {
  return createLogger({
    level: 'info',
    defaultMeta: { module: moduleName },
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }), // Capture stack trace if available
      printf(({ timestamp, level, message, stack, module }) => {
        const base = `[${timestamp}] [${level}] [${module}]`;
        return stack ? `${base} ${message}\n${stack}` : `${base} ${message}`;
      }),
    ),
    transports: [new transports.Console()],
  });
}
