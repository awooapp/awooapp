import { MoveLeft, Search } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

import { Profile } from "~/api/user/profile";
import {
	InterestSelectCount,
	InterestSelectCustomInput,
	InterestSelectList,
	maximumInterests
} from "~/app/[locale]/(app)/(authenticated)/settings/(profile)/interests/form";
import { ButtonLink } from "~/components/button";
import { Form } from "~/components/forms";
import { FormButton } from "~/components/forms/button";
import { InputLabel, InputText } from "~/components/inputs";
import { customInterests as customInterestsEnabled } from "~/features";
import { useOptionalSession } from "~/hooks/use-session";
import { useToast } from "~/hooks/use-toast";
import { useNavigate } from "~/i18n";

import { continueOnboardingUrl, isLastOnboardingStep, previousOnboardingStepUrl } from "../navigation";

export const Onboarding5Form: FC = () => {
	const session = useOptionalSession();
	const toasts = useToast();
	const navigate = useNavigate();
	const { t } = useTranslation();

	if (!session) return null;
	const { user } = session;
	const { profile } = user;

	return (
		<Form
			fields={{
				filter: "",
				defaultInterests: profile.attributes.interest || [],
				customInterests: customInterestsEnabled ? profile.customInterests : []
			}}
			className="flex flex-col gap-8"
			requireChange={false}
			onSubmit={async ({ defaultInterests, customInterests }) => {
				if (defaultInterests.length + customInterests.length === 0)
					throw new Error(`${t("interests")}: ${t("errors.cant_be_blank")}`);

				await Profile.update(user.id, {
					customInterests,
					interestId: defaultInterests
				})
					.then(async () => navigate(await continueOnboardingUrl("interests", user)))
					.catch(toasts.addError);
			}}
		>
			{({
				FormField,
				fields: {
					filter: {
						props: { value: filter }
					},
					defaultInterests,
					customInterests
				}
			}) => {
				const totalInterests
					= defaultInterests.props.value.length
						+ customInterests.props.value.length;

				return (
					<>
						<InputLabel>
							<span>
								{t("interests_hint")}
								{customInterestsEnabled && (
									<span className="sentence-space">
										{t("interests_hint_custom_interests")}
									</span>
								)}
							</span>
						</InputLabel>
						<FormField name="filter">
							{(field) => (
								<InputText
									{...field.props}
									Icon={Search}
									placeholder={t("search_interests")}
								/>
							)}
						</FormField>
						<FormField name="defaultInterests">
							{({ props: { value, onChange } }) => (
								<InterestSelectList
									maximum={
										maximumInterests - customInterests.props.value.length
									}
									filter={filter}
									selected={value}
									onSelected={(newValues) => {
										if (
											totalInterests >= maximumInterests
											&& newValues.length >= value.length
										)
											return toasts.add({
												type: "warning",
												value: t("interests_limit_reached")
											});

										onChange(newValues);
									}}
								/>
							)}
						</FormField>
						{customInterestsEnabled && (
							<FormField name="customInterests">
								{({ props: { value, onChange } }) => (
									<InterestSelectCustomInput
										value={value}
										onChange={(newValues) => {
											if (
												totalInterests >= maximumInterests
												&& newValues.length >= value.length
											)
												return toasts.add({
													type: "warning",
													value: t("interests_limit_reached")
												});

											onChange(newValues);
										}}
									/>
								)}
							</FormField>
						)}
						<div className="flex justify-end gap-2">
							<ButtonLink
								className="flex w-fit flex-row gap-2 opacity-75"
								href={previousOnboardingStepUrl("interests")!}
								kind="tertiary"
								size="sm"
							>
								<MoveLeft className="size-5" />
								<span>{t("back")}</span>
							</ButtonLink>
							<FormButton className="min-w-36" size="sm">
								{isLastOnboardingStep("interests") ? t("finish") : undefined}
							</FormButton>
						</div>
						<InterestSelectCount
							className="bottom-[max(calc(var(--safe-area-inset-bottom,0rem)+1rem),1rem)] native-nav:bottom-[max(calc(var(--safe-area-inset-bottom,0rem)+1rem),1rem)]"
							current={totalInterests}
							maximum={maximumInterests}
						/>
					</>
				);
			}}
		</Form>
	);
};
