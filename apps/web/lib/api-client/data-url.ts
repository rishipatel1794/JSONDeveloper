/** Splits a "data:<mime>;base64,<data>" URL into its parts, as produced by FileReader.readAsDataURL. */
export function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
	const match = /^data:([^;]*);base64,(.*)$/s.exec(dataUrl);
	return { mimeType: match?.[1] || "application/octet-stream", base64: match?.[2] ?? "" };
}
