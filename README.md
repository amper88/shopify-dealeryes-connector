# Shopify DealerYes Connector

Node.js app (React Router v7 + Shopify SDK) deployed on Render. Bridges a Shopify B2B store with a DealerYes instance bidirectionally via webhooks.

## Entity mapping

| Shopify | DealerYes |
|---|---|
| Company | Distributor |
| Company Location | Dealer |
| Company Contact | Member |
| Product | Product |
| Collection | Category |

## Architecture

```
Shopify ──webhooks──► Connector (Render) ──POST──► DealerYes (PHP)
Shopify ◄──Admin API── DealerYes
```

- Connector handles Shopify OAuth and forwards webhooks to DealerYes
- DealerYes stores the access token and makes outbound Shopify API calls
- Auth between connector and DealerYes: shared secret (`DEALERYES_WEBHOOK_SECRET`) via `Authorization: Bearer`

## Environment variables

### Shopify (fixed — same across environments)
| Variable | Description |
|---|---|
| `SHOPIFY_API_KEY` | Client ID from Partner Dashboard |
| `SHOPIFY_API_SECRET` | Client secret from Partner Dashboard |
| `SCOPES` | Comma-separated Shopify scopes |

### Connector URL (changes per Render service)
| Variable | Description |
|---|---|
| `SHOPIFY_APP_URL` | Public URL of this Render service |
| `DATABASE_URL` | SQLite path — `file:/opt/render/project/src/prisma/dev.sqlite` |

### DealerYes target (changes per DealerYes instance)
| Variable | Description |
|---|---|
| `DEALERYES_URL` | Base URL of the DealerYes instance |
| `DEALERYES_WEBHOOK_URL` | `{DEALERYES_URL}/webhook/shopify` |
| `DEALERYES_INSTALL_URL` | `{DEALERYES_URL}/webhook/shopifyinstall` |
| `DEALERYES_WEBHOOK_SECRET` | Shared secret — must match `webhook_shared_secret` in DealerYes `conf/shopify.ini` |

## Changing the DealerYes target

To point the connector to a different DealerYes instance (e.g. production):

1. Update `DEALERYES_URL`, `DEALERYES_WEBHOOK_URL`, `DEALERYES_INSTALL_URL`, `DEALERYES_WEBHOOK_SECRET` in Render → Environment
2. Render redeploys automatically — no code changes needed

## Deploying to a new Render service

1. Create a new Web Service in Render pointing to this repo
2. Set all env vars (see above), with the new service's URL as `SHOPIFY_APP_URL`
3. Update `shopify.app.toml` → `application_url` and `redirect_urls` to the new URL
4. Run `shopify app deploy` to update the Partner Dashboard

> Note: `shopify app deploy` updates the Partner Dashboard globally — all stores using this app will be affected.

## Deploying for a new Shopify organization (new Partner account)

Each Shopify Partner organization requires its own app registration. Steps:

1. Create a new app in the new Partner Dashboard → get new `client_id` and `client_secret`
2. Update `shopify.app.toml` → `client_id`
3. Update Render env vars: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, and `DEALERYES_*` for the target instance
4. Update `SHOPIFY_APP_URL` if using a new Render service
5. Run `shopify app deploy` (logged in to the new Partner account) to register webhooks and URLs
6. Complete the protected customer data request in the new Partner Dashboard (API access requests → Protected customer data → Select data use)
7. Set up distribution → Custom → Generate install link for the target store

## Installing on a new store

1. Partner Dashboard → dealeryes-connector → Distribution → Generate link → enter store domain
2. Share the generated link with the merchant
3. After install, DealerYes receives the access token automatically via `notifyInstall()`

## DealerYes configuration

In the DealerYes instance, set `conf/shopify.ini`:

```ini
[shopify]
client_id             = "d4b7e901b40c2eb0319717dd826e0da4"
client_secret         = "..."
api_version           = "2025-01"
webhook_shared_secret = "..."   ; must match DEALERYES_WEBHOOK_SECRET
```

Run schema seeds after first setup:
```bash
docker compose exec app php scripts/clitool.php --build
```
