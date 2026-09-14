import type { CodegenTarget } from "./JsonToCodeTool";

interface TargetInfo {
	/** Display name of the target language/library, e.g. "TypeScript". */
	label: string;
	/** What the generated output is called, e.g. "interface", "dataclass", "schema". */
	outputName: string;
	/** Route of this converter, for cross-linking to the others. */
	path: string;
}

export const TARGET_INFO: Record<CodegenTarget, TargetInfo> = {
	typescript: { label: "TypeScript", outputName: "interface", path: "/tools/json-to-typescript" },
	zod: { label: "Zod", outputName: "schema", path: "/tools/json-to-zod" },
	python: { label: "Python", outputName: "dataclass", path: "/tools/json-to-python" },
	php: { label: "PHP", outputName: "class", path: "/tools/json-to-php" },
	java: { label: "Java", outputName: "class", path: "/tools/json-to-java" },
};
