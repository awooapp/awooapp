import {
	Brain,
	Dices,
	Gamepad2,
	HeartHandshake,
	MoonStar,
	Music,
	Pencil,
	Search,
	Star,
	Tags,
	Trophy,
	User
} from "lucide-react";
import type { Dispatch, FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";

import type { Session } from "~/api/auth";
import { Profile } from "~/api/user/profile";
import { Form } from "~/components/forms";
import { FormButton } from "~/components/forms/button";
import {
	InputAutocomplete,
	InputLabel,
	InputLabelHint,
	InputText
} from "~/components/inputs";
import { InputAttributeCategorySelect } from "~/components/inputs/specialized";
import { customInterests as customInterestsEnabled } from "~/features";
import { useDevice } from "~/hooks/use-device";
import { useSession } from "~/hooks/use-session";
import { useToast } from "~/hooks/use-toast";
import { mutate, sessionKey } from "~/query";

const categoryIcons: Record<string, React.ReactNode> = {
	popular: <Star />,
	general: <Tags />,
	identity: <User />,
	games: <Gamepad2 />,
	music: <Music />,
	sports: <Trophy />,
	love_languages: <HeartHandshake />,
	astrology: <MoonStar />,
	personality_types: <Brain />,
	alignment: <Dices />,
	game_genres: <Star />
};

export const InterestSelectList: FC<{
	filter: string;
	selected: Array<string>;
	onSelected: Dispatch<Array<string>>;
	maximum: number;
}> = (props) => (
	<InputAttributeCategorySelect
		{...props}
		categoryIcons={categoryIcons}
		type="interest"
	/>
);

export const InterestSelectCustomInput: FC<{
	value: Array<string>;
	onChange: Dispatch<Array<string>>;
}> = ({ value, onChange }) => {
	const { apple } = useDevice();
	const { t } = useTranslation();

	return (
		<>
			<InputLabel
				className="flex flex-row items-center gap-2"
				hint={t("optional")}
			>
				<Pencil />
				{" "}
				{t("custom_interests")}
			</InputLabel>
			<InputLabelHint className="-mt-2">
				<Trans
					components={{ small: <small /> }}
					i18nKey={apple ? "custom_interests_hint_apple" : "custom_interests_hint"}
				/>
			</InputLabelHint>
			<InputAutocomplete
				supportArbitrary
				options={value.map((interest) => ({
					key: interest,
					label: interest
				}))}
				dropdown={false}
				limit={10}
				placeholder={t("type_your_custom_interests")}
				value={value}
				onChange={(value) =>
					onChange(
						value
							.map((interest) => interest.trim())
							.filter(
								(v, index, a) =>
									a.findIndex((t) => t.toLowerCase() === v.toLowerCase())
									=== index
							)
					)}
			/>
		</>
	);
};

export const InterestSelectCount: FC<{ current: number; maximum: number; className?: string }> = ({
	current,
	maximum,
	className
}) => {
	if (current === 0) return null;

	return (
		<div
			style={{
				backgroundImage: `conic-gradient(var(--theme-1) ${(current / maximum) * 360
				}deg, transparent 0deg)`
			}}
			className={twMerge("pointer-events-none fixed right-4 bottom-[max(calc(var(--safe-area-inset-bottom,0rem)+4.5rem),5.5rem)] flex size-14 items-center justify-center rounded-full vision:bottom-4 native-nav:bottom-[max(calc(var(--safe-area-inset-bottom,0rem)+0.5rem),1rem)] desktop:bottom-4", className)}
		>
			<div className="flex size-12 flex-col items-center justify-center rounded-full bg-white-20 text-sm font-extrabold text-theme-1 dark:bg-black-70">
				{current}
				/
				{maximum}
			</div>
		</div>
	);
};

export const maximumInterests = 10;

export const InterestsForm: FC = () => {
	const session = useSession();
	const toasts = useToast();
	const { t } = useTranslation();

	const { user } = session;
	const { profile } = user;

	return (
		<Form
			fields={{
				filter: "",
				defaultInterests: profile.interests || [],
				customInterests: customInterestsEnabled ? profile.customInterests : []
			}}
			className="flex flex-col gap-8"
			onSubmit={async ({ defaultInterests, customInterests }) => {
				const profile = await Profile.update(user.id, {
					customInterests,
					interestId: defaultInterests
				});

				await mutate<Session>(sessionKey(), (session) => ({
					...session,
					user: {
						...session.user,
						profile
					}
				}));
				toasts.add(t("saved_interests"));
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
						<FormButton>{t("update")}</FormButton>
						<InterestSelectCount
							current={totalInterests}
							maximum={maximumInterests}
						/>
					</>
				);
			}}
		</Form>
	);
};
