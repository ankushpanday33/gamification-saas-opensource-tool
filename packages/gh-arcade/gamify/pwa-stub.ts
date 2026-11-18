// GH-Arcade registers a service worker through vite-plugin-pwa. Gamify embeds the games in iframes and
// does not ship a service worker, so the virtual module is replaced by this no-op.
export function registerSW(): () => void {
  return () => {};
}
