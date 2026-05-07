import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>DealerYes Connector</h1>
      <p>
        This app syncs your Shopify B2B store with DealerYes bidirectionally:
      </p>
      <ul>
        <li>
          <strong>Company</strong> ↔ Distributor
        </li>
        <li>
          <strong>Company Location</strong> ↔ Dealer
        </li>
        <li>
          <strong>Company Contact</strong> ↔ Member
        </li>
        <li>
          <strong>Product</strong> ↔ Product
        </li>
        <li>
          <strong>Collection</strong> ↔ Category
        </li>
      </ul>
      <p>
        Webhooks are registered automatically. Configure the shared secret in
        DealerYes under <strong>Settings → Shopify Integration</strong>.
      </p>
    </div>
  );
}
