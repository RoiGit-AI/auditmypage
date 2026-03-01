export async function register() {
  // Node 25 exposes a broken `localStorage` global (plain object, no Web Storage API).
  // Libraries that check `typeof localStorage !== 'undefined'` then crash calling `.getItem()`.
  // Remove it on the server so libraries fall back to their non-browser paths.
  if (typeof window === "undefined" && typeof localStorage !== "undefined") {
    // @ts-expect-error — intentionally removing broken Node 25 global
    globalThis.localStorage = undefined;
  }
}
