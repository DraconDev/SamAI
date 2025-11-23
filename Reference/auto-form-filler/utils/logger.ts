type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: Record<string, any>;
}

function formatLog({ level, message, timestamp, context }: LogMessage): string {
    const contextStr = context
        ? `\nContext: ${JSON.stringify(context, null, 2)}`
        : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(
    level: LogLevel,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: Record<string, any>
) {
    const logMessage = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
    };

    const formattedMessage = formatLog(logMessage);

    switch (level) {
        case "error":
            console.error(formattedMessage);
            break;
        case "warn":
            console.warn(formattedMessage);
            break;
        case "debug":
            console.debug(formattedMessage);
            break;
        default:
        // console.log(formattedMessage);
    }
}
