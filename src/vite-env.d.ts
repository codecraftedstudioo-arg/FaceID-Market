/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MARKET_PRICES_URL?: string
  readonly VITE_PANEL_API_URL?: string
  readonly VITE_CRM_WEBHOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
