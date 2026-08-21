"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
	const searchParams = useSearchParams();
	const [token, setToken] = useState("");
	const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
	const [error, setError] = useState("");

	// Lets other tools (e.g. the JSON Validator's JWT detection) hand off a token via `?token=`
	// without any shared state — the value only ever exists in this tab's URL and this component's state.
	useEffect(() => {
		const tokenFromUrl = searchParams.get("token");
		if (!tokenFromUrl) return;

		setToken(tokenFromUrl);
		const result = decodeJwt(tokenFromUrl);
		if (result.success && result.data) {
			setDecoded(result.data);
			setError("");
		} else {
			setError(result.error ?? "Unable to decode JWT.");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- read once from the initial URL only; re-running on searchParams changes would fight the user's own edits
	}, []);

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
