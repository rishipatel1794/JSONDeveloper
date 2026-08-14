import { z } from "zod";

const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

const keyValuePairSchema = z.object({
	id: z.string(),
	key: z.string().max(256),
	value: z.string().max(8192),
	enabled: z.boolean(),
});

const authConfigSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("none") }),
	z.object({ type: z.literal("bearer"), token: z.string().max(4096) }),
	z.object({ type: z.literal("basic"), username: z.string().max(512), password: z.string().max(512) }),
	z.object({
		type: z.literal("api-key"),
		key: z.string().max(256),
		value: z.string().max(4096),
		location: z.enum(["header", "query"]),
	}),
]);

// ~5 MB of raw file content, inflated by base64's ~4/3 overhead. Keep in sync with
// MAX_FORM_FILE_SIZE_BYTES in apps/web/lib/api-client/client.ts and env.maxRequestSize below.
const MAX_FILE_DATA_LENGTH = 7_000_000;

const formFieldSchema = z.discriminatedUnion("isFile", [
	z.object({ key: z.string().min(1).max(256), isFile: z.literal(false), value: z.string().max(8192) }),
	z.object({
		key: z.string().min(1).max(256),
		isFile: z.literal(true),
		fileName: z.string().min(1).max(256),
		mimeType: z.string().max(256),
		fileData: z.string().max(MAX_FILE_DATA_LENGTH),
	}),
]);

export const apiRequestSchema = z.object({
	method: httpMethodSchema,
	url: z.string().min(1, "Please enter a valid HTTP or HTTPS URL.").max(4096),
	queryParams: z.array(keyValuePairSchema).max(50).default([]),
	headers: z.array(keyValuePairSchema).max(50).default([]),
	body: z.string().max(2_000_000).nullable().default(null),
	formData: z.array(formFieldSchema).max(10).optional(),
	auth: authConfigSchema.default({ type: "none" }),
});

export type ApiRequestInput = z.infer<typeof apiRequestSchema>;
