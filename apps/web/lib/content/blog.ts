export interface ContentCodeBlock {
	language?: string;
	code: string;
}

export interface ContentTable {
	headers: string[];
	rows: string[][];
}

export interface ContentLink {
	label: string;
	href: string;
}

export interface ContentSection {
	title: string;
	body: string;
	/** Optional richer content rendered after `body` — only a handful of posts need these, so they stay optional rather than forcing every post through a markdown pipeline. */
	codeBlock?: ContentCodeBlock;
	table?: ContentTable;
	list?: string[];
	links?: ContentLink[];
}

export interface ContentFaqItem {
	question: string;
	answer: string;
}

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	publishedAt: string;
	readingTime: string;
	sections: ContentSection[];
	relatedTool: { label: string; href: string };
	keywords?: string[];
	/** Renders a jump-to-section table of contents — opt-in since most existing posts are short enough not to need one. */
	showTableOfContents?: boolean;
	faq?: ContentFaqItem[];
}

export const BLOG_POSTS: BlogPost[] = [
	{
		slug: "understanding-json-schema-validation",
		title: "Understanding JSON Schema Validation",
		description: "What JSON Schema actually checks, why validation errors are worth reading closely, and how to catch structural bugs before they hit production.",
		publishedAt: "2026-06-02",
		readingTime: "5 min read",
		sections: [
			{
				title: "JSON is valid syntax; a schema checks meaning",
				body: "Parsing JSON only confirms the text is well-formed — braces match, strings are quoted, commas are in the right places. It says nothing about whether a required field is missing, a value is the wrong type, or a string doesn't match the format an API expects. JSON Schema fills that gap by describing the shape a document is supposed to have, so a validator can flag exactly which part of your data doesn't match.",
			},
			{
				title: "Reading a validation error properly",
				body: "A good schema validator error points to a JSON Pointer path (like /items/3/price) and a reason (\"expected number, got string\"). Resist the urge to skim past the path — it tells you exactly which nested object or array element is wrong, which is usually faster than re-reading the whole payload looking for the mistake.",
			},
			{
				title: "Duplicate keys are a silent trap",
				body: "Technically, JSON allows duplicate keys in an object, and most parsers silently keep only the last one — so { \"role\": \"admin\", \"role\": \"member\" } quietly becomes just { \"role\": \"member\" } with no error at all. This is a common source of \"but I set that field!\" bugs, especially in hand-edited config files or generated payloads with a templating bug.",
			},
			{
				title: "Validate at the boundary, not everywhere",
				body: "You don't need to schema-validate every internal function call — that's what your language's type system is for. Validation earns its cost at boundaries: parsing a request body, reading a config file, or accepting a webhook payload from a third party, where the shape of the data isn't actually guaranteed by anything in your own code.",
			},
		],
		relatedTool: { label: "Try the JSON Validator", href: "/json-validator" },
		keywords: ["json schema validation", "what is json schema", "json schema tutorial", "validate json structure"],
	},
	{
		slug: "jwt-explained",
		title: "JWTs Explained: How JSON Web Tokens Actually Work",
		description: "What's really inside a JWT, why anyone can read it without a secret, and what a signature does (and doesn't) protect.",
		publishedAt: "2026-06-16",
		readingTime: "6 min read",
		sections: [
			{
				title: "Three parts, two dots",
				body: "A JWT is three base64url-encoded segments joined by dots: header.payload.signature. The header names the signing algorithm, the payload holds whatever claims the issuer put there (user id, roles, expiry), and the signature is what makes the whole thing verifiable. All three segments are just encoded, not encrypted.",
			},
			{
				title: "Anyone can read the payload",
				body: "Base64url encoding isn't a secret — it's just a text-safe encoding, reversible by anyone with zero effort. Paste a JWT into a decoder and the header and payload come back as plain JSON immediately. Never put a password, API key, or anything else sensitive into a JWT payload; treat it the same as if it were written in plain text, because it effectively is.",
			},
			{
				title: "What the signature actually guarantees",
				body: "The signature doesn't hide the payload — it proves the payload hasn't been tampered with since the issuer signed it, and (for algorithms like HS256/RS256) that it really came from whoever holds the signing key. Change a single character in the payload and the signature no longer matches, which is exactly what a server checks before trusting the token.",
			},
			{
				title: "Expiry is a claim, not a promise",
				body: "The `exp` claim is just a Unix timestamp inside the payload — it's the server's job to check it on every request and reject expired tokens. A JWT itself doesn't \"expire\" in any enforced sense; a server that forgets to check `exp` will happily accept a token forever.",
			},
		],
		relatedTool: { label: "Try the JWT Decoder", href: "/jwt-decoder" },
		keywords: ["how jwt works", "jwt explained", "json web token tutorial", "jwt signature explained"],
	},
	{
		slug: "regex-lookaheads-lookbehinds",
		title: "A Practical Guide to Regex Lookaheads and Lookbehinds",
		description: "The regex feature most developers avoid until they really need it — matching based on context, without consuming characters.",
		publishedAt: "2026-07-08",
		readingTime: "5 min read",
		sections: [
			{
				title: "The problem they solve",
				body: "Sometimes you want to match a pattern only if something specific comes before or after it, without including that context in the match itself — for example, matching a number only when it's followed by \"px\", but capturing just the number. A plain pattern would consume the \"px\" too; a lookaround lets you check for it without eating it.",
			},
			{
				title: "The four forms",
				body: "(?=...) is a positive lookahead — matches if what follows matches the pattern inside. (?!...) is a negative lookahead — matches if what follows does NOT match. (?<=...) and (?<!...) are the same idea, but checking what comes before instead of after. All four leave the surrounding text out of the actual match.",
			},
			{
				title: "A concrete example",
				body: "\\d+(?=px) applied to \"width: 240px\" matches \"240\", not \"240px\" — the lookahead confirms \"px\" follows without including it in the result. Swap it for a lookbehind, (?<=\\$)\\d+, and \"$42\" matches \"42\" while requiring a dollar sign immediately before it.",
			},
			{
				title: "When not to reach for them",
				body: "Lookarounds are powerful but harder to read at a glance, and not every regex engine supports variable-length lookbehind. If a simpler pattern plus a bit of surrounding code logic gets the same result, that's usually easier for the next person (including future you) to maintain.",
			},
		],
		relatedTool: { label: "Try the Regex Tester", href: "/regex-tester" },
		keywords: ["regex lookahead", "regex lookbehind", "regex lookaround tutorial", "regex negative lookahead example"],
	},
	{
		slug: "unix-timestamps-cheat-sheet",
		title: "Unix Timestamps: A Developer's Cheat Sheet",
		description: "Seconds vs. milliseconds, why timezones don't apply to a timestamp itself, and the edge cases that trip people up.",
		publishedAt: "2026-07-24",
		readingTime: "4 min read",
		sections: [
			{
				title: "It's a count, not a clock reading",
				body: "A Unix timestamp is simply the number of seconds (or milliseconds) since 00:00:00 UTC on January 1, 1970. It doesn't carry a timezone, because it doesn't need one — it identifies one exact instant, and any timezone is just a different way of displaying that same instant.",
			},
			{
				title: "Seconds vs. milliseconds, by digit count",
				body: "As a rough rule: a 10-digit timestamp (around 1.7 billion in 2026) is almost always seconds; a 13-digit timestamp is almost always milliseconds. Mixing the two up is one of the most common timestamp bugs — passing a seconds value to something expecting milliseconds lands you in 1970, and the reverse overflows into a date centuries in the future.",
			},
			{
				title: "\"Local time\" only exists at display time",
				body: "There's no such thing as a \"local\" Unix timestamp — the number is the same everywhere on Earth at that instant. Converting to a human-readable local time is a display-layer operation: take the timestamp, apply a timezone offset (including daylight saving rules, which change over the year), and format the result.",
			},
			{
				title: "Negative timestamps are valid",
				body: "A timestamp doesn't have to be positive — a negative value simply represents an instant before January 1, 1970. -86400, for example, is exactly one day before the epoch. Most libraries handle this correctly, but it's worth testing if you're parsing timestamps from historical data.",
			},
		],
		relatedTool: { label: "Try the Timestamp Converter", href: "/timestamp-converter" },
		keywords: ["unix timestamp explained", "seconds vs milliseconds timestamp", "epoch time cheat sheet", "unix timestamp guide"],
	},
	{
		slug: "api-design-and-response-format",
		title: "How to Design a Good API and Choose the Right Response Format",
		description: "Practical API design principles, HTTP status codes, JSON response formats, error handling, pagination, versioning, and a real-world API contract example.",
		publishedAt: "2026-10-15",
		readingTime: "13 min read",
		showTableOfContents: true,
		keywords: [
			"api design best practices",
			"rest api design",
			"json response format",
			"api error handling",
			"rfc 9457 problem details",
			"api versioning",
		],
		relatedTool: { label: "Try the API Response Formatter", href: "/api-response-formatter" },
		sections: [
			{
				title: "Why API design matters",
				body: "An API is a contract. Every frontend, mobile client, and third-party integration that talks to it is making assumptions based on what it returns today — the shape of a successful response, which status code means what, how errors are structured. Change those assumptions without warning, and every consumer breaks at once, often in ways that are hard to trace back to the actual cause.\n\nGood API design isn't about following a rulebook for its own sake. It's about making those assumptions predictable, so a frontend developer can write a response handler once and trust it, a new engineer can read the error format and understand what went wrong without reading the server's source code, and a change six months from now doesn't require coordinating a simultaneous deploy across five different clients. Predictability is what makes an API pleasant to integrate with — and what makes debugging a 2am incident take ten minutes instead of two hours.",
			},
			{
				title: "What makes a good API?",
				body: "No single rule defines a \"good\" API, but the ones that are pleasant to work with tend to share the same handful of qualities. None of these is exotic — they're mostly about consistency and saying no to shortcuts that save you ten minutes now at the cost of an hour for every future consumer.",
				list: [
					"Consistent naming — one casing convention (camelCase or snake_case) across every field, not a mix.",
					"Predictable response structures — a 200 from one endpoint looks structurally like a 200 from another.",
					"Correct HTTP methods — GET never mutates state, DELETE doesn't require a body, and so on.",
					"Correct status codes — the code tells the client what happened without it having to parse the body first.",
					"Clear error messages — specific enough that a developer can act on them without guessing.",
					"Input validation — reject bad input early and explain exactly what was wrong with it.",
					"Pagination — any endpoint that can return an unbounded number of items supports it from day one.",
					"Filtering and sorting — exposed through predictable, documented query parameters.",
					"Authentication and authorization — clearly separated, and enforced server-side, never trusted from the client.",
					"Documentation — accurate and versioned alongside the API itself, not a separate artifact that rots.",
					"Backward compatibility — a plan for evolving the API without breaking existing consumers overnight.",
					"Security and data minimization — responses include what a client needs, not an entire database row.",
				],
			},
			{
				title: "Choose the right HTTP methods",
				body: "HTTP methods exist so that a request's intent is visible before anyone reads its body — a caching proxy, a logging tool, or another engineer skimming an access log can all tell what an endpoint does just from the method and path. Using the wrong method throws that signal away.",
				table: {
					headers: ["Method", "Purpose", "Idempotent?"],
					rows: [
						["GET", "Retrieve a resource or collection. Never changes state.", "Yes"],
						["POST", "Create a new resource, or trigger an action that doesn't map to a resource.", "No"],
						["PUT", "Replace a resource entirely with the provided representation.", "Yes"],
						["PATCH", "Apply a partial update to a resource.", "Not guaranteed"],
						["DELETE", "Remove a resource.", "Yes"],
					],
				},
			},
			{
				title: "Idempotency actually matters",
				body: 'Idempotent means calling it once has the same effect as calling it five times. GET, PUT, and DELETE are idempotent by definition — sending the same DELETE request twice still ends with the resource gone, not an error on the second attempt. POST is not: submitting the same "create an order" request twice should usually create two orders, which is exactly why flaky networks and naive retry logic cause duplicate-order bugs on POST endpoints. If you need a safely-retryable creation endpoint, that\'s what idempotency keys (a client-generated request ID the server deduplicates on) are for — not a reason to misuse PUT.',
			},
			{
				title: "Choose the right HTTP status codes",
				body: "The status code is the fastest signal in the entire response — a caching layer, a monitoring dashboard, or a client's error-handling middleware can all react to it without parsing a single byte of the body. Picking the closest matching code, rather than defaulting to 200 or 500 for everything, is one of the highest-leverage things an API can get right.",
				list: [
					"200 OK — a generic success, most often for GET.",
					"201 Created — a POST successfully created a new resource.",
					"202 Accepted — the request was accepted but will be processed asynchronously.",
					"204 No Content — success, with nothing to return (a typical DELETE response).",
					"400 Bad Request — the request itself is malformed.",
					"401 Unauthorized — authentication is missing or invalid.",
					"403 Forbidden — authenticated, but not permitted to do this.",
					"404 Not Found — the resource doesn't exist.",
					"409 Conflict — the request conflicts with the resource's current state.",
					"422 Unprocessable Content — well-formed, but fails validation.",
					"429 Too Many Requests — the caller is being rate-limited.",
					"500 Internal Server Error — an unexpected, unhandled failure.",
					"502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout — infrastructure-level failures, usually not the client's fault.",
				],
				links: [{ label: "Look up any status code in the HTTP Status Code Reference", href: "/http-status-codes" }],
			},
			{
				title: "What should a successful API response look like?",
				body: "There is no single mandatory JSON envelope every REST API must use — and a surprising amount of advice online states one as if it were a standard. It isn't. The right shape depends on what the endpoint returns and what room you want to leave for the response to grow.",
			},
			{
				title: "Pattern A — resource representation",
				body: "Return the resource directly at the root. Simple, and a natural fit for a single-resource endpoint like GET /users/123.",
				codeBlock: { language: "json", code: '{\n  "id": 123,\n  "name": "Example User",\n  "email": "user@example.com"\n}' },
			},
			{
				title: "Pattern B — envelope-based",
				body: "Wrap the resource in a `data` field. Slightly more ceremony, but it leaves room to add top-level metadata later (like a `meta` or `links` object) without breaking existing clients that only read `data`.",
				codeBlock: { language: "json", code: '{\n  "data": {\n    "id": 123,\n    "name": "Example User"\n  }\n}' },
			},
			{
				title: "Pattern C — collection with pagination metadata",
				body: "For a list endpoint, pair the array with a `meta` object describing where the client is in the collection. Without this, a client has no way to know whether it has fetched everything.",
				codeBlock: {
					language: "json",
					code: '{\n  "data": [\n    { "id": 1, "name": "User One" },\n    { "id": 2, "name": "User Two" }\n  ],\n  "meta": {\n    "page": 1,\n    "perPage": 10,\n    "total": 100\n  }\n}',
				},
				links: [{ label: "Paste any of these into the API Response Formatter to see the analysis", href: "/api-response-formatter" }],
			},
			{
				title: "All three are valid — the mistake is mixing them",
				body: "The actual failure mode isn't picking pattern A over B — it's an API where /users/123 returns a bare object, /orders/456 wraps it in `data`, and /invoices/789 does something else again. Pick one convention per API (not necessarily per endpoint — a list endpoint legitimately needs pagination metadata a single-resource endpoint doesn't) and apply it consistently, so a client written against one endpoint can reasonably predict the shape of another.",
			},
			{
				title: "How to design error responses",
				body: "An error response has the same consistency requirements as a success response, with one addition: it needs to give a developer — not just an end user — enough information to fix the problem without reading your server's logs.",
				list: [
					"A stable, machine-readable error code a client can branch on, separate from the human-readable message.",
					"A human-readable message, safe to log but not necessarily safe to show a user verbatim.",
					"Field-level validation errors when the failure is about specific input fields.",
					"A request correlation ID, so a user can report an error and you can find the exact server-side log line.",
					"No stack traces or internal exception messages — those are for your logs, not the response body.",
					"No sensitive information — don't confirm whether an email exists in your system via a different error message than a generic one.",
				],
			},
			{
				title: "RFC 9457: Problem Details for HTTP APIs",
				body: "Rather than inventing a bespoke error shape, RFC 9457 standardizes one. It defines five members — `type` (a URI identifying the error type), `title` (a short, human-readable summary), `status` (the HTTP status code, repeated in the body for convenience), `detail` (specific to this occurrence), and `instance` (a URI identifying this specific occurrence). Everything else, like the `errors` field below, is an application-specific extension the spec explicitly allows.",
				codeBlock: {
					language: "json",
					code: '{\n  "type": "https://example.com/problems/validation-error",\n  "title": "Validation failed",\n  "status": 422,\n  "detail": "One or more fields are invalid.",\n  "instance": "/api/users",\n  "errors": {\n    "email": [\n      "A valid email address is required."\n    ]\n  }\n}',
				},
				links: [{ label: "Check the status field against the HTTP Status Code Reference", href: "/http-status-codes" }],
			},
			{
				title: "Pagination, filtering, and sorting",
				body: "Any endpoint that returns a collection should support pagination before it ships, not after the first time it returns 50,000 rows in one response. Filtering and sorting are usually exposed the same way — as query parameters with documented, predictable names.",
				codeBlock: { language: "http", code: "GET /api/users?page=2&perPage=20&sort=name&order=asc" },
			},
			{
				title: "Offset pagination vs. cursor pagination",
				body: "Offset pagination (page=2&perPage=20) is simple to implement and lets a client jump to an arbitrary page, but it can skip or duplicate rows if records are inserted or deleted between requests, and it gets slow on very large tables because the database still has to scan past every skipped row. Cursor pagination (next=eyJpZCI6NDJ9, an opaque pointer to \"after this specific record\") stays consistent even as the underlying data changes and scales better for large datasets, at the cost of not supporting \"jump to page 10\" directly. Favor cursor pagination for large, frequently-changing collections (activity feeds, logs); offset pagination is fine for smaller, more static ones (a settings list, a paginated admin table).",
			},
			{
				title: "Authentication and security",
				body: "None of the response-shape advice above matters if the API leaks data or can be trivially abused. A short list of baseline requirements:",
				list: [
					"Serve everything over HTTPS — no exceptions, including internal services.",
					"Keep authentication (who you are) and authorization (what you're allowed to do) as clearly separate checks.",
					"Validate every input server-side — client-side validation is a UX nicety, never a security boundary.",
					"Rate-limit by API key or IP to blunt both abuse and accidental runaway clients.",
					"Keep error messages safe — don't let them become a reconnaissance tool for an attacker.",
					"Set cache headers deliberately — `Cache-Control: no-store` for anything containing personal or sensitive data.",
				],
			},
			{
				title: "Never put secrets in a URL",
				body: "Access tokens and API keys passed as query parameters end up in server access logs, browser history, and any proxy or CDN sitting in the request path — all plain text, all long after the request completes. Pass credentials in an `Authorization` header or a request body instead, both of which are far less likely to be logged by default.",
			},
			{
				title: "API versioning and compatibility",
				body: "Every API eventually needs to change its contract. The question isn't whether, it's how existing consumers find out without their integration breaking at 3am. URL-based versioning (/v1/users, /v2/users) is the most common and easiest for consumers to reason about explicitly; header-based versioning (a custom Accept header or a version header) keeps URLs stable but is less discoverable. Either way, the more valuable discipline is distinguishing the two categories of change below before you ship one.",
				table: {
					headers: ["Change type", "Examples", "Safe without a version bump?"],
					rows: [
						["Backward-compatible", "Adding a new optional field, adding a new endpoint, adding a new optional query parameter", "Yes"],
						["Breaking", "Removing or renaming a field, changing a field's type, changing what a status code means, making an optional parameter required", "No"],
					],
				},
			},
			{
				title: "Example of a complete API contract",
				body: "Putting the above together, here's a realistic contract for a user-creation endpoint — method, path, request body, and every response the client needs to handle.",
				codeBlock: {
					language: "http",
					code:
						"POST /api/users\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"name\": \"Example User\",\n  \"email\": \"user@example.com\"\n}\n\n# 201 Created — success\n{\n  \"data\": {\n    \"id\": 123,\n    \"name\": \"Example User\",\n    \"email\": \"user@example.com\"\n  }\n}\n\n# 422 Unprocessable Content — validation failed\n{\n  \"type\": \"https://example.com/problems/validation-error\",\n  \"title\": \"Validation failed\",\n  \"status\": 422,\n  \"errors\": {\n    \"email\": [\"A valid email address is required.\"]\n  }\n}\n\n# 401 Unauthorized — missing or invalid token\n{\n  \"type\": \"https://example.com/problems/unauthorized\",\n  \"title\": \"Authentication required\",\n  \"status\": 401\n}",
				},
			},
			{
				title: "Common API design mistakes",
				body: "Most of these come from a shortcut that felt reasonable in the moment and became load-bearing behavior a dozen clients now depend on.",
				list: [
					"Returning 200 for every outcome, including errors, and encoding success/failure only in the body.",
					"Using 401 and 403 interchangeably, leaving clients unable to tell \"log in again\" from \"you'll never be allowed to do this.\"",
					"Returning raw stack traces or exception messages in production error responses.",
					"Inconsistent field naming across endpoints within the same API.",
					"Shipping a list endpoint with no pagination, until it returns an unbounded result set in production.",
					"Exposing database internals directly — internal IDs, column names, ORM artifacts — in the public response shape.",
					"Returning far more fields than a client needs, just because the ORM made it easy to serialize the whole row.",
					"Changing a response shape in place with no versioning or migration plan for existing consumers.",
				],
			},
			{
				title: "API design checklist",
				body: "A practical list to run through before shipping a new endpoint:",
				list: [
					"Does the HTTP method match the actual semantics of the operation?",
					"Does the status code match the actual outcome, including every realistic error case?",
					"Is the response shape consistent with the rest of this API?",
					"Does every error response include a stable error code and a specific, actionable message?",
					"Can this endpoint return an unbounded number of items? If so, does it paginate?",
					"Are filtering and sorting parameters documented and named consistently with the rest of the API?",
					"Is every input validated server-side, not just in the client?",
					"Does the response expose only what a client actually needs — nothing extra?",
					"Is there a plan for versioning this endpoint if its contract needs to change later?",
					"Is the documentation for this endpoint accurate as of this change, not just at launch?",
				],
			},
			{
				title: "Conclusion",
				body: "Good API design isn't a one-time decision — it's a set of small, consistent choices (which status code, which field name, which error shape) repeated across every endpoint you ship. None of it is complicated in isolation; the value comes entirely from applying it the same way everywhere, so the tenth endpoint a consumer integrates with is exactly as predictable as the first.",
				links: [
					{ label: "JWT Generator", href: "/jwt-generator" },
					{ label: "HTTP Status Code Reference", href: "/http-status-codes" },
					{ label: "API Response Formatter", href: "/api-response-formatter" },
				],
			},
		],
		faq: [
			{
				question: "What is the best JSON response format for a REST API?",
				answer: "There isn't one mandatory format. Returning the resource directly, wrapping it in a `data` envelope, and adding `meta` for pagination are all valid, widely-used patterns. What matters more than which one you pick is applying it consistently across your API.",
			},
			{
				question: "Should every API response contain a data field?",
				answer: "No. A `data` wrapper is one common convention, useful when you want room to add top-level metadata later, but plenty of well-designed APIs return the resource directly at the root instead.",
			},
			{
				question: "Should errors return 400 or 422?",
				answer: "400 Bad Request is for a structurally malformed request (invalid JSON, wrong content type). 422 Unprocessable Content is for a well-formed request that fails validation or a business rule, like an invalid email format.",
			},
			{
				question: "Should a create endpoint return 200 or 201?",
				answer: "201 Created, when the request successfully creates a new resource. Use 202 Accepted instead if creation is queued for asynchronous processing rather than completed immediately.",
			},
			{
				question: "Is a success boolean necessary in API responses?",
				answer: "No — it's one convention among several, and it duplicates information the HTTP status code already carries. Many well-designed APIs rely on the status code alone and skip it.",
			},
			{
				question: "What is RFC 9457?",
				answer: "RFC 9457, \"Problem Details for HTTP APIs,\" standardizes a JSON (or XML) shape for error responses: type, title, status, detail, and instance, with room for application-specific extensions.",
			},
			{
				question: "How should paginated API responses be structured?",
				answer: "Commonly, the items go in a `data` array and pagination state (current page, items per page, total count, or a cursor) goes in a sibling `meta` object — but the exact field names are a project convention, not a standard.",
			},
		],
	},
];

export function getBlogPost(slug: string): BlogPost | undefined {
	return BLOG_POSTS.find(post => post.slug === slug);
}
