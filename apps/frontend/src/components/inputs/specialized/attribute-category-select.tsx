import type { Dispatch, FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import { InputLabel } from "~/components/inputs";
import { Pill } from "~/components/profile/pill/pill";
import { useAttributes, useAttributeTranslation } from "~/hooks/use-attribute";

const HighlightedText: FC<{ children: string; snippet: string }> = ({
	children,
	snippet
}) => {
	const parts = children.split(new RegExp(`(${snippet})`, "gi"));
	if (!snippet || parts.length === 1) return children;

	return (
		<span>
			{parts.map((part, index) => {
				if (part.toLowerCase() !== snippet.toLowerCase()) return part;
				return (
					// eslint-disable-next-line react/no-array-index-key
					<span key={`${part}-${index}`} className="font-bold">
						{part}
					</span>
				);
			})}
		</span>
	);
};

const categoryTypes = {
	interest: "interest-category",
	kink: "kink-category"
} as const;

const noIcons: Record<string, ReactNode> = {};

export type CategorizedAttributeType = keyof typeof categoryTypes;

// Pills grouped under their category's heading, sorted by name. An attribute
// without a category is listed under the first one.
export const InputAttributeCategorySelect: FC<{
	type: CategorizedAttributeType;
	filter?: string;
	selected: Array<string>;
	onSelected: Dispatch<Array<string>>;
	maximum: number;
	categoryIcons?: Record<string, ReactNode>;
}> = ({ type, filter = "", selected, onSelected, maximum, categoryIcons = noIcons }) => {
	const categories = useAttributes(categoryTypes[type]);
	const attributes = useAttributes(type);

	const tAttribute = useAttributeTranslation();
	const name = (id: string) => tAttribute[id]?.name || id;

	return (
		<div className="flex flex-col gap-8">
			{categories.map((categoryId, index) => {
				const filtered = attributes
					.filter(({ category }) =>
						category === categoryId || (index === 0 && !category))
					.filter((attribute) => {
						if (!filter) return true;
						const search = filter.toLowerCase();

						return (
							name(attribute.id).toLowerCase().includes(search)
							|| ("synonyms" in attribute
								&& attribute.synonyms?.some((synonym) =>
									synonym.toLowerCase().includes(search)
								))
						);
					})
					.sort(({ id: a }, { id: b }) => name(a).localeCompare(name(b)));

				if (filtered.length === 0) return null;
				const categoryIcon = categoryIcons[categoryId];

				return (
					<div key={categoryId} className="flex flex-col gap-4">
						<InputLabel className="flex flex-row items-center gap-2">
							{categoryIcon}
							{categoryIcon && " "}
							{name(categoryId)}
						</InputLabel>
						<div className="flex flex-wrap gap-2">
							{filtered.map(({ id }) => {
								const active = selected.includes(id);

								return (
									<Pill
										key={id}
										className={twMerge(
											"data-active:bg-brand-gradient",
											!active && selected.length >= maximum
												? "cursor-default opacity-50"
												: "hover:bg-white-40 data-active:text-white-10 dark:hover:bg-black-50"
										)}
										active={active}
										hocusable={false}
										onClick={() =>
											onSelected(
												active
													? selected.filter((value) => value !== id)
													: [...selected, id]
											)}
									>
										<HighlightedText snippet={filter}>
											{name(id)}
										</HighlightedText>
									</Pill>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};
