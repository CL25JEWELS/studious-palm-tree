# UI Component Map

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   └── UserMenu
├── MainLayout
│   ├── TransportBar
│   │   ├── PlayButton
│   │   ├── StopButton
│   │   ├── PauseButton
│   │   └── BPMControl
│   ├── PadGrid
│   │   └── PadButton (x8)
│   ├── PadControls
│   │   ├── VolumeSlider
│   │   ├── PitchSlider
│   │   ├── PanSlider
│   │   ├── MuteButton
│   │   └── SoloButton
│   ├── SoundPackPicker
│   │   └── SoundPackCard (xN)
│   ├── EffectsPanel
│   │   └── EffectControl (xN)
│   └── ProjectBrowser
│       └── ProjectCard (xN)
└── Footer
    ├── StatusBar
    └── VersionInfo
```

## Component Catalog

### PadButton

**Purpose**: Individual pad in the grid for triggering sounds

**Props**:
```typescript
interface PadButtonProps {
  pad: PadState;
  onTrigger: (padId: string) => void;
  onRelease?: (padId: string) => void;
  disabled?: boolean;
  className?: string;
}
```

**States**:
- Default (inactive)
- Active
- Muted
- Solo
- Playing
- Disabled

**Accessibility**:
- `role="button"`
- `aria-label="Pad {id}"`
- `aria-pressed={isActive}`
- Keyboard support: Space/Enter to trigger

**Responsive Behavior**:
- Minimum touch target: 44x44px
- Scales proportionally with grid
- Maintains aspect ratio: 1:1

---

### PadGrid

**Purpose**: Container layout for pad buttons

**Props**:
```typescript
interface PadGridProps {
  pads: PadState[];
  columns?: number;
  onTriggerPad: (padId: string) => void;
  onReleasePad?: (padId: string) => void;
  className?: string;
}
```

**Layout**:
- CSS Grid layout
- Configurable columns (default: 4)
- Gap: 1rem (16px)
- Max width: 600px
- Centered horizontally

**Accessibility**:
- `role="group"`
- `aria-label="Pad grid"`

**Responsive Behavior**:
- Mobile: 2 columns
- Tablet: 3-4 columns
- Desktop: 4+ columns

---

### TransportBar

**Purpose**: Playback controls and tempo settings

**Props**:
```typescript
interface TransportBarProps {
  state: TransportState;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onBPMChange: (bpm: number) => void;
  className?: string;
}
```

**Controls**:
- Play button
- Stop button
- Pause button
- BPM input/slider
- Current time display

**Accessibility**:
- `role="toolbar"`
- `aria-label="Transport controls"`
- Keyboard shortcuts: Space (play/pause), Esc (stop)

**Responsive Behavior**:
- Mobile: Stacked layout
- Desktop: Horizontal layout
- Sticky positioning at top

---

### PadControls

**Purpose**: Per-pad parameter adjustment

**Props**:
```typescript
interface PadControlsProps {
  pad: PadState;
  onUpdate: (padId: string, updates: Partial<PadState>) => void;
  className?: string;
}
```

**Controls**:
- Volume slider (0-100%)
- Pitch slider (-12 to +12 semitones)
- Pan slider (L-C-R)
- Mute button
- Solo button
- Effects selector

**Accessibility**:
- Labeled sliders
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Keyboard control: Arrow keys for sliders

**Responsive Behavior**:
- Mobile: Collapsible panel
- Desktop: Side panel or modal

---

### SoundPackPicker

**Purpose**: Browse and select sound packs

**Props**:
```typescript
interface SoundPackPickerProps {
  soundPacks: SoundPackMetadata[];
  selectedPackId?: string;
  onSelect: (packId: string) => void;
  className?: string;
}
```

**Display**:
- Grid of sound pack cards
- Pack name, author, cover image
- Tags
- Download status

**Accessibility**:
- `role="list"`
- `role="listitem"` for each card
- `aria-selected` for selected pack

**Responsive Behavior**:
- Mobile: 1-2 columns
- Tablet: 3 columns
- Desktop: 4+ columns

---

### EffectsPanel

**Purpose**: Add and configure audio effects

**Props**:
```typescript
interface EffectsPanelProps {
  effects: EffectInstance[];
  onAdd: (type: string) => void;
  onUpdate: (effectId: string, settings: Partial<EffectSettings>) => void;
  onRemove: (effectId: string) => void;
  className?: string;
}
```

**Features**:
- Effect type selector
- Per-effect controls
- Bypass toggle
- Drag-to-reorder

**Accessibility**:
- Labeled controls
- Keyboard navigation
- Screen reader announcements

---

### ProjectBrowser

**Purpose**: View and manage projects

**Props**:
```typescript
interface ProjectBrowserProps {
  projects: ProjectMetadata[];
  onSelect: (projectId: string) => void;
  onCreate: () => void;
  onDelete: (projectId: string) => void;
  className?: string;
}
```

**Features**:
- Project cards with thumbnails
- Sort/filter options
- Search
- Create new button

**Accessibility**:
- List semantics
- Action buttons clearly labeled
- Confirmation for destructive actions

---

## Design System Integration

### Colors

Components use design tokens from `@echoforge/ui/design-tokens`:

```typescript
import { colors } from '@echoforge/ui';

// Primary: colors.primary[500]
// Accent: colors.accent[500]
// Background: colors.background
// Surface: colors.surface
```

### Typography

```typescript
import { typography } from '@echoforge/ui';

// Headings: typography.fontSize['2xl']
// Body: typography.fontSize.base
// Small: typography.fontSize.sm
```

### Spacing

```typescript
import { spacing } from '@echoforge/ui';

// Tight: spacing[2] (8px)
// Normal: spacing[4] (16px)
// Loose: spacing[8] (32px)
```

### Motion

```typescript
import { motion } from '@echoforge/ui';

// Fast transitions: motion.duration.fast (150ms)
// Normal: motion.duration.base (200ms)
// Slow: motion.duration.slow (300ms)
```

## Theming

### Dark Mode (Default)

```css
:root {
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-primary: #2196f3;
  --color-text: #ffffff;
}
```

### Light Mode (Future)

```css
:root[data-theme='light'] {
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-primary: #1976d2;
  --color-text: #212121;
}
```

## Responsive Breakpoints

```typescript
// Mobile: < 640px
// Tablet: 640px - 1024px
// Desktop: > 1024px

@media (min-width: 640px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

## Animation Guidelines

### Hover Effects

```css
.button {
  transition: background-color 150ms ease;
}

.button:hover {
  background-color: var(--color-primary-dark);
}
```

### Focus States

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Active States

```css
.pad-button.active {
  transform: scale(0.95);
  transition: transform 100ms ease;
}
```

## Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1
- [ ] Touch targets ≥ 44x44px
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Screen reader tested
- [ ] Semantic HTML
- [ ] Alt text for images
