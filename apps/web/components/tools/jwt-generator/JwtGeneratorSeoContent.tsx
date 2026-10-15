const SECTIONS = [
	{
		title: "What this tool is for",
		body: "This generator builds and signs JSON Web Tokens for development and testing — seeding a local database with test users, exercising an API's auth middleware, or exploring how different claims and algorithms affect a token's structure. It isn't a substitute for your production identity provider's token issuance.",
	},
	{
		title: "Symmetric vs. asymmetric signing",
		body: "HS256/384/512 use a single shared secret for both signing and verification — simple, but anyone who can verify the token can also forge one. RS/ES/EdDSA algorithms use a private key to sign and a separate public key to verify, so services that only need to verify tokens never need the signing key at all.",
	},
	{
		title: "Why the header's alg must match your selection",
		body: "A JWT's header names the algorithm it was signed with, and that has to be the algorithm actually used — this tool won't silently override a mismatched header or silently use a different algorithm than what's shown, since a mismatch there is exactly the kind of bug worth catching before a token reaches a real server.",
	},
];

export function JwtGeneratorSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding JWT generation</h2>

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
