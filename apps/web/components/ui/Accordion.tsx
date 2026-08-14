"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionItem {
	question: string;
	answer: string;
}

interface AccordionProps {
	items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
	const baseId = useId();
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<div className="divide-y divide-border-subtle rounded-lg border border-border bg-card">
			{items.map((item, index) => {
				const isOpen = openIndex === index;
				const panelId = `${baseId}-panel-${index}`;
				const buttonId = `${baseId}-button-${index}`;

				return (
					<div key={item.question}>
						<h3>
							<button
								type="button"
								id={buttonId}
								aria-expanded={isOpen}
								aria-controls={panelId}
								onClick={() => setOpenIndex(isOpen ? null : index)}
								className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:text-base"
							>
								{item.question}
								<ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
							</button>
						</h3>

						<div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
							<p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
