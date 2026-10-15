import { Accordion } from "@/components/ui/Accordion";

export const FAQ_ITEMS = [
	{
		question: "Is my signing secret or private key sent to a server?",
		answer: "No. Every signing operation runs in your browser using the Web Crypto API via the `jose` library. Your secret or private key is never transmitted, logged, or stored.",
	},
	{
		question: "What key format does asymmetric signing require?",
		answer:
			"A PKCS8 PEM private key, beginning with \"-----BEGIN PRIVATE KEY-----\". If you have a PKCS1 key (\"-----BEGIN RSA PRIVATE KEY-----\"), convert it first with `openssl pkcs8 -topk8 -nocrypt -in key.pem -out key-pkcs8.pem`.",
	},
	{
		question: "Why won't it let me generate a token?",
		answer: "Usually one of: invalid header or payload JSON, a missing secret or private key, the header's \"alg\" not matching the selected algorithm, or an invalid claim type (e.g. exp that isn't a number). The error message names the specific cause.",
	},
	{
		question: "Does generating a token mean it's verified or trustworthy?",
		answer: "No — generating a token only proves it was signed with the key and algorithm you provided here. Whether a server should trust it depends entirely on that server's own verification logic and whether it recognizes this signing key.",
	},
	{
		question: "Why is EdDSA sometimes disabled?",
		answer: "EdDSA (Ed25519) support in the Web Crypto API is newer than RSA and ECDSA support, so it isn't available in every browser yet. This tool checks your browser's actual capability and disables the option rather than generating a token that would silently fail elsewhere.",
	},
	{
		question: "Can I edit iat and exp directly instead of using the helper buttons?",
		answer: "Yes — the payload is a fully editable JSON document. The claim helper buttons are a shortcut for common edits (like setting exp to now plus a duration), not the only way to set these values.",
	},
];

export function JwtGeneratorFaq() {
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
