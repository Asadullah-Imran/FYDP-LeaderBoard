---
name: Scientific Modern
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#c0c1ff'
  on-tertiary: '#1000a9'
  tertiary-container: '#8d90ff'
  on-tertiary-container: '#1407ad'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for "Scientific Modern" aesthetics, specifically tailored for a multi-omics leaderboard. The personality is precise, academic, and authoritative, yet avoids the clutter often found in legacy research software. It is designed to foster trust among bioinformaticians and researchers by prioritizing data legibility and structural clarity.

The visual style follows a **Modern Corporate** approach with **Minimalist** influences. It utilizes heavy whitespace to separate complex data clusters and employs subtle technical cues—such as thin borders and monospaced accents—to signal a developer-friendly, high-fidelity environment. The UI should feel like a precision instrument: stable, responsive, and neutral.

## Colors
This design system utilizes a foundation of deep slates and navies to provide a high-contrast environment for data visualization. 

- **Primary (Cyan/Blue):** Used for interactive elements, primary actions, and brand identification. 
- **Secondary (Emerald/Green):** Reserved for high-performance metrics (e.g., ARI/NMI scores), positive growth, and success states.
- **Backgrounds:** Dark mode uses a tiered "Deep Charcoal" (#020617) system to reduce eye strain during prolonged data analysis. Light mode uses a "Neutral Subtle Gray" (#F8FAFC) to maintain a clean, paper-like feel for reporting.
- **Accents:** Tertiary indigo is used for secondary data categories or metadata tags to provide visual distinction without competing with primary metrics.

## Typography
The typography strategy leverages **Inter** for its exceptional legibility in UI contexts and **JetBrains Mono** for all data-centric values, LaTeX formulas, and code snippets.

- **Headlines:** Use tight letter-spacing and semi-bold weights to anchor page sections.
- **Data Display:** All scores (e.g., 0.892 ARI) must be rendered in `data-mono` to ensure tabular alignment and a technical feel.
- **Labels:** Small labels use uppercase monospaced type to distinguish metadata from body content.
- **Scaling:** For mobile devices, display and large headlines scale down by approximately 25% to maintain readable line lengths.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop (1280px max-width) and a **Fluid Grid** on mobile. A 4px baseline grid ensures precise mathematical alignment of all elements.

- **Grid:** 12-column system with 24px gutters.
- **Metric Cards:** Should be grouped in clusters of 3 or 4, spanning 4 or 3 columns respectively.
- **Data Tables:** Should span the full 12 columns to accommodate multiple metric columns (ARI, NMI, ASW) without horizontal scrolling.
- **Margins:** Desktop uses a 32px outer margin; mobile drops to 16px to maximize screen real estate for charts.

## Elevation & Depth
Elevation in this design system is achieved through **Tonal Layers** rather than heavy shadows. This maintains the "Scientific Modern" aesthetic of flatness and precision.

- **Level 0 (Base):** Background color (`background_dark` or `background_light`).
- **Level 1 (Cards/Tables):** Surface color with a 1px solid border (#1E293B in dark, #E2E8F0 in light).
- **Level 2 (Dropdowns/Modals):** Subtle ambient shadow (0px 10px 15px -3px rgba(0,0,0,0.5)) to suggest interaction.
- **Active State:** Elements like selected leaderboard rows use a subtle primary tint (10% opacity) to highlight the selection without obscuring data.

## Shapes
The shape language is **Soft** but disciplined. A 0.25rem (4px) radius is applied to standard components to retain a professional, architectural feel. 

- **Standard (4px):** Buttons, Input fields, and small Chips.
- **Large (8px):** Metric cards and main Data Table containers.
- **Interactive:** Hover states on buttons should not change the shape, but rather the fill/border intensity.

## Components
Consistent implementation of components is critical for the "Scientific Modern" look:

- **Leaderboard Tables:** Use `data-mono` for all numeric values. The "Rank" column should feature a subtle background highlight for the top 3 spots (Gold, Silver, Bronze accents at 10% opacity).
- **Metric Cards:** Feature a large "Headline-LG" score value. Below the score, include a "Label-SM" showing the metric name and a secondary "Success Green" indicator for percentage improvement.
- **Buttons:** Solid primary color for main actions (e.g., "Submit Model"). Ghost buttons with 1px borders for secondary actions (e.g., "Export CSV").
- **Chips:** Small, square-cornered (4px) badges for "Method Type" (e.g., Clustering, Integration) using secondary/tertiary colors at low opacity.
- **Input Fields:** Clean, no-fill fields with a bottom border or 1px subtle outline. Focus states must use the primary brand blue.
- **Charts:** Use a high-contrast palette for data lines, ensuring the background grid lines are extremely subtle (#1E293B).