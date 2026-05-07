import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate, sessionStorage } from "../shopify.server";
import { notifyInstall } from "../dealeryes.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // On first load after install, forward access token to DealerYes.
  // The offline session holds the permanent token we want DealerYes to use.
  const offlineSessionId = `offline_${session.shop}`;
  const offlineSession   = await sessionStorage.loadSession(offlineSessionId);

  if (offlineSession?.accessToken) {
    // Fire-and-forget — don't block the page load. Errors are logged server-side.
    notifyInstall(
      session.shop,
      offlineSession.accessToken,
      offlineSession.scope || "",
      "2025-01"
    ).catch((err) => console.error("notifyInstall error:", err));
  }

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">DealerYes Connector</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
