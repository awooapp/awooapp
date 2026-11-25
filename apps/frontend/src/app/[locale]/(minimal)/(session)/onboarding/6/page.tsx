import { useTranslation } from "react-i18next";
import type { MetaFunction } from "react-router";
import invariant from "tiny-invariant";

import { ModelCard } from "~/components/model-card";
import { i18n } from "~/i18n";
import { isLocale } from "~/i18n/languages";
import { metaMerge, rootMeta } from "~/meta";

import { Onboarding6Form } from "./form";

// Not Route.MetaFunction: ./+types/page isn't generated while personality is off.
export const meta: MetaFunction = (options) => {
	const { locale } = options.params;
	invariant(locale && isLocale(locale));
	const t = i18n.getFixedT(locale);

	return metaMerge([...rootMeta(options), { title: t("page_title", { name: t("personality") }) }]);
};

export default function Onboarding6Page() {
	const { t } = useTranslation();

	return (
		<ModelCard
			branded
			miniFooter
			className="shrink-0 desktop:max-w-2xl"
			title={t("personality")}
		>
			<Onboarding6Form />
		</ModelCard>
	);
}
