/**
 * DealerYes API client used by webhook handlers to forward Shopify events
 * and to notify DealerYes on app install / uninstall.
 *
 * All calls are server-to-server over HTTPS.
 * Authentication: shared secret in Authorization: Bearer header.
 */

const DEALERYES_WEBHOOK_URL  = process.env.DEALERYES_WEBHOOK_URL  || "";
const DEALERYES_INSTALL_URL  = process.env.DEALERYES_INSTALL_URL  || "";
const DEALERYES_WEBHOOK_SECRET = process.env.DEALERYES_WEBHOOK_SECRET || "";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DEALERYES_WEBHOOK_SECRET}`,
  };
}

/**
 * Forward a Shopify webhook payload to DealerYes.
 *
 * @param {string} topic   - Shopify topic, e.g. "PRODUCTS_CREATE"
 * @param {string} shop    - Shop domain, e.g. "mystore.myshopify.com"
 * @param {object} payload - Parsed webhook payload
 */
export async function forwardWebhook(topic, shop, payload) {
  if (!DEALERYES_WEBHOOK_URL) {
    console.warn("DEALERYES_WEBHOOK_URL not set — skipping forward");
    return;
  }

  const body = JSON.stringify({ topic, shop, payload });

  const res = await fetch(DEALERYES_WEBHOOK_URL, {
    method: "POST",
    headers: authHeaders(),
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`DealerYes webhook forward failed: HTTP ${res.status}`, text);
  } else {
    console.log(`DealerYes webhook forward OK: ${topic}`);
  }
}

/**
 * Notify DealerYes that the app was installed on a store.
 * Sends the Shopify access token so DealerYes can make outbound Admin API calls.
 *
 * @param {string} shop        - Shop domain
 * @param {string} accessToken - Shopify offline access token (shpat_xxx)
 * @param {string} scopes      - Granted scopes string
 * @param {string} apiVersion  - API version used
 */
export async function notifyInstall(shop, accessToken, scopes, apiVersion) {
  if (!DEALERYES_INSTALL_URL) {
    console.warn("DEALERYES_INSTALL_URL not set — skipping install notify");
    return;
  }

  const body = JSON.stringify({ shop, access_token: accessToken, scopes, api_version: apiVersion });

  const res = await fetch(DEALERYES_INSTALL_URL, {
    method: "POST",
    headers: authHeaders(),
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`DealerYes install notify failed: HTTP ${res.status}`, text);
  } else {
    const json = await res.json().catch(() => ({}));
    console.log("DealerYes install notified OK", json);
  }
}

/**
 * Notify DealerYes that the app was uninstalled from a store.
 */
export async function notifyUninstall(shop) {
  const uninstallUrl = (process.env.DEALERYES_URL || "").replace(/\/$/, "") + "/webhook/shopifyuninstall";

  const res = await fetch(uninstallUrl, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ shop }),
  });

  if (!res.ok) {
    console.error(`DealerYes uninstall notify failed: HTTP ${res.status}`);
  }
}
