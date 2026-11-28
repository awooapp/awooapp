import { MoveLeft } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import type { Session } from "~/api/auth";
import { Preferences } from "~/api/user/preferences";
import { Profile, ProfileDomsubList } from "~/api/user/profile";
import { KinkSelect } from "~/app/[locale]/(app)/(authenticated)/settings/(profile)/nsfw/form";
import { ButtonLink } from "~/components/button";
import { Form } from "~/components/forms";
import { FormButton } from "~/components/forms/button";
import { InputLabel, InputRadioList, InputSwitch } from "~/components/inputs";
import { InputPrivacySelect } from "~/components/inputs/specialized";
import { useOptionalSession } from "~/hooks/use-session";
import { useNavigate } from "~/i18n";
import { mutate, sessionKey } from "~/query";

import { continueOnboardingUrl, isLastOnboardingStep, previousOnboardingStepUrl } from "../navigation";

export const OnboardingKinksForm: FC = () => {
	const session = useOptionalSession();
	const navigate = useNavigate();
	const { t } = useTranslation();

	if (!session) return null;
	const { user } = session;

	return (
		<Form
			fields={{
				nsfw: user.preferences?.nsfw ?? false,
				domsub: user.profile.domsub,
				kinks: user.profile.kinks ?? [],
				kinksPrivacy: user.preferences?.privacy.kinks ?? "everyone"
			}}
			className="flex flex-col gap-8"
			requireChange={false}
			onSubmit={async ({ domsub, kinks, kinksPrivacy, nsfw }) => {
				const [newProfile, newPreferences, newPrivacy] = await Promise.all([
					Profile.update(user.id, {
						domsub: domsub ?? null,
						kinkId: kinks
					}),
					Preferences.update(user.id, { nsfw }),
					Preferences.updatePrivacy(user.id, {
						kinks: kinksPrivacy
					})
				]);

				await mutate<Session>(sessionKey(), (session) => ({
					...session,
					user: {
						...session.user,
						profile: newProfile,
						preferences: {
							...newPreferences,
							privacy: newPrivacy
						}
					}
				}));

				await navigate(await continueOnboardingUrl("kinks", user));
			}}
		>
			{({ FormField, fields }) => (
				<>
					<FormField name="nsfw">
						{(field) => (
							<>
								<InputLabel
									{...field.labelProps}
									inline
									hint={t("show_nsfw_hint")}
								>
									{t("show_nsfw")}
								</InputLabel>
								<InputSwitch {...field.props} />
							</>
						)}
					</FormField>
					{fields.nsfw.props.value && (
						<>
							<FormField name="domsub">
								{(field) => (
									<>
										<InputLabel {...field.labelProps}>{t("i_am")}</InputLabel>
										<InputRadioList
											{...field.props}
											items={ProfileDomsubList.map((value) => ({
												key: value,
												label: t(value)
											}))}
										/>
									</>
								)}
							</FormField>
							<FormField name="kinks">
								{(field) => <KinkSelect {...field.props} />}
							</FormField>
							<FormField name="kinksPrivacy">
								{(field) => (
									<>
										<InputLabel inline hint={t("nsfw_privacy_hint")}>
											{t("nsfw_privacy")}
										</InputLabel>
										<InputPrivacySelect {...field.props} />
									</>
								)}
							</FormField>
						</>
					)}
					<div className="flex justify-end gap-2">
						<ButtonLink
							className="flex w-fit flex-row gap-2 opacity-75"
							href={previousOnboardingStepUrl("kinks")!}
							kind="tertiary"
							size="sm"
						>
							<MoveLeft className="size-5" />
							<span>{t("back")}</span>
						</ButtonLink>
						<FormButton className="min-w-36" size="sm">
							{isLastOnboardingStep("kinks") ? t("finish") : undefined}
						</FormButton>
					</div>
				</>
			)}
		</Form>
	);
};
