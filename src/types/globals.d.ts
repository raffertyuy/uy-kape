// Global type declarations for browser APIs
// These are already provided by TypeScript's lib.dom.d.ts but declared here for ESLint
declare global {
  const navigator: Navigator
  const URL: typeof globalThis.URL
}

export {}