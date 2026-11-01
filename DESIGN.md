---
name: LoLImpact
description: What moved your ranked games, said in one plain sentence and drawn as a single load line across a dashed coin-toss axis on pale concrete, with the model's doubt in plain sight.
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
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.6vw, 30px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "'ss01'"
  figure:
    fontFamily: "Martian Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.25
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
  section: "48px"
  split: "56px"
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
    padding: "22px 24px"
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
  chip-state-ahead:
    backgroundColor: "{colors.tension-red}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.hair}"
    padding: "0 10px"
    height: "24px"
  chip-state-behind:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
  chip-state-even:
    textColor: "{colors.graphite-ink}"
  chip-result-win:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.hair}"
    height: "22px"
  chip-result-loss:
    textColor: "{colors.graphite-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.hair}"
    height: "22px"
  tooltip:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    width: "300px"
  list-row-current:
    backgroundColor: "{colors.paper}"
    padding: "10px 8px"
---

# Design System: LoLImpact

## Overview

**Creative North Star: "The Load Line"**

A ranked game is drawn the way the in-client gold graph draws it: time runs left to right, and one heavy carbon line carries your team's chance to win across a dashed red axis at 50%, the coin toss. Each evaluated minute is a ring node on that line, with its value lettered above it. The model's doubt travels with the line as a grey band (50% and 95% margins of error), and a dashed segment carries the last node to the result. The interface is still a structural drawing pinned to a site-office wall, built from the same parts as before: hairlines, ring nodes, red marks where something holds, ash where nothing is confirmed. What changed is the reading order. Every surface states its conclusion first, in one plain sentence, and puts the drawing and the evidence under it; the deep detail sits behind a collapsed "See details".

The mood is engineered, calm and exact. The system is dense but spare. It leans on hairline rules, tabular mono figures and a single tension color instead of cards, tiles and fills. Uncertainty is part of the structure: the chart without its band, or a lane effect without its "sure / not sure", is unfinished. The words the user reads are plain ("win chance", "sure", "not sure", "Too close to call"); the structural vocabulary (rod, cord, taut, slack) belongs to this document and the code, not to the screen.

The world rejects the category's dark stat-card dashboard: a grid of KPI tiles on near-black, with neon, glow or RGB accents. It also rules out corporate-grey sameness. The dark theme is a direct inversion of the same drawing (graphite ground, bone line, brighter red). It is not a separate "gamer" skin. UI copy is bilingual (English default, Spanish), and every component must hold both lengths.

**Key Characteristics:**
- Pale concrete ground with a faint fractal-noise texture. Carbon ink. One tension red.
- Conclusion first: a one-sentence verdict leads each view, then the chart, then the ranked evidence, then the collapsed details.
- Confirmed vs. unconfirmed is shown in shape and word: straight red with a filled node and "sure", or sagging dashed ash with a hollow node and "not sure".
- Martian Mono, condensed, for every label, figure, annotation and control. Geist for sentences, including the verdict headline.
- Hairline rules, marked with red node dots, carry the structure. Panels are rare.
- Actions have a chamfered bottom-right corner. Containers are nearly square (3px). Nodes are circles.
- Motion is physical: nodes rise off the 50% axis in sequence with a slight overshoot.

## Colors

The palette is a restrained, near-monochrome drawing (concrete, paper, carbon) with a single tension red. A second, colorless voice, ash, means "not sure".

### Primary
- **Tension Red** (`tension-red`): the axis and what holds. It is used for the dashed 50% axis, the selected node's ring, core and halo, the selected minute's vertical guide (at 35%), confirmed force bars and their solid end node, the node dot in section titles and nav, the short dash before verdict facts and onboarding points, the rule down the verdict panel's left edge, progress bars, focus outlines, the text-selection background, and two chip fills: "YOU" / "your lane" and the "Your team ahead" state chip. It appears only as hairlines, dots, short marks and chip-sized fills.
- **Tension Red Ink** (`tension-red-ink`): the red for text. It is used for the active nav item, the selected node's value and minute label in the chart, the "WIN" result in the match meta line, the "sure" state word, the Live headline-card figures, the top rank in Draft, the "Server unreachable" notice and error copy. It measures 5.4:1 on concrete.
- **Tension Wash** (`tension-red-wash`): a 7% red tint. It shades the "your team ahead" half of the chart (at 45% opacity), the selected column in the per-minute table, the field focus ring and the stripes of the update-failed banner.

### Secondary
- **Slack Ash** (`slack-ash`): the unconfirmed member. It is used for the chart's margin-of-error bands (95% at 16% opacity, 50% at 22%), sagging "not sure" force bars and their hollow nodes, per-minute table bars that are not sure, the outline of the "LOSS" and "Too close to call" chips, tooltip trigger rings and disabled ghost buttons. It is a stroke and fill color only and never carries text (2.2:1 on concrete).
- **Soft Ash** (`slack-ash-soft`): quieter structure, such as the percentile track in the players table and the square frame around role glyphs.

### Neutral
- **Carbon Ink** (`carbon-ink`): the chart line, ring strokes, node cores, the filled final "win" node, the "WIN" chip, the "Rival ahead" state chip, primary button fill, tooltip fill, primary text and headings.
- **Graphite Ink** (`graphite-ink`): secondary text, meaning prose, verdict facts, lead paragraphs, story labels in the match list, nav links at rest and unselected chart values (6.6:1 on concrete).
- **Weathered Ink** (`weathered-ink`): tertiary labels, such as axis ticks, minute labels, "↑ your team ahead" chart captions, `.label` mono captions, metadata, "not sure" figures and the dashed segment to the result node. It measures about 4.8:1 on concrete ground and 5.3:1 on paper. See the Weathered Ink rule below.
- **Concrete Ground** (`concrete-ground`): the page. A fixed fractal-noise layer at 50% opacity (22% in dark) gives it grain. Chart value labels carry a 4px concrete halo so they stay legible over the band.
- **Paper** (`paper`): the few raised surfaces: the verdict panel, Live headline cards, the per-minute table, fields, the current row in the match list, your lane's row in the lane ranking (at 70%) and hollow node fills.
- **Paper Pressed** (`paper-pressed`): hover state for list rows, ghost buttons and menu options, and the backing behind champion icons.
- **Hairline** (`hairline`): row dividers, dotted chart gridlines, the readout's top rule and the rail/canvas divider.
- **Hairline Strong** (`hairline-strong`): the header's bottom rule, the top rule of ranked lists and tables, the rule above "See details" and "Your pattern", primary button hover and the ghost button's outline.

**Dark theme** (a full remap through `prefers-color-scheme` or `data-theme="dark"`): ground `#111113`, paper `#18181b`, paper-pressed `#202024`, ink `#eceae5`, graphite `#b0ada7`, weathered `#8f8c86`, ash `#6e6e70`, soft ash `#3a3a3e`, hairline `#2c2c30`, hairline-strong `#d6d3cc`, red `#e5484d`, red-ink `#f2777a`, wash `rgba(229, 72, 77, 0.1)`. Because the roles invert, the primary button and the "WIN" chip become bone-on-graphite and the chart line turns bone. No component changes its rules.

### Named Rules
**The Tension Rule.** Red means "something holds": the 50% axis, a confirmed effect, your team being confirmed ahead, the thing you selected, you. If an element is red, it must be one of those. Red never decorates and never fills an area larger than a chip.

**The Two Reds Rule.** Strokes, dots and fills use `tension-red`. Any text in red uses `tension-red-ink`. Stroke red on concrete is 4.0:1 and is not a text color.

**The Slack Rule.** Anything the model cannot confirm (the interval covers 0, or there is no data) is drawn in ash. On a force bar it is dashed, it sags (a quadratic curve, not a straight line), and it ends in a hollow paper-filled node; its figure drops to weathered ink. It is never red, however large the number.

**The Shape Before Hue Rule.** No state relies on color alone. Sure vs. not sure also differ in line form and node fill, and carry the words "sure" / "not sure". Win vs. loss uses a filled "WIN" chip vs. an outlined "LOSS" chip, and a filled vs. hollow final node. Standing at a minute is a chip with words ("Your team ahead", "Rival ahead", "Too close to call") in filled red, filled ink or ash outline. The chart's halves are captioned "↑ your team ahead" and "↓ rival ahead". Green is not in the palette.

**The Weathered Ink Rule.** Weathered ink is for mono labels, metadata and short hints only. It clears AA on concrete (about 4.8:1), but only just, so do not use it for running sentences.

## Typography

**Display Font:** Martian Mono Variable, width axis at 81% (fallback: ui-monospace, Cascadia Mono, monospace)
**Body Font:** Geist Variable with stylistic set `ss01` (fallback: ui-sans-serif, system-ui)
**Label/Mono Font:** Martian Mono Variable, width axis at 87.5%

**Character:** The pairing works like an engineering drawing. Condensed Martian Mono carries every measurement, label and annotation, the way a drafter letters dimensions. Geist handles the sentences that explain them, and now also carries the loudest sentence on a view: the verdict. The mono is always narrowed through `font-stretch` (the `wdth`-axis build of the fontsource package), so the large display lines read tall and structural rather than wide and techy.

### Hierarchy
- **Display** (380, clamp(44px, 5.5vw, 76px), 0.95, −0.02em, uppercase): view titles ("Live", "Draft") and the match title ("Your Akali", clamp(38px, 5vw, 64px)). The onboarding hero goes up to clamp(46px, 6.4vw, 92px) at 1.04 line height. There is one per view.
- **Headline** (Geist 600, clamp(22px, 2.6vw, 30px)/1.2, −0.01em, balanced wrap): the verdict sentence ("You won mainly through bot lane."). The Draft verdict uses a quieter step: Geist 500, 17px/1.45.
- **Figure** (400, 18px, tabular): the lane effect in the lane ranking ("+22%"). The Live headline cards take it to 26px in red ink; the selected value in the chart is 14px/500 in red ink over 11.5px unselected values.
- **Title** (500, 12px, 0.08em, uppercase): section titles, always drawn with the red rule-and-node mark in front. The title is the heading itself, not an eyebrow above one. In "See details" it is followed by a red-ink "+" / "−".
- **Body** (400, 14.5px/1.55, `ss01`): prose, limited to 64ch (graphite ink). Verdict facts are 15px/1.5 at 68ch, each led by a 9px red dash. Lead copy is 15–17px/1.55 at 44–48ch. Bold within prose goes to 600 in carbon ink.
- **Body Small** (400, 12.5–13.5px/1.5): section intros, chart hints, the readout sentence (14px), legend definitions, tooltip bubbles and fine print (12px, weathered ink).
- **Number** (400, 11.5–15px, tabular): every figure in tables, gold leads ("+2.7k gold"), KDA, the match tally ("4W · 16L") and per-minute cells.
- **Label** (450, 10.5px, 0.08em, uppercase, weathered ink): captions, axis ticks, minute labels, chip text, status and chart annotations ("WIN · MIN 29"). Chart half-captions and the "YOU" chip drop to 9.5px; nothing goes smaller.
- **Button** (500, 11.5px, 0.08em, uppercase): buttons and nav. Compact ghost buttons use 10px.

Champion and player names are Geist 550 at 13–14px, the one place where names sit next to figures without going mono.

### Named Rules
**The Mono Measures Rule.** If it is a number, a unit, a minute, a label or a control, set it in Martian Mono with tabular figures. If it is a sentence, set it in Geist. Do not mix within a single element.

**The Narrow Mono Rule.** Martian Mono never renders at its default width. Use 87.5% for labels, figures and controls, and 81% for display and the wordmark.

**The Plain Words Rule.** On screen, the model speaks plainly. Win-probability points are written as a signed percentage with "win chance" ("+18% win chance"), never "pp". Confirmation is "sure" / "not sure", never taut/slack. Rods, cords and members are drawing terms for this document only; no label, legend or tooltip uses them.

## Layout

The page is a drafting table. Content is capped at 1480px, with a responsive gutter of clamp(16px, 2.4vw, 32px). The sticky header sits on 90% concrete with an 8px backdrop blur and a hairline-strong bottom rule. It holds the wordmark, nav, the Riot ID form when a profile is loaded, the EN/ES language toggle and the theme toggle side by side at the right; a red "Server unreachable" notice appears only on failure.

**Onboarding (first viewport).** Two columns: the display headline, lead, Riot ID form and three red-dashed points on the left; an illustrative Timeline on the right (up to 560px), captioned "Illustrative example · not a real game".

**Profile layout.** A fixed-width left rail (368px, 320px at ≤1180px) and a fluid canvas, separated by a 56px gap (40px at ≤1180px). A hairline divider runs down the middle of that gap and meets the header with an 8px red node. The rail is sticky (top 86px) and scrolls on its own. It holds the match list, then the one-sentence "Your pattern" note under a hairline-strong rule. The canvas opens on the latest game.

**Match detail order.** One column, up to 980px, with 48px between sections: title and meta line; the verdict panel; the chart section (title, hint, Timeline, readout row); the lane ranking; then a collapsed "See details" holding model accuracy, the per-minute table, the players table and "How the model works". Nothing that explains the verdict sits below the fold of the details.

**Live and Draft.** A display title, a one-line prose intro and the primary action share one header row. Live puts "Shut these down first" (top 3 rivals) and "Play around" (top 2 allies) side by side (3fr / 2fr) as headline cards, then the full lists under a hairline-strong rule. Draft puts its verdict panel above the two team columns.

**Rhythm.** The spacing steps recur: 4, 8, 10 (list-row padding), 14, 22 (section header to body), 36 (between blocks in the rail and Live sections), 48 (between sections of a match) and 56 (rail/canvas split). Rows are divided by hairlines at 7–11px vertical padding. Ranked lists and tables sit on a hairline-strong top rule.

**Responsive.**
- ≤1180px: the header wraps and the profile form moves to its own row. The nav's red rule-and-node indicator becomes a red underline offset by 6px.
- ≤1100px: paired groups (Live focus cards, Live groups, Draft teams) stack.
- ≤960px: onboarding stacks, and the profile becomes master/detail. The list and the match are shown one at a time, with a "← All games" back link. The rail divider disappears.
- ≤640px: the header un-sticks and the nav takes its own full-width row. Lane-ranking rows reflow into name and effect on top, the force bar full width beneath, the gold lead last. Readout step buttons split the row 50/50. Tables drop secondary columns.
- The Timeline measures its own container: below 520px it is 250px tall (300px otherwise) with tighter gutters.

### Named Rules
**The Hairline Frame Rule.** Structure is drawn with hairlines, and every junction that matters gets a red node dot: the section-title mark, the active nav item on the header rule, the rail divider at the header and the current match in the list. Build sections from rules and whitespace, not from boxed cards.

**The Conclusion First Rule.** Every analytical view opens with its answer in one plain sentence, then shows the drawing that supports it, then the ranked evidence. Methodology and full tables go last, collapsed.

## Elevation & Depth

The system is flat concrete. Depth comes from tone (concrete → paper → pressed paper), from hairline weight (hairline vs. hairline-strong), and from the texture of the fixed fractal-noise layer behind everything. In-page surfaces have no shadows. The only shadows belong to layers that float above the page and have to separate from whatever is under them.

### Shadow Vocabulary
- **Tooltip lift** (`box-shadow: 0 10px 28px -8px rgba(0, 0, 0, 0.4)`): the carbon tooltip bubble.
- **Menu lift** (`box-shadow: 0 14px 30px -12px rgba(0, 0, 0, 0.35)`): the champion combobox listbox.

### Named Rules
**The Flat Concrete Rule.** Anything that sits in the page is flat: panels, rows, tables, charts. A shadow is allowed only on a layer that floats over other content (tooltip, open listbox). The sticky header separates with a blur and a rule, not a shadow.

## Shapes

The shape language is structural and nearly square. Containers (verdict panel, headline cards, field, per-minute table, tooltip) use a 3px corner. Small marks (chips, champion-icon frame, table cells, menu options) use 2px. Actions are chamfered: buttons clip a 10px diagonal off the bottom-right corner. The ghost button repeats that chamfer as a 1px ink outline, made by clipping an inner layer over the ink. Every node is a circle: a paper-filled ring with an ink stroke, usually with a solid core. Nodes range from the 6.5px chart ring down to the role-glyph dots. Lines are thick and round-capped (3.5px for the chart line and the loader, 2.4px in role glyphs). Force bars are 2.2px.

### Named Rules
**The Chamfer Rule.** Only things you press get the chamfered corner. Containers stay at 3px, and nothing in the system uses a pill or a large radius.

## Components

### Buttons
Buttons are heavy and precise, like a plate cut from carbon.
- **Shape:** rectangle with the bottom-right corner chamfered (10px diagonal), 38px tall (44px on onboarding). Compact contexts use 32px with 10px type and 12px padding.
- **Primary:** carbon ink fill, paper text, uppercase mono button type, 16px side padding, 14px gap to the trailing **rod glyph**, a 30×10 red drawing of a rod, a solid node and a hollow node.
- **Hover / Focus / Active:** the fill steps to hairline-strong over 0.2s, and the rod glyph shifts 3px and tilts −8° over 0.35s on the system ease-out. Focus shows a 2px red outline offset by 2px. Active nudges the button down 1px. Disabled drops to 45% opacity and the glyph stays still.
- **Ghost:** a 1px ink chamfered outline over the local surface. Hover fills it with pressed paper. When disabled, the outline goes ash and the text weathered, at full opacity, so the frame still reads. Used for "← Previous min" / "Next min →" and "Clear draft".

### Chips
- **Result chips (match list):** 54px wide, 22px tall, 2px radius, 9.5px mono 600 uppercase. "WIN" is solid carbon with paper text; "LOSS" is a 1px ash outline with graphite text. A loss also dims the champion name to graphite.
- **State chip (chart readout):** 24px tall, 10px padding, 2px radius, label type. "Your team ahead" (the 95% band sits above 50%) is tension red with paper text; "Rival ahead" (band below 50%) is carbon with paper text; "Too close to call" is a 1px ash outline with graphite text.
- **"YOU" chip:** tension red with paper mono text, 600 weight, 17px tall, 2px radius. It marks the loaded player's row in the players table and, as "your lane", your row in the lane ranking.
- **Story label:** not a chip but a right-aligned mono 10.5px graphite word in each match row: Comeback, Dominated, Lead lost, Behind early, Decided late. It comes from the team's win chance between min 8 and 20. Games without a timeline show a weathered placeholder.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** paper (paper at 88% for the generic `.panel`, so the grain shows slightly).
- **Shadow Strategy:** none (see Flat Concrete).
- **Border:** 1px hairline.
- **Internal Padding:** 22px × 24px (verdict panel), 18px × 22px (Draft verdict), 14px (headline cards, per-minute table).
- **Verdict panel:** the boxed summary of a view. A 1px tension-red rule replaces its left border. Inside: the headline sentence, then two or three fact lines in graphite, each led by a 9px red dash (which lane decided it with its gold lead and win chance, your own lane, the biggest swing). An unconfirmed decisive lane adds "The model isn't sure about this one: read it as a hint." It is announced politely to screen readers when it changes.
- **Live headline cards:** up to three rivals and two allies, auto-filled at 220px minimum, 10px apart. Each is champion icon and name over a hairline, then the figure ("+16%") in red ink, or weathered ink when not sure, and "win chance if they go 2-0". Before a game is found, an illustrative preview renders the same cards at 60% opacity, 40% greyscale and inert.
- **Update-failed banner:** paper with 45° red-wash stripes, a 1px border at 40% red, and a bold red-ink lead-in. While a stale profile refreshes, a quieter status line shows instead: an 18px red line that tenses, a mono caption ("Updating from Riot… showing your last saved view" or "Reading game N of M…") and a 2px progress bar.

### Inputs / Fields
- **Style:** paper fill, 1px hairline border, 3px radius, 38px tall (44px and 14px type on onboarding), mono 12.5px, weathered-ink placeholder.
- **Hover:** the border steps to ash.
- **Focus:** the border turns tension red with a 3px red-wash ring. The default outline is suppressed only here, where the ring replaces it.
- **Combobox (champion picker):** a field that opens a paper listbox with a hairline-strong border, 3px radius and menu lift. The active option is pressed paper with red-ink text. A chosen champion collapses to icon, name and a small × clear button.

### Navigation
- **Style:** uppercase mono links (button type, 450 weight), 8px × 12px, graphite ink at rest and carbon ink on hover.
- **Active:** red-ink text. A 1px red rule drops to the header's bottom rule, and a 7px red node sits on it. Under 1180px this becomes a red underline offset by 6px.
- **Toggles:** the language toggle ("EN" / "ES") and the theme toggle (half-disc icon plus "Auto" / "Light" / "Dark") are 10.5px mono weathered-ink buttons that darken to ink on hover.
- **Server notice:** only on failure, a hollow 7px red ring and "Server unreachable" in red ink. There is no status shown when things work.
- **Mobile:** the nav drops to its own full-width row above a hairline, and the theme toggle shows only its icon.

### Tooltip
Every non-obvious term is explained where it appears (for example "not sure", the story labels, "Your pattern"). The trigger is a 15px ash-ringed "?" circle, or a dotted-underlined phrase for inline terms. On hover or focus the ring and text turn red. The bubble is carbon ink with paper Geist at 12.5px/1.5, up to 300px wide, with a 3px radius and tooltip lift. Instead of an arrow, a 1px red line 9px long ties the bubble to its trigger; it flips below the trigger near the top of the viewport.

### Timeline (signature chart)
A horizontal SVG that fills its container: time left to right, like the in-client gold graph, and your team's chance to win from 0% (bottom) to 100% (top). It is always oriented to the loaded player, so up is always your team.
- **Ground:** the upper half is tinted with the wash at 45% and captioned "↑ your team ahead"; the lower half is captioned "↓ rival ahead". Dotted hairline gridlines at 0, 25, 75 and 100%; y ticks at 0, 50 and 100%; minute ticks ("8′") under each node.
- **Axis:** the dashed red 50% line (5/4 dash), drawn over the bands.
- **Doubt:** two ash bands following the line, the 95% margin of error (16%) and the 50% margin (22%).
- **Line:** a 3.5px carbon polyline with round joins, through 6.5px paper rings (2.4px ink stroke) with 2.3px ink cores. Every node has its value lettered above it in 11.5px graphite with a concrete halo.
- **Result:** a dashed weathered-ink segment from the last node to a final node at 100% (filled ink, win) or 0% (hollow, loss), captioned "WIN · MIN 29".
- **Selection:** the selected node turns red (ring and core) with an 11px red halo, its value grows to 14px red ink, its minute tick turns red ink, and a vertical red guide at 35% runs the chart's height. Nodes have 18px hit areas, roving tabindex and arrow-key navigation; each has a spoken label ("Minute 15: 71% chance to win, between 64% and 78%").
- **Readout row:** under a hairline, the state chip, the sentence "Min 20: 92% chance your team wins" (bold) with the range and change since the previous minute in weathered ink, and the two compact ghost step buttons.
- **Motion:** on load, nodes and bands rise from the 50% line in sequence, 600ms each with an 80ms stagger and a back-out overshoot of 1.25. Under reduced motion they appear at rest.

### Lane ranking
"What weighed most · min N": the five lanes at the selected minute, sorted by the size of their effect, on a hairline-strong top rule with hairline rows. Each row is role glyph and name (plus the "your lane" chip on your row, which is shaded paper), the gold lead in mono ("+2.7k gold", weathered when negative), a force bar, and on the right the effect in 18px mono over "sure" (red ink) or "not sure" (weathered, with a tooltip).

### Force Bar
A single row of the sure / not sure grammar. A hairline base with a dotted red center axis. A sure value is a straight 2.2px red line from the axis ending in a solid red node. A not-sure value is a dashed ash curve that sags in proportion to its length (up to 7px), ending in a hollow node. A thin weathered-ink whisker underneath shows the 95% margin. Used in the lane ranking, Draft slots and Live lists.

### Per-minute table
Inside "See details": a paper box with lanes as rows and evaluated minutes as columns. Minute headers are buttons tied to the chart's selection (the selected one is red ink over a red underline, and its column is washed with a 35% red inset ring). Each cell shows the signed effect in 11.5px mono over a 2px bar from the cell center, red when sure and ash (with weathered text) when not.

### Supporting pieces
- **Role glyph:** a 15px square frame in soft ash holding a line-and-node pictogram per lane (ink, 2.4px, round caps, paper-filled nodes), followed by the lane name.
- **Loader:** six ring nodes on a 3.5px ink line breathing above and below a dashed red axis, with a label and, when the profile streams in, a 220px 2px red progress bar and "Reading game N of M…".
- **Your pattern:** one sentence at the end of the rail comparing gold at min 10 in wins vs. losses, under a hairline-strong rule, shown only with at least three games on each side.
- **Champion icon:** a square with a 2px radius, a 1px hairline-strong ring, scaled 1.1× to crop the art border, and desaturated to 85% so the art sits inside the drawing.

## Do's and Don'ts

### Do:
- **Do** open every analytical view with a one-sentence verdict in Geist, then the chart, then the ranked evidence, with methodology collapsed under "See details".
- **Do** show every probability or effect with its doubt: the grey margin-of-error bands, a force-bar whisker, a "between X and Y" range, or a "sure / not sure" word.
- **Do** draw sure effects as straight red with a solid node and not-sure ones as dashed sagging ash with a hollow node, and label the state in words.
- **Do** write win-probability points as "+18% win chance" and confirmation as "sure / not sure", in both English and Spanish.
- **Do** mark structural junctions with a red node dot on a hairline: section titles, the active nav item, the current list row, the rail divider.
- **Do** set every figure in narrowed Martian Mono with tabular numerals, and every sentence in Geist.
- **Do** orient every chart to the loaded player: flip red-side data so up always means your team, and tint only that half with the wash.
- **Do** use `tension-red-ink` for red text and `tension-red` for strokes, dots and chip fills.
- **Do** chamfer the bottom-right corner of pressable controls and keep containers at 3px.
- **Do** animate with the system ease-out (cubic-bezier(0.16, 1, 0.3, 1)): 0.15–0.2s for color, 0.35s for the rod glyph, 0.4s for progress, and a sequenced spring for chart nodes. Collapse all of it under `prefers-reduced-motion`.

### Don't:
- **Don't** build the category's dark stat-card dashboard: no grids of KPI tiles, no card-per-metric layouts, no dark-by-default "gamer" skin. One verdict panel per view; Live's headline cards are capped at five, one per champion, never one per metric.
- **Don't** put "pp", "taut", "slack", "cords", "rods" or "members" in user-facing text.
- **Don't** use neon, glow, RGB gradients or aggressive display faces. The dark theme is the same drawing inverted, not a gaming mode.
- **Don't** color a not-sure value red because it is large. Only confirmation earns tension red.
- **Don't** encode win/loss or ally/enemy with red vs. green. Green is not in the palette. Pair any color with shape, sign or a word.
- **Don't** set text in `slack-ash`, and don't set running sentences in `weathered-ink` on bare concrete.
- **Don't** put shadows on in-page surfaces. Only floating layers (tooltip, listbox) lift.
- **Don't** round buttons into pills or give containers radii above 3px.
- **Don't** fill large areas with red. Red is a line, a dot, a chip or a 7% wash.
