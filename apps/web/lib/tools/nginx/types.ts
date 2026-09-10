export interface NginxProxyHeaders {
	host: boolean;
	realIp: boolean;
	forwardedFor: boolean;
	forwardedProto: boolean;
}

export interface NginxSecurityHeaders {
	xContentTypeOptions: boolean;
	xFrameOptions: boolean;
	referrerPolicy: boolean;
}

export interface NginxConfig {
	serverName: string;
	listenPort: number;
	mode: "static" | "reverse-proxy";
	root: string;
	backendUrl: string;
	proxyHeaders: NginxProxyHeaders;
	ssl: {
		enabled: boolean;
		certPath: string;
		keyPath: string;
		redirectHttpToHttps: boolean;
	};
	securityHeaders: NginxSecurityHeaders;
	caching: {
		enabled: boolean;
		maxAgeDays: number;
	};
	gzip: boolean;
}

export const DEFAULT_NGINX_CONFIG: NginxConfig = {
	serverName: "example.com",
	listenPort: 80,
	mode: "reverse-proxy",
	root: "/var/www/html",
	backendUrl: "http://127.0.0.1:3000",
	proxyHeaders: { host: true, realIp: true, forwardedFor: true, forwardedProto: true },
	ssl: { enabled: false, certPath: "/etc/ssl/certs/example.com.crt", keyPath: "/etc/ssl/private/example.com.key", redirectHttpToHttps: true },
	securityHeaders: { xContentTypeOptions: true, xFrameOptions: true, referrerPolicy: true },
	caching: { enabled: true, maxAgeDays: 30 },
	gzip: true,
};
