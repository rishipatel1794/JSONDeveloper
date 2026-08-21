/** Minimal structural subset of the Postman Collection Format (v2.0.0 / v2.1.0) that we read on import. */

export interface PostmanVariable {
	key?: string;
	value?: unknown;
	disabled?: boolean;
	type?: string;
}

export interface PostmanAuthParam {
	key: string;
	value?: unknown;
	type?: string;
}

export interface PostmanAuth {
	type: string;
	[scheme: string]: unknown;
}

export interface PostmanUrl {
	raw?: string;
	protocol?: string;
	host?: string[] | string;
	path?: string[] | string;
	query?: { key?: string; value?: string; disabled?: boolean }[];
	variable?: PostmanVariable[];
}

export interface PostmanHeader {
	key: string;
	value: string;
	disabled?: boolean;
}

export interface PostmanFormParam {
	key: string;
	value?: string;
	src?: string | string[] | null;
	type?: "text" | "file";
	disabled?: boolean;
}

export interface PostmanBody {
	mode?: "raw" | "urlencoded" | "formdata" | "graphql" | "file";
	raw?: string;
	urlencoded?: PostmanFormParam[];
	formdata?: PostmanFormParam[];
	graphql?: { query?: string; variables?: string };
	options?: { raw?: { language?: string } };
}

export interface PostmanRequest {
	method?: string;
	url?: PostmanUrl | string;
	header?: PostmanHeader[];
	body?: PostmanBody;
	auth?: PostmanAuth | null;
	description?: string;
}

export interface PostmanItem {
	name?: string;
	item?: PostmanItem[];
	request?: PostmanRequest;
	auth?: PostmanAuth | null;
	description?: string;
}

export interface PostmanCollection {
	info?: { name?: string; description?: string; schema?: string };
	item?: PostmanItem[];
	auth?: PostmanAuth | null;
	variable?: PostmanVariable[];
}
