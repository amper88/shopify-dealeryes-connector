# shopify-dealeryes-connector

Shopify App (Node.js + Remix) that acts as the bidirectional sync bridge between a Shopify B2B store and a DealerYes instance.

## What this app does

- Installs on a Shopify store via OAuth (handled by `@shopify/shopify-app-react-router`)
- Registers webhooks automatically on install
- Receives Shopify webhook events and forwards them to DealerYes
- Notifies DealerYes with the Shopify access token on install so DealerYes can make outbound Admin GraphQL API calls

## Entity mapping

| Shopify B2B | DealerYes |
|-------------|-----------|
| Company | Distributor |
| CompanyLocation | Dealer |
| CompanyContact (location admin) | Member level=85 (DEALER) |
| CompanyContact (ordering only) | Member level=100 (MEMBER) |
| Product (vendor = brand, productType = category) | Product |
| Collection | Category |
| Catalog + PriceList | Pricebook + Pricerule |

## Architecture

```
Shopify Store
  │ webhook events (HMAC-verified by SDK)
  ▼
shopify-dealeryes-connector (this app — Node.js on Render)
  │ forwards via HTTP POST + shared secret
  ▼
DealerYes (PHP + FlightPHP — dealeryes repo)
  │ processes inbound, also pushes outbound
  ▼
Shopify Admin GraphQL API
```

## Stack

- Node.js 20+, Remix via React Router v7
- `@shopify/shopify-app-react-router` for OAuth + webhook auth
- Prisma ORM + SQLite (file-based, sessions only)
- Deployed on Render (free tier) — kept alive via UptimeRobot

## Key files

```
app/shopify.server.js      — Shopify SDK config (OAuth, session storage)
app/dealeryes.server.js    — HTTP client that calls DealerYes endpoints
app/db.server.js           — Prisma client singleton
app/routes/app.jsx         — App layout; triggers notifyInstall post-OAuth
app/routes/webhooks.*.jsx  — One file per entity type (companies, locations, products, collections, customers)
prisma/schema.prisma        — SQLite schema (Session model only)
shopify.app.toml            — App config + webhook subscriptions
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `SHOPIFY_API_KEY` | Partner Dashboard → App → Client ID |
| `SHOPIFY_API_SECRET` | Partner Dashboard → App → Secret |
| `SHOPIFY_APP_URL` | Public URL of this app (Render URL) |
| `SCOPES` | Comma-separated Shopify API scopes |
| `DEALERYES_URL` | Base URL of the DealerYes instance |
| `DEALERYES_WEBHOOK_URL` | `{DEALERYES_URL}/webhook/shopify` |
| `DEALERYES_INSTALL_URL` | `{DEALERYES_URL}/webhook/shopifyinstall` |
| `DEALERYES_WEBHOOK_SECRET` | Shared secret — must match `webhook_shared_secret` in DealerYes `conf/shopify.ini` |

## DealerYes endpoints this app calls

| Endpoint | When |
|----------|------|
| `POST /webhook/shopifyinstall` | Once after OAuth — sends shop + access token |
| `POST /webhook/shopify` | On every forwarded webhook event |
| `POST /webhook/shopifyuninstall` | When merchant uninstalls the app |

All calls use `Authorization: Bearer {DEALERYES_WEBHOOK_SECRET}`.

## DealerYes repo

The PHP side lives at: `github.com/mfrederico/dealeryes` (private)

DealerYes-side Shopify files:
- `services/Schema/Seeds/35_ShopifyConnection.php` — shopifyconnection table
- `services/Schema/Seeds/36_ShopifySyncMap.php` — shopifysyncmap table (GID ↔ local ID mapping)
- `services/Shopify/ShopifyGraphQLClient.php` — outbound GraphQL client
- `services/Shopify/ShopifySyncService.php` — bidirectional sync logic per entity
- `controls/Web/Webhook.php` — inbound webhook receivers
- `controls/Web/Settings.php` — Shopify settings page + disconnect
- `views/settings/shopify.php` — UI showing connection status + URLs for this app's .env
- `conf/shopify.ini.example` — template for Shopify credentials on the DealerYes server

## Local development

DealerYes runs in Docker locally. To receive webhooks from this app during dev, expose DealerYes with ngrok:

```bash
ngrok http 80
# Copy the https URL → use as DEALERYES_URL in .env
```

Run this app locally with:
```bash
npm install
npm run setup       # prisma generate + migrate
shopify app dev     # tunnels via Cloudflare, opens browser
```

## Deploy to Render

1. Connect `amper88/shopify-dealeryes-connector` repo in Render
2. Build command: `npm install && npm run setup`
3. Start command: `npm run start`
4. Set all env vars from `.env.example`
5. Add UptimeRobot ping to keep the free tier alive

## Code conventions

- All comments and code in English
- No TypeScript (plain JS)
- Webhook handlers are thin — verify HMAC via SDK, forward to DealerYes, return 200
- Never log the Shopify access token or the DealerYes shared secret
