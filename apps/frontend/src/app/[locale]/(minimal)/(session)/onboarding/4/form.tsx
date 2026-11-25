import { MoveLeft } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import {
	Profile,
	ProfileMonopolyList,
	ProfileRelationshipList
} from "~/api/user/profile";
import { ButtonLink } from "~/components/button";
import { Form } from "~/components/forms";
import { FormButton } from "~/components/forms/button";
import { InputAutocomplete, InputLabel } from "~/components/inputs";
import { InputCheckboxList } from "~/components/inputs/checkbox-list";
import { InputLanguageAutocomplete } from "~/components/inputs/specialized";
import type { AttributeTranslation } from "~/hooks/use-attribute";
import { useAttributes, useAttributeTranslation } from "~/hooks/use-attribute";
import { useOptionalSession } from "~/hooks/use-session";
import { useNavigate } from "~/i18n";
import { mutate, sessionKey } from "~/query";

import { nextOnboardingStepUrl, previousOnboardingStepUrl } from "../navigation";

export const Onboarding4Form: FC = () => {
	const sexualities = useAttributes("sexuality");
	const fursonas = useAttributes("fursona");

	const session = useOptionalSession();
	const { t } = useTranslation();
	const tAttribute = useAttributeTranslation();

	const navigate = useNavigate();

	if (!session) return null;
	const { user } = session;
	const { profile } = user;

	return (
		<Form
			fields={{
				relationships: profile.relationships ?? [],
				monopoly: profile.monopoly ?? [],
				languages: user.profile.languages ?? [],
				sexualityId: user.profile.attributes.sexuality || [],
				fursonaId: user.profile.attributes.fursona || []
			}}
			className="flex flex-col gap-8"
			requireChange={false}
			onSubmit={async ({ ...values }) => {
				const newProfile = await Profile.update(user.id, {
					...values,
					relationships: values.relationships ?? [],
					monopoly: values.monopoly ?? [],
					languages: values.languages
				});

				await mutate(sessionKey(), {
					...session,
					user: {
						...user,
						profile: newProfile
					}
				});

				navigate(nextOnboardingStepUrl("details")!);
			}}
		>
			{({ FormField }) => (
				<>
					<FormField name="relationships">
						{(field) => (
							<>
								<InputLabel>{t("im_open_to")}</InputLabel>
								<InputCheckboxList
									{...field.props}
									items={ProfileRelationshipList.map((item) => ({
										key: item,
										label: t(({
											serious: "serious_dating_hint",
											vr: "casual_dating_hint",
											hookups: "hookups_hint",
											friends: "new_friends"
										} as const)[item])
									}))}
								/>
							</>
						)}
					</FormField>
					<FormField name="sexualityId">
						{(field) => (
							<>
								<InputLabel>{t("sexuality")}</InputLabel>
								<InputAutocomplete
									{...field.props}
									options={sexualities.map((sexuality) => {
										const { id, definitionLink } = typeof sexuality === "string" ? { id: sexuality } : sexuality;

										const { name, definition }
											= (tAttribute[
												id
											] as AttributeTranslation<"sexuality">) ?? {};

										return {
											key: id,
											label: name ?? id,
											definition,
											definitionLink
										};
									})}
									limit={3}
									placeholder={t("select_your_sexualities")}
								/>
							</>
						)}
					</FormField>
					<FormField name="fursonaId">
						{(field) => (
							<>
								<InputLabel>{t("main_fursona_species")}</InputLabel>
								<InputAutocomplete
									{...field.props}
									options={fursonas.map((id) => ({
										key: id,
										label: tAttribute[id]?.name ?? id
									}))}
									limit={3}
									placeholder={t("select_your_fursona_species")}
									value={field.props.value || []}
								/>
							</>
						)}
					</FormField>
					<FormField name="monopoly">
						{(field) => (
							<>
								<InputLabel>{t("relationship_type")}</InputLabel>
								<InputCheckboxList
									{...field.props}
									items={ProfileMonopolyList.map((value) => ({
										key: value,
										label: t(value)
									}))}
								/>
							</>
						)}
					</FormField>
					<FormField name="languages">
						{(field) => (
							<>
								<InputLabel>{t("language")}</InputLabel>
								<InputLanguageAutocomplete limit={5} {...field.props} />
							</>
						)}
					</FormField>
					<div className="flex justify-end gap-2">
						<ButtonLink
							className="flex w-fit flex-row gap-2 opacity-75"
							href={previousOnboardingStepUrl("details")!}
							kind="tertiary"
							size="sm"
						>
							<MoveLeft className="size-5" />
							<span>{t("back")}</span>
						</ButtonLink>
						<FormButton className="min-w-36" size="sm" />
					</div>
				</>
			)}
		</Form>
	);
};
