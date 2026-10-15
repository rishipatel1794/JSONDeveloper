/** Feature-detects Ed25519 support rather than assuming it — only recent browser versions implement it via Web Crypto. */
export async function detectEdDsaSupport(): Promise<boolean> {
	try {
		await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
		return true;
	} catch {
		return false;
	}
}
