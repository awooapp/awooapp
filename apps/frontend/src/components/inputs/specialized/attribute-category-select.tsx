import { useSuspenseQueries } from "@tanstack/react-query";
import type { Dispatch, FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import { interestCategoriesOptions, interestsOptions, kinkCategoriesOptions, kinksOptions } from "~/api/data";
import { InputLabel } from "~/components/inputs";
import { Pill } from "~/components/profile/pill/pill";
import { useLocale } from "~/i18n";

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

const options = {
	interest: [interestsOptions, interestCategoriesOptions],
	kink: [kinksOptions, kinkCategoriesOptions]
} as const;

const noIcons: Record<string, ReactNode> = {};

export type CategorizedAttributeType = keyof typeof options;

// Pills grouped under their category's heading, in the data's order.
export const InputAttributeCategorySelect: FC<{
	type: CategorizedAttributeType;
	filter?: string;
	selected: Array<string>;
	onSelected: Dispatch<Array<string>>;
	maximum: number;
	categoryIcons?: Record<string, ReactNode>;
}> = ({ type, filter = "", selected, onSelected, maximum, categoryIcons = noIcons }) => {
	const [locale] = useLocale();
	const [entriesOptions, categoriesOptions] = options[type];
	const [{ data: entries }, { data: categories }] = useSuspenseQueries({
		queries: [entriesOptions({ locale }), categoriesOptions({ locale })]
	});

	return (
		<div className="flex flex-col gap-8">
			{categories.map((category) => {
				const search = filter.toLowerCase();
				const filtered = entries
					.filter((entry) => entry.category === category.id)
					.filter((entry) => !search
						|| entry.name.toLowerCase().includes(search)
						|| ("synonyms" in entry
							&& !!entry.synonyms?.some((synonym) => synonym.toLowerCase().includes(search))));

				if (filtered.length === 0) return null;
				const categoryIcon = categoryIcons[category.id];

				return (
					<div key={category.id} className="flex flex-col gap-4">
						<InputLabel className="flex flex-row items-center gap-2">
							{categoryIcon}
							{categoryIcon && " "}
							{category.name}
						</InputLabel>
						<div className="flex flex-wrap gap-2">
							{filtered.map(({ id, name }) => {
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
											{name}
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
