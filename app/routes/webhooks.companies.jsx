import { authenticate } from "../shopify.server";
import { forwardWebhook } from "../dealeryes.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // topic values: COMPANIES_CREATE | COMPANIES_UPDATE | COMPANIES_DELETE
  await forwardWebhook(topic, shop, payload);

  return new Response("OK", { status: 200 });
};
