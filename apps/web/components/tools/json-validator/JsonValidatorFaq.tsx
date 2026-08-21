import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
	{
		question: "What is JSON?",
		answer:
			"JSON (JavaScript Object Notation) is a lightweight, text-based format for representing structured data — objects, arrays, strings, numbers, booleans, and null — used throughout APIs, config files, and logs.",
	},
	{
		question: "How do I validate JSON?",
		answer:
			"Paste it into the editor above. It's checked automatically as you type, and you can also click Validate JSON at any time. Valid input shows statistics and structure; invalid input shows the exact line, column, and reason.",
	},
	{
		question: "Why is my JSON invalid?",
		answer:
			"The three most common causes are a trailing comma after the last property or element, single quotes instead of double quotes, and a missing comma between two properties. This tool names the specific cause instead of a generic parser error where possible.",
	},
	{
		question: "Does JSON allow trailing commas?",
		answer: "No. Unlike JavaScript object literals, standard JSON does not allow a comma after the last property in an object or the last element in an array.",
	},
	{
		question: "Can JSON have duplicate keys?",
		answer:
			"The JSON grammar technically permits it, but most parsers (including JavaScript's JSON.parse) silently keep only the last value and discard earlier ones. This tool detects duplicate keys explicitly so they don't slip through unnoticed.",
	},
	{
		question: "What is JSON Schema?",
		answer:
			"JSON Schema is a JSON document that describes the expected shape of other JSON — required properties, value types, formats, and more. It's used to validate that data conforms to a contract, not just that it's syntactically valid JSON.",
	},
	{
		question: "How do I validate JSON against JSON Schema?",
		answer: "Switch to the JSON Schema tab, paste your schema, and the JSON from the input above is validated against it automatically.",
	},
	{
		question: "What is the difference between JSON Formatter and JSON Validator?",
		answer:
			"JSON Formatter focuses on formatting, minifying, and beautifying JSON you already know is valid. JSON Validator focuses on debugging and analysis — pinpointing syntax errors, detecting duplicate keys, computing statistics, exploring structure, validating against a schema, and generating TypeScript, Zod, or JSON Schema.",
	},
];

export function JsonValidatorFaq() {
	return (
		<section id="faq" className="scroll-mt-16 border-t border-border">
			<div className="container mx-auto max-w-3xl px-4 py-16">
				<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Frequently asked questions</h2>

				<div className="mt-8">
					<Accordion items={FAQ_ITEMS} />
				</div>
			</div>
		</section>
	);
}
