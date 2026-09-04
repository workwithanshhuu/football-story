# footArena Figma Design Spec

Version: 1.0  
Date: 2026-09-04  
Product: footArena  
Audience: player first; host, referee, and scorer are switchable roles

This is the complete visual and interaction specification for the screens currently represented in the repository. It is the source of truth for a Figma file and maps to the implemented routes and logger prototypes.

## Figma File Structure

Create these pages in order:

1. `00 Cover + Notes`
2. `01 Foundations`
3. `02 Components`
4. `03 Auth + Shell`
5. `04 Player App`
6. `05 Host Flow`
7. `06 Live Logging`
8. `07 System States`
9. `08 Share Cards`

### Frame conventions

- Primary mobile frame: `390 x 844`, iPhone 14 scale.
- Narrow mobile check: `320 x 690`.
- Desktop review frame: `1440 x 1024`; center the app at `430 px` and show the stadium canvas around it.
- Content safe area: `20 px` left and right; top inset `48 px`; bottom navigation clearance `96 px`.
- All mobile screens scroll vertically unless marked `fixed`.
- Use Auto Layout throughout. Use 8 px spacing increments, with 4 px allowed for icon gaps.

## 01 Foundations

### Color tokens

| Token | Value | Use |
|---|---|---|
| `background` | `#273632` | app canvas and dark chrome |
| `surface` | `rgba(56, 67, 62, .82)` | frosted cards |
| `surface-2` | `rgba(67, 80, 73, .76)` | secondary controls |
| `foreground` | `#F4F7EC` | primary text |
| `muted` | `#AEB9AE` | secondary text |
| `volt` | `#C8EE63` | primary action, active state, score |
| `pitch` | `#36A86D` | football state, positive status |
| `warning` | `#F3B94F` | caution and pending |
| `coral` | `#E76C5B` | destructive, card, negative event |
| `paper` | `#F4F1E8` | list logger background |
| `ink` | `#101612` | list logger text |
| `line` | `rgba(244, 247, 236, .12)` | borders and separators |

Light mode keeps the same semantic colors but changes the app canvas to `#F3F5E9`, surfaces to warm white, and text to `#183329`.

### Typography

- Display: `Barlow Condensed`, weight 700, uppercase for section titles, scorelines, and labels.
- Body: `Inter`, weights 400, 500, 600, 700.
- Display sizes: 32/32 page title, 26/28 card title, 22/24 section title, 18/20 compact title.
- Body sizes: 15/20 primary, 13/18 secondary, 11/14 metadata, 10/12 eyebrow, 9/11 navigation label.
- Numerals: tabular figures for score, time, prices, and player counts.
- Letter spacing: 0 for body; `0.12em` to `0.15em` for uppercase eyebrows.

### Shape, depth, and imagery

- Base radius: 16 px. Large card: 24 px. Pills: 999 px. Icon button: 12 px.
- Panel border: 1 px `line`; dark panel shadow `0 18 40 -22 rgba(5, 12, 9, .9)`.
- App backdrop: full-bleed night football stadium photograph, dark veil, 32 px pitch grid.
- Image treatment: content must always sit on a surface above the photograph; never place readable text directly on the image.
- Motion: 180 ms ease-out for controls, 240 ms card reveal, 2 s live-dot pulse, 300 ms bottom-sheet rise.

## 02 Components

Create component sets with these variants:

- `AppShell / dark | light / with-nav | without-nav`
- `TopBar / profile | page | back`
- `Panel / default | elevated | image-backed | paper`
- `IconButton / default | active | destructive | disabled`
- `PrimaryButton / default | loading | disabled`
- `FormatChip / 5v5 | 7v7 | 11v11 / selected | idle`
- `MatchRow / open | live | completed | cancelled`
- `BottomNav / home | discover | matches | profile`
- `StatCell / skill | goals | assists | mvps | matches`
- `RoleBadge / player | referee | host | scorer`
- `LivePill / live | offline | syncing | synced`
- `PlayerToken / home | away | selected | benched | dismissed`
- `EventRow / positive | negative | substitution | undone`
- `Sheet / goal-detail | opponent | end-match | correction`
- `Toast / success | warning | error | offline`
- `EmptyState / no-results | no-history | no-connection`

Buttons use a familiar icon when the action is icon-only. Every icon-only control has a tooltip or accessible label.

## 03 Auth + Shell

### `/` Login and registration

**Frame:** `390 x 844`, vertical scroll, stadium image background.

- Header at y=48: `footArena` wordmark in Barlow Condensed, small pitch mark.
- Hero at y=148: eyebrow `YOUR FOOTBALL STORY`; title `Play. Get scored. Get known.`; supporting copy `Your football story, one match at a time.`
- Auth panel: email field, password field, show-password icon, primary `Log in` button.
- Secondary text action: `Create an account` toggles the form to registration.
- Registration-only fields: display name and role multi-select chips `Player`, `Referee`, `Both`.
- Inline validation sits under the field; server error appears at the top of the panel.
- Footer: `By continuing, you agree to the footArena terms.`
- Loading state replaces button label with spinner; disabled state maintains button dimensions.

Traceability: `FR-4.1-01`, `FR-4.1-02`, `FR-4.1-03`, `FR-4.1-05`.

### Shared app shell

- Max content width: 430 px.
- Header begins below 48 px top inset.
- Fixed bottom navigation floats 16 px above viewport bottom, width `calc(100% - 40px)`, max `390 px`.
- Central create action is a 44 px volt button with plus icon.
- Active tab uses volt; inactive tabs use muted text. Do not rely on color alone: active icon and label use weight 700.

## 04 Player App

### `/home` Home dashboard

**Primary job:** understand the next match and join a nearby game.

1. Top bar: avatar and city, theme toggle, search, notifications with unread dot.
2. Rating strip: skill value on the left; goals, assists, MVP cells on the right.
3. Next match image-backed panel: live countdown chip, format chip, team matchup, date, venue, `Open logger`, share icon.
4. `Matches near you` section: compact match rows with format tile, time, venue, capacity bar, price, `Join`.
5. `Latest scorecard` panel: final score, date, format, MVP marker.
6. Fixed navigation: Home active.

States: authenticated data, fallback data, no upcoming match, loading skeleton, API error toast.

Traceability: `FR-4.2-01`, `FR-4.2-02`, `FR-4.2-03`, `FR-4.7-04`.

### `/discover` Discover

1. Page header: `DISCOVER / Find your game.` and notification button.
2. Search panel with search icon, venue/match input, filter icon.
3. Horizontal format chips: `All formats`, `5v5`, `7v7`, `11v11`.
4. Result heading with count; stacked open-match rows.
5. Empty state: `No matches found`, explanation, retry/search affordance.
6. `Bring your squad` host prompt with people icon and chevron.
7. Fixed navigation: Discover active.

Interaction: query filters as the user types; format chip changes selected state; each row opens match detail or join confirmation.

Traceability: `FR-4.2-01`, `FR-4.2-02`, `FR-4.2-03`, `FR-4.3-01`.

### `/matches` Matches

1. Header: `YOUR FOOTBALL / Matches`.
2. Season record panel with played count and skill rating.
3. `Upcoming` section with match rows and `View` action.
4. `Recent scorecards` section with scoreline, match metadata, MVP/ready status.
5. Fixed navigation: Matches active.

States: upcoming list, no upcoming matches, completed scorecard, corrected scorecard marker, abandoned partial marker.

Traceability: `FR-4.7-01`, `FR-4.7-02`, `FR-4.7-03`, `FR-4.9-03`, `FR-4.16-03`.

### `/profile` Profile

1. Header: `PLAYER PROFILE / Your story.` and edit icon.
2. Identity panel: avatar/initials, display name, location, role badges, skill/goals/MVP stats.
3. `On the pitch` panel: position chips and goals/assists/matches highlights.
4. Action list: Scorecards, Referee console, Player live view, Verification, Account settings.
5. Fixed navigation: Profile active.

States: empty profile, populated profile, edit mode, verification pending, public profile preview.

Traceability: `FR-4.1-03`, `FR-4.8-01`, `FR-4.8-02`.

## 05 Host Flow

### `/host` Match setup

Use a focused form frame without bottom navigation. A persistent top bar contains back, `HOST A MATCH`, and step count.

#### Step 1: Format

- Heading: `What are we playing?`
- Large selectable cards: `5v5`, `7v7`, `11v11`.
- Each card shows default squad size and suggested duration.
- Continue button is disabled until a format is selected.

#### Step 2: Venue and timing

- Venue field, kickoff date/time, match duration stepper, periods segmented control.
- Show format summary in a compact panel.
- Validation is plain language and grouped above the continue button.

#### Step 3: Teams

- Home and away team name fields.
- Optional host/logger role assignment.
- Preview scoreline card updates as names change.

#### Step 4: Squads

- Home/away segmented switcher.
- Roster rows with name, phone placeholder, shirt number, position, remove action.
- `Add player` opens a bottom sheet.
- Show minimum headcount progress and duplicate shirt-number errors.
- Primary action: `Publish match`.

Publish success: confirmation sheet with match summary, share action, and `Open logger`.

Traceability: `FR-4.3-01`, `FR-4.3-02`, `FR-4.3-03`, `FR-4.5-01`, `FR-4.12-01`.

## 06 Live Logging

The logger must be designed as two complete experiences sharing one event model. Both use a 430 px phone frame and a high-contrast interaction surface.

### List logger: `/match-logger` and `/referee`

- Compact paper surface, ink text, fixed scoreboard header.
- Header: back, venue/competition, live pill, sync indicator.
- Scoreboard: home score, match clock, away score; manual +/- controls.
- Team switcher: Home/Away.
- Squad grid: shirt number or player name tokens, selected state.
- Action panel: position-specific event buttons; goal button is primary, negative actions are coral.
- Undo bar appears after every event and disappears after timeout or use.
- Event log is most-recent-first with timestamp, player, action, and event color.
- Bottom sheets: goal detail, opponent attribution, end match confirmation.
- End states: completed, abandoned, forfeited, cancelled; each requires the correct reason and confirmation.

### Pitch logger: `/logger` and `/player`

- Dark glass surface with the same fixed scoreboard and sync treatment.
- Formation pitch includes halfway line, centre circle, penalty boxes, player tokens.
- Bench strip below pitch supports substitution flow: select bench player, then outgoing player.
- Selected-player action bar sits below the pitch.
- Activity feed and undo remain reachable without hiding the score.
- `/player` is read-only: hide logger actions, keep live score, lineup, event feed, and sync status.

### Logger state matrix

| State | Visual treatment | Required action |
|---|---|---|
| Live and online | green live dot, `Synced` | log event |
| Offline | amber `Offline` pill, queued count | continue logging |
| Syncing | animated sync icon, pending count | wait or keep logging |
| Selected player | volt outline and action panel | choose event |
| Goal detail | modal sheet with four finishing types | choose type or skip |
| Opponent attribution | opposing shirt grid | choose player or skip |
| Undo available | high-contrast bottom bar | undo latest event |
| Match complete | scorecard summary sheet | mark MVP/share |
| Correction window | corrected badge and audit link | append correction |

Traceability: `FR-4.5-01` through `FR-4.5-09`, `FR-4.6-01` through `FR-4.6-04`, `FR-4.7-01`, `FR-4.9-01` through `FR-4.9-08`, `FR-4.10-01` through `FR-4.10-06`, `FR-4.12-01` through `FR-4.12-07`, `FR-4.16-01` through `FR-4.16-05`, `FR-4.17-01` through `FR-4.17-04`.

## 07 System States

Create each as a full frame and as an overlay variant:

- Loading: preserve layout with skeleton panels; never shift the bottom nav.
- Empty: one sentence, one clear action, no decorative illustration required.
- Network error: inline coral message with retry; preserve locally captured logger data.
- Offline logger: persistent amber status and unsynced action count.
- 404: centered `This pitch is empty.` with `Go home`.
- Fatal error: centered `Something went wrong.` with `Retry` and `Go home`.
- Destructive confirmation: bottom sheet with explicit consequence and cancel as the safe default.
- Toasts: top-aligned inside the content frame, never behind the bottom nav.

## 08 Share Cards

Create reusable templates at exact export sizes:

### Match scorecard

- `1080 x 1920` story and `1200 x 630` link preview.
- Stadium/pitch texture in background; solid readable content zone.
- footArena mark, final score, teams, venue/date, player highlights, MVP badge.
- Abandoned matches show `ABANDONED - PARTIAL`; no result never implies a winner.
- Corrected scorecards show `CORRECTED` and correction count.

### Player performance

- Player name, role/position, match, scoreline, goals, assists, and position-specific actions.
- Claimed players use display name. Placeholders use first name plus shirt number only.

### Career milestone

- Milestone number, supporting stat, match count, player identity, and deep-link CTA.

Traceability: `FR-4.7-04`, `FR-4.8-02`, `FR-4.11-02`, `FR-4.15-01` through `FR-4.15-06`.

## Prototype Connections

- Login `Log in` -> Home.
- Login `Create an account` -> registration variant.
- Home `See all` -> Discover.
- Home `Open logger` -> Referee/list logger.
- Discover `Host a match` -> Host step 1.
- Discover match row `Join` -> join confirmation sheet.
- Matches `View` -> Player live view.
- Profile `Referee console` -> Referee/list logger.
- Profile `Player live view` -> Player/pitch read-only view.
- Host `Continue` -> next step; back returns to previous step with state preserved.
- Logger event -> optional detail sheet -> event log; undo reverses only the latest eligible event.
- Logger end match -> scorecard -> share card.
- Every destructive action -> confirmation sheet; every network failure -> retry state.

## Accessibility and Handoff Rules

- Minimum touch target: `44 x 44 px`.
- Body contrast target: WCAG AA against the rendered surface, not the raw stadium photo.
- Every icon-only control has a name; selected states have icon, text, or shape reinforcement.
- Focus ring uses `2 px` volt with `2 px` offset.
- Do not encode match status by color alone; pair with a label and icon.
- Figma layers use semantic names matching component names and route names.
- Export icons as SVG and share cards as PNG. Do not export full app screenshots as implementation assets.
