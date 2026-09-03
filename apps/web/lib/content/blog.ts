export interface ContentSection {
	title: string;
	body: string;
}

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	publishedAt: string;
	readingTime: string;
	sections: ContentSection[];
	relatedTool: { label: string; href: string };
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
	},
];

export function getBlogPost(slug: string): BlogPost | undefined {
	return BLOG_POSTS.find(post => post.slug === slug);
}
