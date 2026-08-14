const SECTIONS = [
	{
		title: "What is a JWT?",
		body: "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims between two parties. It's commonly used for authentication and authorization — after a user logs in, a server issues a JWT that the client sends with subsequent requests to prove who it is.",
	},
	{
		title: "How does a JWT work?",
		body: "A server creates a JWT by encoding a header and payload, then signing the result with a secret or private key. The client stores the token and sends it with requests, typically in an Authorization header. The server verifies the signature to confirm the token hasn't been tampered with before trusting its contents.",
	},
	{
		title: "JWT structure",
		body: "A JWT is three Base64URL-encoded sections separated by periods: Header.Payload.Signature. Each section serves a different purpose, and all three are required for a token to be structurally valid.",
	},
	{
		title: "JWT header",
		body: "The header describes how the token is secured — typically the signing algorithm (alg, such as HS256 or RS256) and the token type (typ, usually \"JWT\").",
	},
	{
		title: "JWT payload",
		body: "The payload holds the claims — the actual data the token carries, such as who it identifies (sub), when it expires (exp), and any custom claims an application adds. Payload data is readable by anyone who has the token; it is not encrypted.",
	},
	{
		title: "JWT signature",
		body: "The signature is created by signing the encoded header and payload with a secret or private key. It lets a server verify that the token was issued by a trusted source and hasn't been modified — but verification requires that key, which is never entered into a decoder like this one.",
	},
	{
		title: "Common JWT claims",
		body: "Several claim names are standardized: iss (issuer), sub (subject), aud (audience), exp (expiration time), nbf (not before), iat (issued at), and jti (a unique token ID). Applications often add their own claims alongside these.",
	},
	{
		title: "Is decoding a JWT safe?",
		body: "Yes — decoding just reverses the Base64URL encoding to reveal the header and payload, the same way any client that receives the token already can. This tool does that entirely in your browser; the token is never sent anywhere.",
	},
	{
		title: "Does decoding verify a JWT?",
		body: "No. Decoding only reveals the contents of a token. Verifying a JWT means checking its signature against the correct secret or public key, which proves the token is authentic and unmodified. This tool intentionally does not verify signatures, since that would require entering a secret or key.",
	},
	{
		title: "JWT vs JWT verification",
		body: "Decoding tells you what a token claims to say. Verification tells you whether you can trust that claim. Never trust the contents of a JWT for an authorization decision until its signature has been verified by your backend with the correct key.",
	},
];

export function JwtSeoContent() {
	return (
		<section className="border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Understanding JSON Web Tokens</h2>

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
