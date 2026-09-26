---
name: LoLImpact
description: What moved your ranked games, with the model's doubt in plain sight — drawn as a tensegrity column on pale concrete.
colors:
  tension-red: "#d62828"
  tension-red-ink: "#b21e1e"
  tension-red-wash: "rgba(214, 40, 40, 0.07)"
  slack-ash: "#9a9a9a"
  slack-ash-soft: "#c4c2bd"
  carbon-ink: "#0d0d0f"
  graphite-ink: "#4f4e4b"
  weathered-ink: "#62615d"
  concrete-ground: "#e7e5e1"
  paper: "#f2f1ed"
  paper-pressed: "#ebe9e4"
  hairline: "#cfccc6"
  hairline-strong: "#2a2a2c"
typography:
  display:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "clamp(44px, 5.5vw, 76px)"
    fontWeight: 380
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 81"
  headline:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "26px"
    fontWeight: 380
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 81"
  figure:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 87.5"
  title:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 87.5"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'ss01'"
  body-small:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  number:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 87.5"
  label:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "10.5px"
    fontWeight: 450
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 87.5"
  button:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "11.5px"
    fontWeight: 500
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 87.5"
rounded:
  hair: "2px"
  sm: "3px"
  chamfer: "10px"
  node: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  row: "10px"
  md: "14px"
  lg: "22px"
  xl: "36px"
  section: "56px"
  gutter: "clamp(16px, 2.4vw, 32px)"
  rail: "368px"
components:
  button-primary:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.chamfer}"
    padding: "0 16px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.hairline-strong}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "{colors.concrete-ground}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.chamfer}"
    padding: "0 16px"
    height: "38px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-pressed}"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.number}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "38px"
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "18px"
  nav-link:
    textColor: "{colors.graphite-ink}"
    typography: "{typography.button}"
    padding: "8px 12px"
  nav-link-active:
    textColor: "{colors.tension-red-ink}"
  chip-you:
    backgroundColor: "{colors.tension-red}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.hair}"
    padding: "0 6px"
    height: "17px"
  tooltip:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    width: "300px"
  list-row-current:
    backgroundColor: "{colors.paper}"
    padding: "10px"
---

# Design System: LoLImpact

## Overview

**Creative North Star: "The Tensegrity Column"**

A ranked game is drawn as a tensegrity column standing on pale concrete. Each evaluated minute is a ring node pushed off a dashed red axis that marks 50%, the coin toss. Carbon-black rods join the nodes as time rises up the page. Red cords run from the axis to each node, and from the active node out to the lanes that pulled on it. Anything the model cannot confirm goes slack: it turns ash, breaks into dashes and sags. The rest of the interface uses the same parts. Section titles hang from a red cord with a node at its end. The divider between the rail and the canvas is a hairline with a red node where it meets the header. The glyph on the primary action is a small rod and cord. The loader is a column that breathes.

The mood is engineered, calm and exact. Think of a structural drawing pinned to a site-office wall, not a gaming overlay. The system is dense but spare. It leans on hairline rules, tabular mono figures and a single tension color instead of cards, tiles and fills. Uncertainty is part of the structure. The 50% and 95% interval members sit next to every node, so a chart without its doubt does not look finished.

The world rejects the category's dark stat-card dashboard: a grid of KPI tiles on near-black, with neon, glow or RGB accents. The brand also rules out corporate-grey sameness. The dark theme is a direct inversion of the same drawing (graphite ground, bone rods, brighter red). It is not a separate "gamer" skin.

**Key Characteristics:**
- Pale concrete ground with a faint fractal-noise texture. Carbon ink. One tension red.
- Confirmed vs. unconfirmed is shown as taut vs. slack: straight red with a filled node, or sagging dashed ash with a hollow node.
- Martian Mono, condensed, for every label, figure, annotation and control. Geist for sentences only.
- Hairline rules, marked with red node dots, carry the structure. Panels are rare.
- Actions have a chamfered bottom-right corner. Containers are nearly square (3px). Nodes are circles.
- Motion is physical: nodes spring off the axis in sequence with a slight overshoot.

## Colors

The palette is a restrained, near-monochrome drawing (concrete, paper, carbon) with a single tension red. A second, colorless voice, ash, means "not confirmed".

### Primary
- **Tension Red** (`tension-red`): the cord and the axis. It is used for the dashed 50% axis, cords from the axis to nodes, confirmed lane cords and force bars, the selected node's ring and core, the node dot in section titles and nav, focus outlines, the text-selection background and the "TÚ" chip. It appears only as hairlines, dots and small marks, never as a large fill.
- **Tension Red Ink** (`tension-red-ink`): the red for text. It is used for the active nav item, the selected minute in the readout ("MIN 15"), the "Victoria" result, the "tenso" state, the top rank and error copy. It measures 5.4:1 on concrete.
- **Tension Wash** (`tension-red-wash`): a 7% red tint. It shades the "your team is winning" half of the column, the selected minute's column in the per-minute table, the field focus ring and the stripes of the degraded-mode banner.

### Secondary
- **Slack Ash** (`slack-ash`): the unconfirmed member. It is used for credibility-interval whiskers (95% thin, 50% thick), the envelope around the column, sagging lane cords, hollow nodes, the "indecisa" state dot and disabled ghost buttons. It is a stroke color only and never carries text (2.2:1 on concrete).
- **Soft Ash** (`slack-ash-soft`): quieter structure, such as the percentile track in the players table and the square frame around role glyphs.

### Neutral
- **Carbon Ink** (`carbon-ink`): rods, ring strokes, node cores, primary button fill, tooltip fill, primary text and headings.
- **Graphite Ink** (`graphite-ink`): secondary text, meaning prose, lead paragraphs, nav links at rest and table values that read as "behind" (6.6:1 on concrete).
- **Weathered Ink** (`weathered-ink`): tertiary labels, such as column headers, `.label` mono captions, axis labels, metadata and dimmed negatives. It measures about 4.8:1 on concrete ground and 5.3:1 on paper. See the Weathered Ink rule below.
- **Concrete Ground** (`concrete-ground`): the page. A fixed fractal-noise layer at 50% opacity (22% in dark) gives it grain.
- **Paper** (`paper`): the few raised surfaces: readout panel, per-minute table, fields, the current row in the match list, the loaded player's row and hollow node fills.
- **Paper Pressed** (`paper-pressed`): hover state for list rows, ghost buttons and menu options, and the backing behind champion icons.
- **Hairline** (`hairline`): row dividers, dotted chart gridlines and the rail/canvas divider.
- **Hairline Strong** (`hairline-strong`): the header's bottom rule, table-head underlines, the top rule of the legend, primary button hover and the ghost button's outline.

**Dark theme** (a full remap through `prefers-color-scheme` or `data-theme="dark"`): ground `#111113`, paper `#18181b`, paper-pressed `#202024`, ink `#eceae5`, graphite `#b0ada7`, weathered `#8f8c86`, ash `#6e6e70`, soft ash `#3a3a3e`, hairline `#2c2c30`, hairline-strong `#d6d3cc`, red `#e5484d`, red-ink `#f2777a`, wash `rgba(229, 72, 77, 0.1)`. Because the roles invert, the primary button becomes bone-on-graphite. No component changes its rules.

### Named Rules
**The Tension Rule.** Red means "force that holds": the 50% axis, a cord, a confirmed effect, the thing you selected. If an element is red, it must be one of those. Red never decorates and never fills an area larger than a chip.

**The Two Reds Rule.** Strokes, dots and fills use `tension-red`. Any text in red uses `tension-red-ink`. Stroke red on concrete is 4.0:1 and is not a text color.

**The Slack Rule.** Anything the model cannot confirm (the interval covers 0, or there is no data) is drawn in ash. It is dashed, it sags (a quadratic curve, not a straight line), and it ends in a hollow paper-filled node. It is never red, however large the number.

**The Shape Before Hue Rule.** No state relies on color alone. Taut vs. slack also differ in line form and node fill, and carry the words "tenso"/"flojo" or "confirmado"/"indicativo". Win vs. loss uses a filled vs. hollow "V"/"D" disc. Your side of the axis is labelled "gana tu equipo →". Green is not in the palette.

**The Weathered Ink Rule.** Weathered ink is for mono labels and metadata only. It clears AA on concrete (about 4.8:1), but only just, so do not use it for sentences.

## Typography

**Display Font:** Martian Mono Variable, width axis at 81% (fallback: ui-monospace, Cascadia Mono, monospace)
**Body Font:** Geist Variable with stylistic set `ss01` (fallback: ui-sans-serif, system-ui)
**Label/Mono Font:** Martian Mono Variable, width axis at 87.5%

**Character:** The pairing works like an engineering drawing. Condensed Martian Mono carries every measurement, label and annotation, the way a drafter letters dimensions. Geist handles the sentences that explain them. The mono is always narrowed through `font-stretch` (the `wdth`-axis build of the fontsource package), so the large display lines read tall and structural rather than wide and techy.

### Hierarchy
- **Display** (380, clamp(44px, 5.5vw, 76px), 0.95, −0.02em, uppercase): view titles ("Draft", "En vivo") and the match hero ("Tu Akali", clamp(40px, 5.2vw, 68px)). The onboarding hero goes up to clamp(46px, 6.4vw, 92px). There is one per view.
- **Headline** (380, 26px, display settings): the readout's selected minute ("MIN 15"), in red ink.
- **Figure** (400, 19–22px, tabular): the main numbers, such as the win probability in the readout (22px) and the pinned value next to each node in the column (19px).
- **Title** (500, 12px, 0.08em, uppercase): section titles, always drawn with the red cord-and-node mark in front. The title is the heading itself, not an eyebrow above one.
- **Body** (400, 14.5px/1.55, `ss01`): prose, limited to 64ch (`.prose`, graphite ink). Lead copy is 15–17px/1.55 at 44–48ch. Bold within prose goes to 600 in carbon ink.
- **Body Small** (400, 12.5–13.5px/1.5): legend definitions, readout row labels, tooltip bubbles and fine print (12px, weathered ink).
- **Number** (400, 11.5–15px, tabular): every figure in tables, force values (15px), deltas, KDA and ± margins (10.5px, weathered ink).
- **Label** (450, 10.5px, 0.08em, uppercase, weathered ink): column headers, captions, axis ticks, status and chart annotations ("MIN 20"). This is the smallest size in the system.
- **Button** (500, 11.5px, 0.08em, uppercase): buttons and nav.

Champion and player names are Geist 550 at 13–14px, the one place where names sit next to figures without going mono.

### Named Rules
**The Mono Measures Rule.** If it is a number, a unit, a minute, a label or a control, set it in Martian Mono with tabular figures. If it is a sentence, set it in Geist. Do not mix within a single element.

**The Narrow Mono Rule.** Martian Mono never renders at its default width. Use 87.5% for labels, figures and controls, and 81% for display and the wordmark.

## Layout

The page is a drafting table. Content is capped at 1480px, with a responsive gutter of clamp(16px, 2.4vw, 32px). The sticky header sits on 90% concrete with an 8px backdrop blur and a hairline-strong bottom rule.

**Profile layout (first viewport).** A fixed-width left rail (368px, 320px at ≤1180px) and a fluid canvas, separated by a 56px gap (40px at ≤1180px). A hairline divider runs down the middle of that gap and meets the header with an 8px red node. The rail is sticky (top 86px) and scrolls on its own. It holds the "Tu arranque típico" range plot above the match list. The canvas opens on the latest game. The hero is a two-column grid, with the readout column at minmax(300px, 430px) on the left and the column chart filling the rest.

**Rhythm.** The spacing steps recur: 4, 8, 10 (list-row padding), 14, 22 (section header to body), 36 (between blocks in the rail) and 56 (between sections of a match). Rows are divided by hairlines at 7–10px vertical padding. Table heads sit on a hairline-strong underline.

**Responsive.**
- ≤1180px: the header wraps and the profile form moves to its own row. The nav's red rule-and-node indicator becomes a red underline offset by 6px.
- ≤1100px: the match hero stacks with the readout above the chart. Paired groups (Draft teams, Live groups) stack.
- ≤960px: the profile becomes master/detail. The list and the match are shown one at a time, with a "← Todas las partidas" back link. The rail divider disappears.
- ≤720px / ≤640px: tables drop secondary columns (gold diff, role, CS, K/D). The column chart switches to a narrow geometry (560px tall, 86px label gutter). The header un-sticks.

### Named Rules
**The Hairline Frame Rule.** Structure is drawn with hairlines, and every junction that matters gets a red node dot: the section-title cord, the active nav item on the header rule, the rail divider at the header and the current match in the list. Build sections from rules and whitespace, not from boxed cards.

## Elevation & Depth

The system is flat concrete. Depth comes from tone (concrete → paper → pressed paper), from hairline weight (hairline vs. hairline-strong), and from the texture of the fixed fractal-noise layer behind everything. In-page surfaces have no shadows. The only shadows belong to layers that float above the page and have to separate from whatever is under them.

### Shadow Vocabulary
- **Tooltip lift** (`box-shadow: 0 10px 28px -8px rgba(0, 0, 0, 0.4)`): the carbon tooltip bubble.
- **Menu lift** (`box-shadow: 0 14px 30px -12px rgba(0, 0, 0, 0.35)`): the champion combobox listbox.

### Named Rules
**The Flat Concrete Rule.** Anything that sits in the page is flat: panels, rows, tables, charts. A shadow is allowed only on a layer that floats over other content (tooltip, open listbox). The sticky header separates with a blur and a rule, not a shadow.

## Shapes

The shape language is structural and nearly square. Containers (panel, field, per-minute table, tooltip) use a 3px corner. Small marks (chip, champion-icon frame, table cells, menu options) use 2px. Actions are chamfered: buttons clip a 10px diagonal off the bottom-right corner. The ghost button repeats that chamfer as a 1px ink outline, made by clipping an inner layer over the ink. Every node is a circle: a paper-filled ring with an ink stroke, sometimes with a solid core. Nodes range from the 7.5px column ring down to the 1.7px dots in role glyphs and sparklines. Rods are thick round-capped ink strokes (8px in the column, 2.4px in glyphs and sparklines). Cords are 1–2.2px lines.

### Named Rules
**The Chamfer Rule.** Only things you press get the chamfered corner. Containers stay at 3px, and nothing in the system uses a pill or a large radius.

## Components

### Buttons
Buttons are heavy and precise, like a plate cut from carbon.
- **Shape:** rectangle with the bottom-right corner chamfered (10px diagonal), 38px tall. Compact contexts use 32px with 10px type and 12px padding.
- **Primary:** carbon ink fill, paper text, uppercase mono button type, 16px side padding, 14px gap to the trailing **rod glyph**. The rod glyph is a 30×10 red drawing of a rod, a solid node and a hollow node on a cord.
- **Hover / Focus / Active:** the fill steps to hairline-strong over 0.2s, and the rod glyph shifts 3px and tilts −8° over 0.35s on the system ease-out, as if the cord were tensioning. Focus shows a 2px red outline offset by 2px. Active nudges the button down 1px. Disabled drops to 45% opacity and the rod stays still.
- **Ghost:** a 1px ink chamfered outline over the local surface (concrete, or paper inside panels). Hover fills it with pressed paper. When disabled, the outline goes ash and the text weathered, at full opacity, so the frame still reads.

### Chips
- **"TÚ" chip:** a tension-red block with paper mono text, 600 weight, 17px tall, 2px radius. It marks the loaded player's row. It is the only red-filled block in the system.
- **Result disc:** a 15px circle holding "V" or "D". A win is filled carbon with paper text. A loss is hollow, with an ash ring and weathered text.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** paper at 88% over the concrete, so the grain shows through slightly.
- **Shadow Strategy:** none (see Flat Concrete).
- **Border:** 1px hairline.
- **Internal Padding:** 18px (readout) or 14px (per-minute table).
- **Readout panel:** the headline minute in red ink over a 1px **red** rule. Then a verdict ("A favor" / "Indecisa"), marked by a filled red dot or a hollow ash dot. Then a definition list of mono figures on hairline rows, and a pair of compact ghost buttons to step between minutes.
- **Degraded-mode banner:** paper with 45° red-wash stripes, a 1px border at 40% red, and a bold red-ink lead-in. It is the system's "the cable is under strain" notice.

### Inputs / Fields
- **Style:** paper fill, 1px hairline border, 3px radius, 38px tall (44px on onboarding), mono 12.5px, weathered-ink placeholder.
- **Hover:** the border steps to ash.
- **Focus:** the border turns tension red with a 3px red-wash ring. The default outline is suppressed only here, where the ring replaces it.
- **Combobox (champion picker):** a field that opens a paper listbox with a hairline-strong border, 3px radius and menu lift. The active option is pressed paper with red-ink text. A chosen champion collapses to icon, name and a small × clear button.

### Navigation
- **Style:** uppercase mono links (button type, 450 weight), 8px × 12px, graphite ink at rest and carbon ink on hover.
- **Active:** red-ink text. A 1px red rule drops to the header's bottom rule, and a 7px red node sits on it. Under 1180px this becomes a red underline offset by 6px.
- **Status:** a 7px node dot with an uppercase mono caption. When connected, the dot is solid ink. When degraded or offline, it is a hollow red ring and the caption turns red ink.
- **Mobile:** the nav drops to its own full-width row above a hairline, and the theme toggle shows only its half-disc icon.

### Tooltip ("Qué significa")
Every non-obvious metric is explained where it appears. The trigger is a 15px ash-ringed circle, or a dotted-underlined phrase for inline terms. On hover or focus the ring and text turn red. The bubble is carbon ink with paper Geist at 12.5px/1.5, up to 300px wide, with a 3px radius and tooltip lift. It fades in over 0.16s. Instead of an arrow, a 1px **red cord** 9px long ties the bubble to its trigger. It sits below the trigger when the trigger is near the top of the viewport.

### The Column (signature chart)
The column is a vertical SVG. Time rises from bottom to top. The horizontal axis is your team's win probability from 0% to 100%, with a dashed red 50% axis (arrowheads at both ends) and dotted gridlines at 0, 25, 75 and 100%. The "your team wins" half is tinted with the wash. Each minute is drawn as:
- a paper ring (7.5px, 2.6px ink stroke) with an ink core;
- a red cord from the axis to the node;
- ash 95% whiskers (thin, with end ticks) and a 50% member (3.5px, round cap);
- a leader-line annotation pinned in the left gutter ("MIN 20", then the figure).

Nodes are joined by 8px carbon rods, trimmed so each ring stays visible. An ash envelope with slack edges shades the whole interval band. A dashed tail runs from the last node to a hollow final node at 0% or 100%, captioned "Victoria · min 29".

The selected node turns red: red ring, red core and a 13px red halo. Its annotation turns red ink. Five lane cords fan out from it, 12px apart vertically, with length equal to the lane's pp on the same scale. Taut lanes are straight red lines with a solid end. Slack lanes are sagging dashed ash with a hollow end. Lane labels are TOP / JG / MID / BOT / SUP. Nodes are keyboard-navigable (arrow keys, roving tabindex).

On load, nodes spring from the axis to their positions in sequence: 650ms each with a 95ms stagger and a back-out overshoot of 1.25. Under reduced motion they appear at rest.

### Force Bar (cord bar)
The force bar shows the same grammar on a single row. A hairline base with a dotted red center axis. A confirmed value is a straight 2.2px red cord from the axis ending in a solid red node. An unconfirmed value is a dashed ash curve that sags in proportion to its length (up to 7px), ending in a hollow node. A thin weathered-ink whisker underneath shows ±1.96 SE. It is used for lane effects, draft slots and live early-kill values, next to a mono figure, a ± margin and the state word.

### Supporting glyphs
- **Role glyph:** a 15px square frame in soft ash holding a rod-and-node pictogram per lane. The rods are ink, 2.4px with round caps, with paper-filled nodes. Top is a corner at the upper left, bot a corner at the lower right, mid a diagonal, jungle a zigzag and support a short rod beside a dotted corner.
- **Mini column:** the match-list sparkline (96×28). A thin dotted red 50% line, a 2.4px ink rod and 1.7px ring nodes. It is flipped so that "up" is always your team.
- **Loader:** five ring nodes on a rod that sway around a dashed red axis on faint red cords. The column breathes while data loads. A secondary "refreshing" indicator is an 18px red cord that tenses (scaleX 0.2 → 1, 1.2s, alternating).
- **Range plot (Tu arranque típico):** an ash range bar on a hairline track, with a paper ring-node mean and a dashed red zero line.
- **Champion icon:** a square with a 2px radius, a 1px hairline-strong ring, scaled 1.1× to crop the art border, and desaturated to 85% so the art sits inside the drawing.

## Do's and Don'ts

### Do:
- **Do** show every probability or effect with its interval: ash 95% whiskers, a 50% member, or a "± x pp" mono margin next to the figure.
- **Do** draw confirmed effects taut (straight red, solid node) and unconfirmed ones slack (dashed ash, sagging, hollow node), and label the state in words.
- **Do** mark structural junctions with a red node dot on a hairline: section titles, the active nav item, the current list row, the rail divider.
- **Do** set every figure in narrowed Martian Mono with tabular numerals, and every sentence in Geist.
- **Do** orient every chart to the loaded player: flip red-side data so the right side and "up" always mean "tu equipo", and tint only that half with the wash.
- **Do** use `tension-red-ink` for red text and `tension-red` for strokes, dots and the one chip.
- **Do** chamfer the bottom-right corner of pressable controls and keep containers at 3px.
- **Do** animate with the system ease-out (cubic-bezier(0.16, 1, 0.3, 1)): 0.15–0.2s for color, 0.35s for the rod glyph, and a sequenced spring for chart nodes. Collapse all of it under `prefers-reduced-motion`.

### Don't:
- **Don't** build the category's dark stat-card dashboard: no grids of KPI tiles, no card-per-metric layouts, no dark-by-default "gamer" skin. The single readout panel is the only boxed summary on a view.
- **Don't** use neon, glow, RGB gradients or aggressive display faces. The dark theme is the same drawing inverted, not a gaming mode.
- **Don't** color an unconfirmed value red because it is large. Only confirmation earns tension red.
- **Don't** encode win/loss or ally/enemy with red vs. green. Green is not in the palette. Pair any color with shape, sign or a word.
- **Don't** set text in `slack-ash`, and don't set sentences in `weathered-ink` on bare concrete.
- **Don't** put shadows on in-page surfaces. Only floating layers (tooltip, listbox) lift.
- **Don't** round buttons into pills or give containers radii above 3px.
- **Don't** fill large areas with red. Red is a line, a dot or a 7% wash.
