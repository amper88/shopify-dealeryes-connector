import { Form, useLoaderData } from "react-router";
import { login } from "../shopify.server";

export const loader = async ({ request }) => {
  return login(request);
};

export const action = async ({ request }) => {
  return login(request);
};

export default function Auth() {
  const { errors = {} } = useLoaderData() || {};

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>DealerYes Connector</h2>
      <Form method="post">
        <label>
          Shop domain
          <input
            type="text"
            name="shop"
            placeholder="my-store.myshopify.com"
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>
        {errors.shop && <p style={{ color: "red" }}>{errors.shop}</p>}
        <button type="submit" style={{ marginTop: 12, padding: "8px 16px" }}>
          Connect
        </button>
      </Form>
    </div>
  );
}
