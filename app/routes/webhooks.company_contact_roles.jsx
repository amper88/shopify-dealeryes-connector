import { authenticate } from "../shopify.server";
import { forwardWebhook } from "../dealeryes.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // topic values: COMPANY_CONTACT_ROLES_ASSIGN | COMPANY_CONTACT_ROLES_REVOKE
  await forwardWebhook(topic, shop, payload);

  return new Response("OK", { status: 200 });
};
