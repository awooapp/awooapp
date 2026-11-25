// Not "~/": routes.ts loads this where the alias doesn't resolve.
import { connectionProvider, personality } from "../../../../../features";

// Disabled steps drop out and the rest renumber; their directories keep their numbers.
const allSteps = [
	"about",
	"preferences",
	"bio",
	"details",
	"interests",
	"personality",
	"connections"
] as const;

export type OnboardingStep = typeof allSteps[number];

const enabled: Partial<Record<OnboardingStep, boolean>> = {
	personality,
	connections: ["discord", "vrchat", "meta"].some(connectionProvider)
};

export const onboardingSteps: ReadonlyArray<OnboardingStep> = allSteps
	.filter((step) => enabled[step] ?? true);

export const onboardingStepDirectory: Record<OnboardingStep, string> = {
	about: "1",
	preferences: "2",
	bio: "3",
	details: "4",
	interests: "5",
	personality: "6",
	connections: "7"
};

// 1-based, matching the /onboarding/:n URLs.
export function onboardingStepNumber(step: OnboardingStep) {
	const index = onboardingSteps.indexOf(step);
	if (index === -1) throw new Error(`Disabled onboarding step: ${step}`);

	return index + 1;
}
