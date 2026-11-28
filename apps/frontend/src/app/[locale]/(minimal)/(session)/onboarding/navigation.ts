import type { Session } from "~/api/auth";
import type { User } from "~/api/user";
import { invalidate, queryClient, sessionKey } from "~/query";
import { urls } from "~/urls";

import { onboardingStepNumber, onboardingSteps } from "./steps";
import type { OnboardingStep } from "./steps";

function adjacentOnboardingStep(step: OnboardingStep, offset: -1 | 1) {
	return onboardingSteps[onboardingStepNumber(step) - 1 + offset] ?? null;
}

export function onboardingStepUrl(step: OnboardingStep) {
	return urls.onboarding(onboardingStepNumber(step));
}

export function nextOnboardingStepUrl(step: OnboardingStep) {
	const next = adjacentOnboardingStep(step, 1);
	return next ? onboardingStepUrl(next) : null;
}

export function isLastOnboardingStep(step: OnboardingStep) {
	return adjacentOnboardingStep(step, 1) === null;
}

export async function continueOnboardingUrl(step: OnboardingStep, user: User) {
	const next = nextOnboardingStepUrl(step);
	if (next) return next;

	await invalidate({ queryKey: sessionKey() });
	const session = queryClient.getQueryData<Session>(sessionKey());
	return postOnboardingUrl(session?.user ?? user);
}

export function previousOnboardingStepUrl(step: OnboardingStep) {
	const previous = adjacentOnboardingStep(step, -1);
	return previous ? onboardingStepUrl(previous) : null;
}

function incompleteOnboardingStep({ bornAt, profile }: User): OnboardingStep {
	const { preferences } = profile;

	if (!bornAt || !profile.genders?.length) return "about";
	if (!preferences?.genders?.length) return "preferences";
	if (
		!profile.displayName
		|| (profile.biography?.length ?? 0) < 48
		|| profile.images.length === 0
	)
		return "bio";
	if (!profile.interests?.length && profile.customInterests.length === 0)
		return "interests";

	return "about";
}

export function resumeOnboardingUrl(user: User) {
	return onboardingStepUrl(incompleteOnboardingStep(user));
}

export function postOnboardingUrl(user: User) {
	if (user.status === "registered") return resumeOnboardingUrl(user);
	return user.emailConfirmedAt ? urls.discover("dates") : urls.confirmEmail();
}
