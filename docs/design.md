# Ember Studio

## Overview

A warm, craft-focused design system for creative project management tools. The aesthetic blends terracotta warmth with modern minimalism: soft earth tones anchor the interface while amber accents draw attention to actions and progress. Designed for teams that value aesthetics alongside productivity.

Both light and dark modes should feel intentional, not just inverted. The overall mood is calm, focused, and subtly luxurious.

## Colors

- **Primary** `#C2410C`: Terracotta, used for CTAs, active states, links, focus rings, and progress indicators
- **Primary Hover** `#9A3412`: Burnt sienna, used for hover states on primary elements
- **Accent** `#F59E0B`: Amber, used for notifications, badges, highlights, and new-item indicators
- **Neutral** `#78716C`: Stone, used for muted text, placeholders, timestamps, and metadata
- **Background** `#FAFAF9`: Warm white page background with a hint of cream
- **Surface** `#F5F5F4`: Cards, panels, and modals; slightly warm off-white
- **Surface Raised** `#E7E5E4`: Hover states, selected rows, and active tabs
- **Text Primary** `#1C1917`: Warm near-black, used for headings, body text, and primary labels
- **Text Secondary** `#57534E`: Warm gray, used for descriptions, captions, and secondary info
- **Border** `#D6D3D1`: Warm gray borders, used for card edges, dividers, and input borders
- **Success** `#16A34A`: Completed tasks, approved items, and positive states
- **Warning** `#D97706`: Due soon, needs attention, and caution banners
- **Error** `#DC2626`: Overdue, failed, and destructive actions

## Typography

- **Display Font**: Playfair Display, loaded from Google Fonts
- **Body Font**: Source Sans 3, loaded from Google Fonts
- **Code Font**: Fira Code, loaded from Google Fonts

Display and heading text uses Playfair Display at bold weight with tight letter spacing `-0.02em`. The serif display font conveys craft and intentionality.

Body and UI text uses Source Sans 3 at regular `400` and semibold `600` weights. Code blocks use Fira Code with ligatures enabled.

Type scale:

- Display: `64px`
- Headline: `48px`
- Section heading: `28px`
- Subhead: `20px`
- Body: `16px`
- Small: `14px`
- Caption: `12px`
- Overline: `11px`, uppercase, tracking-wide

## Elevation

Cards rest flat with a `1px` warm border `#D6D3D1` and gain a soft shadow on hover: `0 4px 16px rgba(28,25,23,0.06)`.

Active or selected cards get a `2px` left border in terracotta. Primary buttons gain a warm glow on hover: `0 4px 12px rgba(194,65,12,0.25)`.

Modals use a larger shadow: `0 24px 48px rgba(28,25,23,0.12)` with a backdrop blur. The nav is transparent with backdrop blur, gaining a `1px` bottom border on scroll.

## Components

### Buttons

Primary buttons use a terracotta `#C2410C` fill with warm-white text, `8px` radius, and semibold weight. Secondary buttons use a transparent background with a `1px` stone border `#D6D3D1` and warm text. Ghost buttons have no border, just text color. Destructive buttons use a red background with white text.

All buttons use a `150ms` transition.

Button sizes:

- Small: `32px` height, `12px` horizontal padding
- Medium: `40px` height, `16px` horizontal padding
- Large: `48px` height, `24px` horizontal padding

### Cards

Cards use warm white surface `#F5F5F4`, a `1px` border `#D6D3D1`, `12px` radius, and `16px` padding.

Project cards show a colored left stripe `4px` wide matching the project's assigned color. Hover lifts `2px` with shadow increase. Selected cards have a terracotta left border.

### Inputs

Inputs use a `1px` border `#D6D3D1`, surface background `#F5F5F4`, `8px` radius, `12px` padding, and `16px` font size.

Focus state:

- Border turns terracotta
- Ring uses `0 0 0 3px rgba(194,65,12,0.12)`

Error state:

- Border turns red

Labels are `14px` semibold and appear above the input.

### Chips

Chips are pill-shaped with `9999px` radius.

Category chips:

- Stone-100 background
- Stone-600 text
- `6px 14px` padding

Active chips use terracotta background with white text. Priority chips use semantic colors with matching text.

### Progress Bars

Progress bars are `4px` tall with rounded-full corners, a stone-200 track, and terracotta fill. Fill animates with a `300ms` ease transition. Percentage label appears in small text above.

### Avatars

Avatars are circular with `9999px` radius and `32px` default size. Stacked avatars overlap by `-8px`. Use a `2px` solid surface-color border for separation.

### Tabs

Tabs use a horizontal underline style.

- Inactive: stone text, no underline
- Active: terracotta text with `2px` bottom border
- Hover: warm gray background

### Navigation

Navigation uses a sidebar layout with `256px` width. Sidebar background is warm white with a `1px` right border. Logo and workspace name appear at the top.

Sections are collapsible with chevron toggles. Active items use a terracotta left accent bar `3px` wide with a warm tinted background.

## Spacing

- Base unit: `4px`
- Scale: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64`, `80px`
- Component padding:
  - Small: `8px 12px`
  - Medium: `12px 16px`
  - Large: `16px 24px`
- Section spacing:
  - Mobile: `24px`
  - Tablet: `32px`
  - Desktop: `48px`
- Container max width: `1200px` with `24px` horizontal padding
- Card grid gap:
  - Mobile: `16px`
  - Desktop: `24px`

## Border Radius

- `4px`: Inline code and small badges
- `8px`: Buttons, inputs, selects, and dropdowns
- `12px`: Cards, panels, modals, and popovers
- `9999px`: Avatars, chips, pills, and progress bars

## Do's And Don'ts

### Do

- Use terracotta `#C2410C` only for interactive elements and active states, never as decoration
- Maintain the `4px` spacing grid consistently
- Use Playfair Display for headings and Source Sans 3 for body; the serif and sans contrast is the design's signature
- Keep the warm tone consistent and avoid cool grays or blue-tinted neutrals
- Use the amber accent sparingly for attention-drawing elements only

### Don't

- Use more than two font weights on a single screen; prefer regular and semibold
- Mix border radius values; buttons get `8px`, cards get `12px`
- Use pure black or pure white; always use the warm palette values
- Add decorative elements; the warmth comes from the color palette, not ornament
- Place multiple terracotta buttons in the same section; use one primary CTA per view
