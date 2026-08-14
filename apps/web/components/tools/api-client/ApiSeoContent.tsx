const SECTIONS = [
	{
		title: "What is an API Client?",
		body: "An API client lets you build and send HTTP requests without writing code — configuring the method, URL, headers, and body visually, then inspecting the response directly, instead of reaching for curl or writing a throwaway script.",
	},
	{
		title: "How to test REST APIs",
		body: "Choose a method, enter an endpoint URL, and add whatever query parameters, headers, authentication, or body the API expects. Click Send and the response — status, timing, size, headers, and body — appears below.",
	},
	{
		title: "How to send GET requests",
		body: "A GET request only needs a URL. Add query parameters in the Params tab if the endpoint needs them; they're merged into the URL and properly encoded before the request is sent.",
	},
	{
		title: "How to send POST requests",
		body: "Switch the method to POST and use the Body tab to add a payload. Selecting JSON as the body type adds a Content-Type: application/json header automatically (if one isn't already set) and gives you a Monaco-based editor with a Format JSON button.",
	},
	{
		title: "How to add request headers",
		body: "Each enabled row in the Headers tab is sent as-is. Disabled rows stay in the builder without being sent, so you can toggle a header on and off without losing what you typed.",
	},
	{
		title: "How to send JSON request bodies",
		body: "The JSON body editor reuses the same JSON formatting logic as the JSON Formatter tool, so the Format JSON button behaves identically here.",
	},
	{
		title: "How to use Bearer authentication",
		body: "The Authorization tab's Bearer Token option adds an Authorization: Bearer <token> header for you, without needing to type it into the Headers tab by hand.",
	},
	{
		title: "How to inspect API responses",
		body: "The Response panel shows the status code, response time, and size at a glance, with Pretty, Raw, and Headers tabs below — Pretty formats JSON for readability, Raw shows exactly what came back, and Headers lists every response header with a per-value copy button.",
	},
	{
		title: "HTTP status codes",
		body: "2xx codes mean success, 3xx means a redirect (shown as-is rather than followed automatically), 4xx means a client-side problem with the request, and 5xx means the server hit an error — a 404 or 500 is a normal response, not a tool failure.",
	},
];

export function ApiSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Testing APIs from your browser</h2>

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
