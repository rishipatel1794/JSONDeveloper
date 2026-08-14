"use client";

import { useState } from "react";

import { ToolAlert } from "@/components/tools/shared/ToolAlert";
import { decodeJwt } from "@/lib/tools/jwt/decoder";
import { SAMPLE_JWT } from "@/lib/tools/jwt/utils";
import type { DecodedJwt } from "@/lib/tools/jwt/types";

import { JwtActions } from "./JwtActions";
import { JwtClaims } from "./JwtClaims";
import { JwtHeader } from "./JwtHeader";
import { JwtInput } from "./JwtInput";
import { JwtPayload } from "./JwtPayload";
import { JwtPrivacyNotice } from "./JwtPrivacyNotice";
import { JwtSignature } from "./JwtSignature";
import { JwtTokenStatus } from "./JwtTokenStatus";

export function JwtDecoder() {
	const [token, setToken] = useState("");
	const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
	const [error, setError] = useState("");

	function handleDecode() {
		const result = decodeJwt(token);

		if (!result.success || !result.data) {
			setDecoded(null);
			setError(result.error ?? "Unable to decode JWT.");
			return;
		}

		setDecoded(result.data);
		setError("");
	}

	function handleClear() {
		setToken("");
		setDecoded(null);
		setError("");
	}

	function handleLoadExample() {
		setToken(SAMPLE_JWT);

		const result = decodeJwt(SAMPLE_JWT);
		if (result.success && result.data) {
			setDecoded(result.data);
			setError("");
		}
	}

	return (
		<div className="space-y-4">
			<JwtPrivacyNotice />

			<JwtInput value={token} onChange={setToken} onDecode={handleDecode} onClear={handleClear} onLoadExample={handleLoadExample} />

			{error && <ToolAlert variant="error">{error}</ToolAlert>}

			{decoded && (
				<>
					<JwtActions decoded={decoded} />

					<div className="grid gap-4 lg:grid-cols-2">
						<JwtHeader header={decoded.header} />
						<JwtPayload payload={decoded.payload} />
					</div>

					<JwtSignature signature={decoded.signature} />
					<JwtClaims payload={decoded.payload} />
					<JwtTokenStatus header={decoded.header} payload={decoded.payload} />
				</>
			)}
		</div>
	);
}
