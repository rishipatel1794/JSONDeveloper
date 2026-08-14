import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is a JWT?",
		answer:
			"A JSON Web Token (JWT) is a compact, signed way to represent claims — typically used to prove a user's identity between a client and a server.",
	},
	{
		question: "Can I decode a JWT without the secret?",
		answer:
			"Yes. The header and payload are only Base64URL-encoded, not encrypted, so anyone with the token can decode them without any secret or key.",
	},
	{
		question: "Does decoding verify the JWT?",
		answer:
			"No. Decoding just reveals the token's contents. Verifying a JWT means checking its signature with the correct secret or public key, which this tool does not do.",
	},
	{
		question: "Is my JWT sent to the server?",
		answer:
			"No. Everything happens locally in your browser using JavaScript. Your token is never sent to our backend, logged, or stored.",
	},
	{
		question: "What are JWT claims?",
		answer:
			"Claims are the pieces of data inside a JWT's payload. Some are standardized (like sub, exp, and iat); applications can also add their own custom claims.",
	},
	{
		question: "What does exp mean?",
		answer:
			"exp is the expiration time — a Unix timestamp (in seconds) after which the token should no longer be accepted.",
	},
	{
		question: "What does iat mean?",
		answer: "iat is the issued-at time — a Unix timestamp (in seconds) recording when the token was created.",
	},
];

export function JwtFaq() {
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
