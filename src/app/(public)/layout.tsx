import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getSessionUser } from "@/features/authentication/queries";

export default async function PublicLayout({
  children,
}: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1 pb-24 md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <MobileTabBar isAuthenticated={Boolean(user)} />
    </div>
  );
}
