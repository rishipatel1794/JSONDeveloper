import Link from "next/link";

const SECTIONS = [
	{
		title: "What is docker-compose.yml?",
		body: "docker-compose.yml is a YAML file that describes a multi-container application — which images to run, how they're networked together, what ports and volumes they need, and in what order they should start. Running docker compose up brings up every service it describes with a single command, instead of a long list of individual docker run invocations.",
	},
	{
		title: "How to use a generated compose file",
		body: "Add the services you need above, download the file as docker-compose.yml, place it in your project's root directory, and run docker compose up -d to start everything in the background. Run docker compose down to stop and remove the containers again.",
	},
	{
		title: "Common multi-service setups",
		body: "A typical web app stack pairs a Node.js or Next.js service with a database (PostgreSQL, MySQL, or MongoDB) and often Redis for caching or sessions — each added here as its own service, connected via depends_on so the app waits for its database to be available.",
	},
	{
		title: "Why passwords are placeholders",
		body: "Every generated example uses a placeholder like change-me instead of a real password, deliberately. A docker-compose.yml file is commonly committed to version control, and a real credential baked into it would be exposed to anyone with repository access. In production, provide real secrets via environment variables (docker compose --env-file), a .env file that's excluded from version control, or a dedicated secrets manager — never by hand-editing a real password into the YAML.",
	},
];

export function DockerComposeGeneratorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding Docker Compose</h2>

				<div className="mt-6 space-y-6">
					{SECTIONS.map(section => (
						<div key={section.title}>
							<h3 className="text-base font-semibold text-foreground">{section.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
						</div>
					))}
				</div>

				<p className="mt-6 text-sm leading-relaxed text-muted-foreground">
					Fronting these services with Nginx? Generate a matching reverse-proxy config with the{" "}
					<Link href="/tools/nginx-config-generator" className="text-primary hover:underline">
						Nginx Config Generator
					</Link>
					.
				</p>
			</div>
		</section>
	);
}
