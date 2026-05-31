/// <reference lib="es2020" />
/// <reference lib="dom" />

// Editor-only shims to satisfy the TS server when it misses lib resolution
declare global {
  interface Object {}
  interface Boolean {}
  interface CallableFunction extends Function {}
  interface NewableFunction extends Function {}
}

export {};
