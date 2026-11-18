# GH-Arcade inside Gamify

Games vendored from https://github.com/TMHSDigital/GH-Arcade (MIT, see LICENSE).
Changes made for Gamify (all small, search for "Gamify:"):

- shared/scenes.ts: `recordGameOver` posts `{source:'gamify-arcade', type:'game_over', gameId, score, isRecord}` to the parent window; `toArcade` posts `exit` when embedded.
- shared/phaser-config.ts: adds the `embedded` class and posts `ready` when running in an iframe.
- shared/game-shell.css: hides the back link when embedded.
- gamify/vite.config.ts: builds only the game pages to ../../public/arcade (base /arcade/), no PWA or hub. Tests and the _template game were removed.

Rebuild: `npm run build:arcade` from the repo root.
