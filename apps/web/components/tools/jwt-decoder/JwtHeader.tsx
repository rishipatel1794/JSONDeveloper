import { Braces } from "lucide-react";

import { CodeEditor } from "@/components/tools/shared/CodeEditor";
import { ToolPanel } from "@/components/tools/shared/ToolPanel";
import type { JwtHeader as JwtHeaderType } from "@/lib/tools/jwt/types";

interface JwtHeaderProps {
	header: JwtHeaderType;
}

export function JwtHeader({ header }: JwtHeaderProps) {
	return (
		<ToolPanel title="Header" icon={Braces}>
			<CodeEditor value={JSON.stringify(header, null, 2)} onChange={() => {}} readOnly height="200px" />
		</ToolPanel>
	);
}
