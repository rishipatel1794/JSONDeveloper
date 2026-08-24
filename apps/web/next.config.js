/** @type {import('next').NextConfig} */
const nextConfig = {
	// Produces a self-contained `.next/standalone` output with just the files needed to run the
	// server — makes self-hosting (Docker, a plain VPS) much smaller to deploy. Vercel ignores this.
	output: "standalone",

	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					// Every tool here is meant to be opened directly, never embedded — blocking framing
					// removes a class of clickjacking attacks for free.
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					// None of these tools touch the camera, microphone, or location — deny by default.
					{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
				],
			},
		];
	},
};

export default nextConfig;
