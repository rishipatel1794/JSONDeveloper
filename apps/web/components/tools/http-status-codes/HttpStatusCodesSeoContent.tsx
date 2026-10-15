const COMPARISONS: Array<{ title: string; rows: Array<[string, string]> }> = [
	{
		title: "200 vs. 201 vs. 202 vs. 204",
		rows: [
			["200 OK", "A generic success — most GETs, and updates that return the resource."],
			["201 Created", "A POST (or PUT) successfully created a new resource."],
			["202 Accepted", "The request was accepted but processing hasn't finished — async jobs."],
			["204 No Content", "Success, but there's nothing to return — typically DELETE."],
		],
	},
	{
		title: "401 vs. 403",
		rows: [
			["401 Unauthorized", "Authentication is missing or invalid — the server doesn't know who you are."],
			["403 Forbidden", "You're authenticated, but not allowed to do this — re-authenticating won't help."],
		],
	},
	{
		title: "400 vs. 422",
		rows: [
			["400 Bad Request", "The request itself is malformed — invalid JSON, wrong structure."],
			["422 Unprocessable Content", "The request is well-formed but fails validation or business rules."],
		],
	},
	{
		title: "301 vs. 302",
		rows: [
			["301 Moved Permanently", "The resource permanently moved — update bookmarks and links."],
			["302 Found", "A temporary redirect — keep using the original URL afterward."],
		],
	},
	{
		title: "502 vs. 504",
		rows: [
			["502 Bad Gateway", "A proxy got an invalid response from the upstream server."],
			["504 Gateway Timeout", "A proxy never got a response from the upstream server in time."],
		],
	},
];

export function HttpStatusCodesSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding HTTP status codes</h2>

				<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
					An HTTP status code is a three-digit number a server sends with every response, telling the client whether the request succeeded, needs
					redirecting, or failed — and if it failed, whose fault it was. The first digit groups codes by meaning: 1xx informational, 2xx success, 3xx
					redirection, 4xx client error, and 5xx server error.
				</p>

				<div className="mt-8 space-y-8">
					{COMPARISONS.map(comparison => (
						<div key={comparison.title}>
							<h3 className="text-base font-semibold text-foreground">{comparison.title}</h3>
							<div className="mt-2 overflow-x-auto rounded-lg border border-border">
								<table className="w-full text-left text-sm">
									<tbody>
										{comparison.rows.map(([code, explanation]) => (
											<tr key={code} className="border-b border-border-subtle last:border-b-0">
												<td className="whitespace-nowrap px-3 py-2 font-mono font-medium text-foreground">{code}</td>
												<td className="px-3 py-2 text-muted-foreground">{explanation}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
