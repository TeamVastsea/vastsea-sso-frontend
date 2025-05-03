/// <reference types="vite/client" />
interface ViteTypeOptions {
}

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVER_CLIENT_ID: string;
  readonly VITE_GT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
