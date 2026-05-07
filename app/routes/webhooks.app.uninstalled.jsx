import { authenticate } from "../shopify.server";
import db from "../db.server";
import { notifyUninstall } from "../dealeryes.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Notify DealerYes so it deactivates the connection
  await notifyUninstall(shop).catch((err) =>
    console.error("notifyUninstall error:", err)
  );

  // Remove local sessions
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response("OK", { status: 200 });
};
