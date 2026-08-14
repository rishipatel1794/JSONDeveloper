import { ClipboardList } from "lucide-react";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { JwtPayload as JwtPayloadType } from "@/lib/tools/jwt/types";

interface JwtPayloadProps {
	payload: JwtPayloadType;
}

export function JwtPayload({ payload }: JwtPayloadProps) {
	return (
		<ToolPanel title="Payload" icon={ClipboardList}>
			<CodeEditor value={JSON.stringify(payload, null, 2)} onChange={() => {}} readOnly height="200px" />
		</ToolPanel>
	);
}
