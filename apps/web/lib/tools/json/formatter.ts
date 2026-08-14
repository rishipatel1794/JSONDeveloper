export interface JsonFormatResult {
    success: boolean;
    data?: string;
    error?: string;
}

export function formatJson(input: string): JsonFormatResult {
    try {
        const parsed = JSON.parse(input);

        return {
            success: true,
            data: JSON.stringify(parsed, null, 2),
        };
    } catch (error) {
        return {
            success: false,
            error: getJsonErrorMessage(error),
        };
    }
}

export function minifyJson(input: string): JsonFormatResult {
    try {
        const parsed = JSON.parse(input);

        return {
            success: true,
            data: JSON.stringify(parsed),
        };
    } catch (error) {
        return {
            success: false,
            error: getJsonErrorMessage(error),
        };
    }
}

export function validateJson(input: string): JsonFormatResult {
    try {
        JSON.parse(input);

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: getJsonErrorMessage(error),
        };
    }
}

function getJsonErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Invalid JSON";
}