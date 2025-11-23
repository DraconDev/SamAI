// SamAI Logger utility for consistent logging across the extension

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  context: string;
  message: string;
  data?: any;
}

export class SamAILogger {
  private static logLevelHierarchy: Record<LogLevel, number> = {
    debug: 0,
    info: 1, 
    warn: 2,
    error: 3,
  };

  private static currentLevel: LogLevel = 'info';

  static setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private static formatMessage(config: LogConfig): string {
    const { context, message } = config;
    return `[${context}] ${message}`;
  }

  private static shouldLog(level: LogLevel): boolean {
    return this.logLevelHierarchy[level] >= this.logLevelHierarchy[this.currentLevel];
  }

  static debug(context: string, message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage({ context, message, data }), data);
    }
  }

  static info(context: string, message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage({ context, message, data }), data);
    }
  }

  static warn(context: string, message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage({ context, message, data }), data);
    }
  }

  static error(context: string, message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage({ context, message, data }), data);
    }
  }
}

// Convenience functions for SamAI-specific logging
export const samaiLog = {
  debug: (message: string, data?: any) => SamAILogger.debug('SamAI', message, data),
  info: (message: string, data?: any) => SamAILogger.info('SamAI', message, data),
  warn: (message: string, data?: any) => SamAILogger.warn('SamAI', message, data),
  error: (message: string, data?: any) => SamAILogger.error('SamAI', message, data),
};

// Context-specific loggers
export const searchLog = {
  debug: (message: string, data?: any) => SamAILogger.debug('Search', message, data),
  info: (message: string, data?: any) => SamAILogger.info('Search', message, data),
  warn: (message: string, data?: any) => SamAILogger.warn('Search', message, data),
  error: (message: string, data?: any) => SamAILogger.error('Search', message, data),
};

export const chatLog = {
  debug: (message: string, data?: any) => SamAILogger.debug('Chat', message, data),
  info: (message: string, data?: any) => SamAILogger.info('Chat', message, data),
  warn: (message: string, data?: any) => SamAILogger.warn('Chat', message, data),
  error: (message: string, data?: any) => SamAILogger.error('Chat', message, data),
};

export const contentLog = {
  debug: (message: string, data?: any) => SamAILogger.debug('Content', message, data),
  info: (message: string, data?: any) => SamAILogger.info('Content', message, data),
  warn: (message: string, data?: any) => SamAILogger.warn('Content', message, data),
  error: (message: string, data?: any) => SamAILogger.error('Content', message, data),
};