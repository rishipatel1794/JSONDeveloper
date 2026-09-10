export interface ApacheRedirect {
	id: string;
	type: "301" | "302";
	from: string;
	to: string;
}

export interface ApacheSecurityHeaders {
	xContentTypeOptions: boolean;
	xFrameOptions: boolean;
	referrerPolicy: boolean;
	/** Off by default on purpose — a wrong CSP value can silently break a site, so it must be an explicit, informed choice. */
	contentSecurityPolicy: boolean;
	contentSecurityPolicyValue: string;
}

export interface ApacheConfig {
	forceHttps: boolean;
	wwwRedirect: "none" | "www-to-non-www" | "non-www-to-www";
	disableDirectoryListing: boolean;
	defaultIndexFiles: string;
	redirects: ApacheRedirect[];
	browserCaching: boolean;
	cacheMaxAgeDays: number;
	gzipCompression: boolean;
	brotliCompression: boolean;
	securityHeaders: ApacheSecurityHeaders;
	customDirectives: string;
}

export const DEFAULT_APACHE_CONFIG: ApacheConfig = {
	forceHttps: true,
	wwwRedirect: "none",
	disableDirectoryListing: true,
	defaultIndexFiles: "index.html index.php",
	redirects: [],
	browserCaching: true,
	cacheMaxAgeDays: 30,
	gzipCompression: true,
	brotliCompression: false,
	securityHeaders: {
		xContentTypeOptions: true,
		xFrameOptions: true,
		referrerPolicy: true,
		contentSecurityPolicy: false,
		contentSecurityPolicyValue: "",
	},
	customDirectives: "",
};
