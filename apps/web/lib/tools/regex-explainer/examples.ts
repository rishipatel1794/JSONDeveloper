export interface ExplainerExample {
	id: string;
	label: string;
	pattern: string;
	flags: string;
	testInput: string;
	note?: string;
}

export const EXPLAINER_EXAMPLES: ExplainerExample[] = [
	{
		id: "email",
		label: "Email-like format",
		pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
		flags: "",
		testInput: "user@example.com",
		note: "Checks the general shape of an email address — it doesn't verify the address actually exists.",
	},
	{
		id: "url",
		label: "URL-like format",
		pattern: "^https?:\\/\\/[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(?:\\/[^\\s]*)?$",
		flags: "",
		testInput: "https://example.com/path?x=1",
	},
	{
		id: "strong-password",
		label: "Strong-password rule",
		pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
		flags: "",
		testInput: "Str0ng!Pass",
		note: "Length and character-class rules are a convention, not a guarantee of real password strength.",
	},
	{
		id: "date",
		label: "Date format (YYYY-MM-DD)",
		pattern: "^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$",
		flags: "",
		testInput: "2026-10-15",
		note: "Checks digit ranges for month and day — doesn't know that February never has 30 days.",
	},
	{
		id: "ipv4",
		label: "IPv4 format",
		pattern: "^(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)$",
		flags: "",
		testInput: "192.168.1.1",
	},
	{
		id: "hex-color",
		label: "Hex color",
		pattern: "^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$",
		flags: "",
		testInput: "#A3F2C1",
	},
	{
		id: "username",
		label: "Username",
		pattern: "^[a-zA-Z0-9_]{3,20}$",
		flags: "",
		testInput: "john_doe92",
	},
	{
		id: "whitespace",
		label: "Whitespace matching",
		pattern: "\\s+",
		flags: "g",
		testInput: "This   text has\tirregular    spacing.",
	},
	{
		id: "extract-numbers",
		label: "Extracting numbers",
		pattern: "\\d+(?:\\.\\d+)?",
		flags: "g",
		testInput: "Order #4521 shipped 3.5kg on 2026-08-12.",
	},
	{
		id: "html-tag",
		label: "Matching HTML tags (demonstration)",
		pattern: "<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>",
		flags: "g",
		testInput: "<p>Hello <b>world</b></p>",
		note: "Regex is not a general-purpose HTML parser — nested or malformed tags, comments, and attributes with \">\" inside them will break this. Use a real HTML parser for anything beyond a quick, controlled demonstration.",
	},
];
