/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENCODE_API_KEY: string;
  readonly VITE_OPENCODE_BASE_URL: string;
  readonly VITE_DEFAULT_MODEL: string;
  readonly VITE_ENABLE_STREAMING: string;
  readonly VITE_DEFAULT_THEME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
