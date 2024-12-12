import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

let logger;

try {
  logger = createLogger({
    level: 'info',
    format: combine(timestamp(), logFormat),
    transports: [
      new transports.File({ filename: 'src/logs/error.log', level: 'error' }),
      new transports.File({ filename: 'src/logs/combined.log' }),
    ],
  });
} catch (error) {
  console.error('Logger file initialization failed, falling back to console logging.', error);
  logger = createLogger({
    level: 'info',
    format: combine(timestamp(), logFormat),
    transports: [new transports.Console()],
  });
}

export default logger;
