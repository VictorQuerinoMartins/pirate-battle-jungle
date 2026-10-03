# Asset credits and licenses

| Folder or file | Content | Source | License |
|---|---|---|---|
| `public/assets/spritesheet/ships_miscellaneous_sheet*` | Ship, cannon, cannon ball, explosion, fire and debris sprites (atlas). The fort cannon is the `cannon_mobile.png` frame of this atlas | Provided by Jungle Gaming with the technical test | Not stated in the delivered folder |
| `public/assets/spritesheet/ui_sheet*` | UI panels, buttons, icons and HUD pieces (atlas) | Provided by Jungle Gaming with the technical test | Not stated in the delivered folder |
| `public/assets/tilesheet/` | 64x64 terrain tiles: water, sand, grass, plants, rocks, leaves and the fort walls and towers | Provided by Jungle Gaming with the technical test | Not stated in the delivered folder |
| `public/assets/sounds/` | Cannon, hit, explosion, ambience and interface sounds | Provided by Jungle Gaming with the technical test | Not stated in the delivered folder |
| `public/assets/ui_scene_background.png`, `logo_jungle_gaming.svg` | Background image and Jungle Gaming logo | Provided by Jungle Gaming with the technical test | Jungle Gaming brand material |
| `public/assets/favicon.svg`, `icons.svg` | Browser tab icon and icon set | Vite project template | MIT |

Made by the author, not taken from any pack: the animated sea (the same water tile drawn twice, moving in opposite directions), the island outlines, and the grass texture, which is drawn by code at runtime (`src/game/render/grassTexture.ts`). Fonts are system fonts (`Trebuchet MS`, `Segoe UI` and the browser's default), so nothing is downloaded.

The assets are used only to solve this technical test. The folder delivered with the test has no license file. Before reusing them anywhere else, check the license of the original asset pack.

Code dependencies and their licenses are listed in `package.json` and `package-lock.json` (React, PixiJS, TanStack Query, Axios, MSW, Playwright, Vite and Vitest are open source).