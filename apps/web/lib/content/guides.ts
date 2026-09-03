import type { ContentSection } from "./blog";

export interface DeveloperGuide {
	slug: string;
	title: string;
	description: string;
	updatedAt: string;
	readingTime: string;
	sections: ContentSection[];
	relatedTool: { label: string; href: string };
}

export const DEVELOPER_GUIDES: DeveloperGuide[] = [
	{
		slug: "getting-started-with-the-api-client",
		title: "Getting Started with the API Client",
		description: "Build, send, and inspect HTTP requests from your browser — methods, headers, auth, and variables.",
		updatedAt: "2026-08-10",
		readingTime: "5 min read",
		sections: [
			{
				title: "Building a request",
				body: "Pick a method, enter a URL, and add query params, headers, or a body as needed. The API Client supports JSON, raw text, form-urlencoded, and multipart form-data bodies, including file uploads read locally in your browser.",
			},
			{
				title: "Authorization",
				body: "The Authorization tab handles Bearer tokens, Basic auth, and API keys (sent as a header or query parameter) without you having to hand-build the header yourself — pick a type, fill in the fields, and it's applied to the request automatically.",
			},
			{
				title: "Variables across requests",
				body: "Save a value from one response (like an auth token) and reuse it in later requests via a variable, instead of copy-pasting it every time. This is especially useful for a login-then-use-the-token workflow.",
			},
			{
				title: "Where the request actually goes",
				body: "Browsers block most cross-origin requests, so the API Client relays your request through a small proxy purely to make the network call and hand back the response — it doesn't log or store request or response bodies.",
			},
		],
		relatedTool: { label: "Open the API Client", href: "/api-client" },
	},
	{
		slug: "importing-a-postman-collection",
		title: "Importing a Postman Collection",
		description: "Bring existing Postman requests into the API Client, or export your work back out as a collection or cURL command.",
		updatedAt: "2026-08-14",
		readingTime: "3 min read",
		sections: [
			{
				title: "Import",
				body: "Use the Import button in the API Client to load a Postman Collection (v2/v2.1) JSON export, or paste a single cURL command directly — both are parsed into individual requests you can run, edit, and save right away.",
			},
			{
				title: "What carries over",
				body: "Method, URL, query params, headers, and body all come across. Environment-style variables in the collection map onto the API Client's own variables, so `{{baseUrl}}`-style placeholders keep working without manual edits.",
			},
			{
				title: "Exporting your work",
				body: "Any request can be exported back out as a ready-to-run cURL command, or a group of requests can be exported as a Postman-compatible collection — useful for sharing a request with a teammate who uses Postman, or checking a request into a repo's docs.",
			},
		],
		relatedTool: { label: "Open the API Client", href: "/api-client" },
	},
	{
		slug: "comparing-code-changes-with-code-diff",
		title: "Comparing Code Changes with Code Diff",
		description: "Split vs. unified view, ignoring whitespace-only noise, and reading a diff the way git diff presents one.",
		updatedAt: "2026-08-31",
		readingTime: "4 min read",
		sections: [
			{
				title: "Paste, upload, or drop a file",
				body: "Put your original code on the left and the modified version on the right — paste it directly, use the upload button, or drag and drop a file onto either editor. Nothing is uploaded anywhere; the comparison runs entirely in your browser.",
			},
			{
				title: "Split vs. unified",
				body: "Split view puts both versions side by side, which is easiest to scan on a wide screen. Unified view merges them into one column with +/- markers, closer to `git diff` output — it also switches to automatically on narrow screens.",
			},
			{
				title: "Cutting through noise",
				body: "Turn on \"Ignore Whitespace\" when a reformat or re-indent is burying the real changes, or \"Ignore Empty Lines\" when blank-line additions are cluttering the diff. Both can be toggled after comparing, without pasting the code again.",
			},
			{
				title: "Jumping between changes",
				body: "Once a comparison has more than a couple of changes, the Previous/Next controls jump straight to each change instead of scrolling manually — useful for a large file where most lines are unchanged.",
			},
		],
		relatedTool: { label: "Open Code Diff", href: "/code-diff" },
	},
	{
		slug: "generating-and-debugging-curl-commands",
		title: "Generating and Debugging cURL Commands",
		description: "Turn a request into a copy-pasteable cURL command, and read one someone else handed you.",
		updatedAt: "2026-08-05",
		readingTime: "3 min read",
		sections: [
			{
				title: "Building one from scratch",
				body: "Fill in a method, URL, headers, and body, and the cURL Generator produces the exact command as you go — handy for handing a teammate a runnable reproduction of a request, or pasting into a shell script.",
			},
			{
				title: "Flags worth knowing",
				body: "-X sets the method, -H adds a header (repeat it for each one), -d sends a body (and implies POST if no -X is given), and -i includes the response headers in the output, which is often the first thing worth adding when a request \"isn't working\" as expected.",
			},
			{
				title: "Reading someone else's command",
				body: "A long cURL command with several -H flags and an escaped JSON body is hard to scan by eye. Pasting it into the API Client via cURL import turns it back into individual method/URL/header/body fields, which is usually faster to actually debug.",
			},
		],
		relatedTool: { label: "Open the cURL Generator", href: "/curl-generator" },
	},
];

export function getDeveloperGuide(slug: string): DeveloperGuide | undefined {
	return DEVELOPER_GUIDES.find(guide => guide.slug === slug);
}
