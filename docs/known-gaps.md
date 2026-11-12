# FolkTown known gaps

Minor polish and obscure bugs that do not affect core gameplay. Development speed and getting the game to players come first, so these are logged here and skipped. Nothing on this list gets implemented until the main game is playable and in players' hands.

When you hit one during a work package: add a row, move on.

`docs/refinements-backlog.md` is the other list: larger deferred problems such as moderation, privacy and server capacity.

| # | Gap | What a player sees | Fix, when the time comes | Logged |
|---|---|---|---|---|
| 1 | Gun clipping | The rifle pokes through walls when standing against them | Draw the rifle with its own camera and a thin slice of the depth range, as Saltline does (`reference/saltline/sky-shadows-post.txt`, renderer setup) | 12 Nov 2026 |
| 2 | Lens polish not ported | No lens dirt, horizontal streak, colour fringing or motion blur | Port those passes from Saltline's chain | 12 Nov 2026 |
