import { Outlet } from "react-router";

import { resumeOnboardingUrl } from "~/app/[locale]/(minimal)/(session)/onboarding/navigation";
import { NewsDialog } from "~/components/modals/news";
import { news } from "~/features";
import { useSession } from "~/hooks/use-session";
import { throwRedirect } from "~/redirect";
import { urls } from "~/urls";

export default function OnboardedLayout() {
	const { user } = useSession();

	if (user.status === "registered")
		return throwRedirect(resumeOnboardingUrl(user));
	if (user.deactivatedAt)
		return throwRedirect(urls.settings.deactivateAccount);

	return (
		<>
			<Outlet />
			{news && <NewsDialog />}
		</>
	);
}
