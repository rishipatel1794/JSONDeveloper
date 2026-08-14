const SECTIONS = [
	{
		title: "What is cURL?",
		body: "cURL is a command-line tool for transferring data with URLs, widely used to test and debug HTTP APIs. A cURL command captures an entire HTTP request — method, URL, headers, body, and options — in a single line you can run, share, or paste into documentation.",
	},
	{
		title: "How to create a cURL request",
		body: "Choose a method, enter a URL, and add whatever query parameters, headers, body, or authentication the request needs. The generated command updates as you go, so you can copy it the moment it looks right.",
	},
	{
		title: "cURL GET request examples",
		body: "A basic GET request only needs a URL: curl --request GET --url 'https://api.example.com/users'. Query parameters get appended and encoded automatically when you add them in the Query tab.",
	},
	{
		title: "cURL POST request examples",
		body: "POST requests typically pair a body with a Content-Type header. Switching the Body tab to JSON adds a Content-Type: application/json header automatically (if one isn't already set) and generates a --data flag with your payload.",
	},
	{
		title: "cURL headers",
		body: "Each enabled row in the Headers tab becomes a --header 'Name: Value' flag. Disabled rows are kept in the builder but left out of the generated command, so you can toggle them without losing your work.",
	},
	{
		title: "cURL JSON requests",
		body: "The JSON body editor uses the same Monaco-based editor as the JSON Formatter, including a Format JSON button that reuses this platform's JSON formatting logic to pretty-print your payload.",
	},
	{
		title: "cURL Bearer authentication",
		body: "Bearer Token auth adds an Authorization: Bearer <token> header to the request. Importing an existing command with that header automatically recognizes it as bearer auth rather than a plain header.",
	},
	{
		title: "cURL query parameters",
		body: "Query parameters are merged with any that already exist in the URL you typed, and values are percent-encoded using the browser's own URL APIs — so spaces, symbols, and unicode text all come out correctly encoded.",
	},
	{
		title: "cURL file uploads",
		body: "Multipart form data supports both text fields and file fields. File fields generate curl's @filename upload syntax, using whatever filename you enter as a placeholder — no file is actually read or uploaded by this tool.",
	},
	{
		title: "cURL vs HTTP clients",
		body: "A generated cURL command is portable — you can run it in a terminal, paste it into a teammate's chat, or drop it into a bug report, all without either of you needing the same GUI client installed.",
	},
];

export function CurlSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Building cURL commands</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
