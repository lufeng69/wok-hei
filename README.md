# WOK HEI — 镬气大排档

A wok-station cooking game, built for the make.fun best cooking game bounty. Run a street-food wok stall: take orders off the board, toss ingredients into the wok, mind the heat, plate each dish while it sits in its perfect window, and ring the bell to serve before the customer's patience runs out.

Play it: open `game/index.html` in a desktop browser (or serve `game/` with any static server). Keyboard and mouse, no network, no install.

## How to play

1. **Take the order** — tickets on the order board show the dish and the ingredients it needs, plus a patience bar.
2. **Toss it in the wok** — click an ingredient bin (or press `1`–`8`). Each ingredient cooks on its own clock.
3. **Mind the ring** — the arc around each wok item is its cook progress. Plate it while the arc is green: too early and it is raw, too late and it burns. Click a wok item to plate it (done), or to toss it (burnt).
4. **Serve** — when the plate holds exactly what a ticket asks for, the ticket glows gold. Click the ticket or ring the bell (or press `Enter`) to serve and earn coins.

- `Space` plates every item that is ready at once.
- `H` cycles the wok heat: LOW / MED / HIGH. High heat cooks faster and burns faster.
- `T` clears the plate. `P` pauses. `M` mutes.
- A shift lasts 150 seconds. Serve dishes in a row to build a combo; let three orders walk out and the shift ends early. Each new day brings faster orders and a four-ingredient house special.

## What is in here

- `game/` — the playable game: `index.html` plus ES modules under `game/src/` (kitchen rules, rendering, input, synthesized sound, screenshot staging). All art is drawn in code, all sound is synthesized with WebAudio.
- `screenshots/` — four real renders of the game: title, mid-cooking, serving, and the end-of-shift results.
- `main.ts` — the hand-in program (Node 22, standard library only): copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

Built with Muse. Referral code: `kcn5v9j0`

## License

MIT — see `LICENSE`.
