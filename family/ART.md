# The paintings

The app's rooms are built to sit on painted backdrops, like a film still,
with all the magic (candles, owls, light, sparkle, footprints) animated in
code on top. Generate each one with an image model (ChatGPT image
generation, Midjourney, Ideogram…), then save it into `public/art/` as
`.webp` (or `.jpg` renamed to `.webp` works too) using the exact file name.

**Every prompt starts with this style line** so the set feels like one film:

> Soft painterly cinematic fantasy illustration, in the style of a modern
> animated feature film's concept art, deep starry navy and indigo night,
> warm candle-gold glow, gentle volumetric light, dreamy and wondrous,
> rich detail but soft edges, no text, no people's faces, no logos.
> Vertical phone wallpaper, 9:19.5, 1170×2532.

Keep the **lower 40% calmer and darker** (that's where the buttons and
cards sit) and put the main subject in the **upper half**.

| File name | Used on | Prompt (after the style line) |
| --- | --- | --- |
| `street.webp` | Opening screen (behind the two houses) | A quiet old-Delhi lane at night reimagined as a magical wizarding street: deep blue sky full of stars and a large soft moon at upper right, floating candles drifting in the air, faint distant castle-like rooftops and domes, fairy lights strung between balconies, wet cobblestones reflecting warm lantern light, light mist at ground level. Leave the centre of the lower half empty (the two houses are drawn on top). |
| `castle.webp` | Home hero | A magical castle on a hill above a lake at night, glowing windows, towers with warm lights, a stone bridge with lanterns, a soft full moon, an owl in flight, stars and gentle clouds, mist over the water. |
| `gallery-34C.webp` | 34C portrait gallery | A grand candlelit staircase hall with empty gilded oval portrait frames on deep crimson walls, floating candles, warm golden light pouring from tall arched windows, crimson and gold banners with a phoenix emblem. |
| `gallery-33C.webp` | 33C portrait gallery | The same grand candlelit staircase hall but with deep sapphire-blue walls, empty gilded oval portrait frames, floating candles, moonlight through tall arched windows, blue and gold banners with an owl emblem. |
| `great-hall.webp` | House Cup | A vast enchanted great hall, the ceiling dissolving into a starry night sky, hundreds of floating candles, long wooden tables, two giant glass hourglasses filled with glowing sapphires and rubies at the far end. |
| `owlery.webp` | Owl Post | A cosy circular stone owlery tower at twilight, many owls perched on wooden beams, letters with red wax seals tied with ribbon, warm lantern light, stars through open arched windows, a few feathers drifting. |
| `pensieve.webp` | Pensieve | A dark round stone chamber lit by the silver-blue glow of a shallow stone basin swirling with luminous memories, wisps of light rising, shelves of tiny glass vials glimmering on the walls. |
| `quidditch.webp` | Games Room, Snitch Chase | A magical sports stadium at dusk seen from high in the stands, three tall golden hoops on poles, crimson and blue banners, floodlights like floating lanterns, a tiny golden winged ball glinting in the sky. |
| `duelling-hall.webp` | Wizard Duel | A long candlelit duelling hall with a raised stone platform, two crossed wands of light in the air, sparks of red and blue magic, tall gothic windows with moonlight. |
| `clocktower.webp` | Time-Turner calendar | Inside an enchanted clock tower, giant golden gears and a huge glowing clock face, a delicate golden hourglass pendant floating in the light, dust motes in warm beams. |

The **fashion studio** and the **Marauder's Map** don't need paintings:
the Atelier has its own stage and the map is live.

### App icon
Make a square 1024×1024 version of: *two ornate townhouses side by side
at night, one with a sapphire door and one with a crimson door, a moon and
floating candles above, gold and navy*. Save it as `public/icon-512.png`
(512×512) and `public/icon-192.png` (192×192).
