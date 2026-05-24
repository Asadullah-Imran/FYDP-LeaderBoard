---
name: Scientific Modern Light
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#8a5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#de8712'
  on-tertiary-container: '#4d2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
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
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for precision, clarity, and institutional trust. It evokes the atmosphere of a modern laboratory: clinical but not cold, airy but grounded in data. The aesthetic prioritizes information density and legibility, catering to researchers, engineers, and analysts who require a distraction-free environment for complex tasks.

The style is **Corporate / Modern** with a strong lean toward **Minimalism**. It utilizes a "data-first" hierarchy where functional elements are clearly defined by subtle tonal shifts rather than decorative flourishes. The primary focus is on high-contrast readability and a sense of "digital hygiene"—where every pixel serves a specific utility.

## Colors

The palette is anchored by a sterile, high-key neutral base to provide an expansive and airy feel. 

- **Primary Action**: Vibrant Cyan (#0ea5e9) is reserved for interactive elements, progress indicators, and critical data highlights. 
- **Surfaces**: We use a triple-tier neutral system. Pure White (#ffffff) is for the highest level of focus (cards/inputs), while the background rests on a Soft Slate-Gray (#f8fafc) to reduce eye strain.
- **Typography**: Deep Slate (#0f172a) ensures maximum AA/AAA accessibility for body text, while a muted Gray-Blue (#64748b) handles secondary metadata.
- **Accents**: Subtle Gray (#e2e8f0) provides the structure for borders and dividers without fragmenting the visual flow.

## Typography

This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian nature. The type scale is optimized for high-density information displays.

- **Headlines**: Use Semi-Bold weights with tight letter spacing for a technical, authoritative appearance.
- **Body Text**: Rendered in a 16px base for long-form reading, with a 14px variant for denser data grids.
- **Labels**: Small-caps or medium weights with slight tracking are used for technical metadata and UI controls to distinguish them from content.
- **Readability**: On light backgrounds, avoid weights below 400 for body copy to maintain crispness on non-retina displays.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** grid. The content resides within a 12-column grid that scales fluidly until it hits a 1440px max-width, where it centers with generous margins.

- **Grid**: 12 columns for desktop, 8 for tablet, and 4 for mobile. 
- **Rhythm**: An 8px linear scale governs all padding and margins (8, 16, 24, 32, 48, 64).
- **Density**: In data-heavy views, the system can pivot to a "Compact" mode where the base unit shifts to 4px, allowing for higher information concentration without sacrificing alignment.

## Elevation & Depth

Elevation in this design system is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows. This maintains the "Scientific" airy quality.

- **Surface Tiers**: Depth is achieved by placing Pure White surfaces on top of Light Gray (#f8fafc) backgrounds.
- **Outlines**: Every container should feature a 1px solid border (#e2e8f0). This provides structural definition without adding the visual weight of a shadow.
- **Overlays**: For modals or menus, use a very soft, highly diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.08)) combined with a backdrop blur to keep the interface feeling lightweight and modern.

## Shapes

The shape language is defined as **Rounded (Level 2)**. 

Standard UI components like buttons and input fields utilize a **0.5rem (8px)** corner radius. This balance ensures the UI feels approachable and modern while retaining the structural rigidity associated with professional software. Larger containers like cards may scale up to **1rem (16px)** to create a clear container hierarchy, while smaller elements like chips or badges may use a full-pill radius to distinguish them from primary interactive blocks.

## Components

- **Buttons**: Primary buttons are solid Cyan (#0ea5e9) with white text. Secondary buttons use an outline style (#e2e8f0) with Deep Slate text.
- **Input Fields**: Must have a white background, 1px border (#e2e8f0), and 8px padding. On focus, the border transitions to Primary Cyan with a 2px outer glow.
- **Cards**: Minimalist containers with a white background and a 1px border. No shadows are used for static cards.
- **Lists**: Use subtle dividers (#f1f5f9) and high-contrast text. Selection states should be indicated by a light cyan background (5% opacity) and a 4px primary-colored left accent bar.
- **Chips**: Small, rounded elements with #f1f5f9 backgrounds and #64748b text for category tagging.
- **Data Tables**: High density, using #f8fafc for header backgrounds and 1px horizontal dividers only. This reinforces the "scientific" grid-based nature of the design system.