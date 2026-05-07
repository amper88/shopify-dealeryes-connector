import { authenticate } from "../shopify.server";
import { forwardWebhook } from "../dealeryes.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // topic values: COMPANY_LOCATIONS_CREATE | COMPANY_LOCATIONS_UPDATE | COMPANY_LOCATIONS_DELETE
  await forwardWebhook(topic, shop, payload);

  return new Response("OK", { status: 200 });
};
