import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "Why does a database service need a volume?",
		answer: "Without a volume, a database's data lives only inside the container's writable layer, which is destroyed when the container is removed. Mounting a named volume (like postgres_data) to the database's data directory keeps your data across docker compose down and docker compose up cycles.",
	},
	{
		question: "What does depends_on actually guarantee?",
		answer: "By default, it only guarantees start order — the dependency's container starts first, but not that the service inside it (e.g. Postgres accepting connections) is actually ready yet. For most local dev setups this is fine since apps typically retry their first connection; for stricter guarantees, compose supports a condition: service_healthy option alongside a healthcheck, which this tool doesn't set by default to keep the generated file simple.",
	},
	{
		question: "Can I add a service this tool doesn't have a preset for?",
		answer: "Yes — use \"Custom\" as the service type, then fill in the image, ports, environment variables, and volumes yourself. Every field remains fully editable regardless of which preset you started from.",
	},
	{
		question: "Should I commit docker-compose.yml to version control?",
		answer: "Yes, that's normal and expected — it's your infrastructure-as-code. Just make sure any real secrets come from a .env file (excluded via .gitignore) or your deployment platform's secrets manager, referenced as ${VARIABLE_NAME}, rather than being written directly into the committed YAML.",
	},
];

export function DockerComposeGeneratorFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
