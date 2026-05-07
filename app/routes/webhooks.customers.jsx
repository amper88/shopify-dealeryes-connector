import { authenticate } from "../shopify.server";
import { forwardWebhook } from "../dealeryes.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // topic values: CUSTOMERS_CREATE | CUSTOMERS_UPDATE | CUSTOMERS_DELETE
  // In Shopify B2B, company contacts are attached to customers.
  await forwardWebhook(topic, shop, payload);

  return new Response("OK", { status: 200 });
};
