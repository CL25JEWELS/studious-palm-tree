# UI/UX Design Map

## Overview

LoopPad's UI is designed with EDM producers and beat-makers in mind, featuring a dark, high-contrast interface with vibrant accent colors and immediate visual feedback.

## Design Principles

1. **Performance First**: All interactions feel instant
2. **Visual Feedback**: Every action provides immediate visual response
3. **Minimal Cognitive Load**: Clear hierarchy and grouping
4. **Touch-Friendly**: Large tap targets, swipe gestures
5. **Accessibility**: Keyboard shortcuts, screen reader support

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ┌────────┐                                         [Init]  │
│  │LoopPad │                                                  │
│  └────────┘                                                  │
├─────────────────────────────────────┬───────────────────────┤
│                                     │                       │
│  Main Content Area                  │  Sidebar              │
│  ┌───────────────────────────────┐  │  ┌─────────────────┐ │
│  │                               │  │  │ Sound Packs     │ │
│  │      Pad Grid (8x2/4x4)       │  │  │                 │ │
│  │                               │  │  │ ┌─────────────┐ │ │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐          │  │  │ │ 808 Kit     │ │ │
│  │  │01│ │02│ │03│ │04│          │  │  │ │             │ │ │
│  │  └──┘ └──┘ └──┘ └──┘          │  │  │ └─────────────┘ │ │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐          │  │  │                 │ │
│  │  │05│ │06│ │07│ │08│          │  │  │ ┌─────────────┐ │ │
│  │  └──┘ └──┘ └──┘ └──┘          │  │  │ │ Techno      │ │ │
│  │                               │  │  │ │             │ │ │
│  └───────────────────────────────┘  │  │ └─────────────┘ │ │
│                                     │  └─────────────────┘ │
│  ┌───────────────────────────────┐  │                       │
│  │ Transport Controls             │  │                       │
│  │  [▶] [⏹] [⏺]     [====] 120BPM│  │                       │
│  └───────────────────────────────┘  │                       │
└─────────────────────────────────────┴───────────────────────┘
```

## Components

### 1. Header

**Elements**:
- Logo/Branding
- Project name (editable)
- Initialization status indicator
- Settings menu (future)

**Colors**:
- Background: `#0a0a0f` (bg.primary)
- Text: Gradient cyan to magenta
- Status: `#00ff9f` (green) or `#ff0055` (red)

### 2. Pad Grid

**Layout Options**:
- 8-pad: 4x2 grid
- 16-pad: 4x4 grid

**Pad States**:
- **Idle**: Dark with colored border
- **Hover**: Fills with pad color
- **Active/Triggered**: Fills with pad color + glow effect
- **Muted**: Dimmed opacity
- **Solo**: Highlighted border

**Visual Elements**:
```
┌────────────────┐
│      01        │  ← Pad number
│   PAD NAME     │  ← Pad label
│                │
│   [waveform]   │  ← Visual indicator (future)
└────────────────┘
```

**Interactions**:
- Click/Tap: Trigger sound
- Long press: Open pad settings
- Drag: Adjust velocity
- Keyboard: Q,W,E,R,A,S,D,F... (mapped to pads)

**Colors**:
- Each pad has unique color from palette
- 16 vibrant colors for distinction
- Glow effect matches pad color

### 3. Transport Controls

**Layout**:
```
[PLAY] [STOP] [RECORD]  |  [TEMPO SLIDER] 120 BPM
  ▶      ⏹      ⏺       |   ───────○───    (numeric)
```

**Controls**:
- **Play/Pause**: Large cyan button (64px)
  - Playing: Yellow with glow
  - Paused: Cyan
- **Stop**: Medium red-bordered button (48px)
- **Record**: Medium red button (48px)
  - Recording: Filled with glow
  - Not recording: Outlined
- **Tempo Slider**: 60-200 BPM range
  - Cyan accent color
  - Live value display in monospace font

**Keyboard Shortcuts**:
- Space: Play/Pause
- Escape: Stop
- R: Record toggle
- ← →: Adjust tempo

### 4. Sound Pack Selector

**Layout**: Grid of cards

```
┌──────────────────┐
│ 808 Kit          │  ← Pack name
│                  │
│ Classic 808      │  ← Description
│ drum sounds      │
│                  │
│ 12 samples • DJ  │  ← Metadata
└──────────────────┘
```

**States**:
- **Unselected**: Dark background, no border
- **Hover**: Slightly elevated
- **Selected**: Cyan border + glow effect

**Metadata Displayed**:
- Pack name
- Description
- Sample count
- Author
- Tags (optional)
- Cover art (if available)

### 5. Pattern Sequencer (Future)

**Layout**: Step sequencer grid

```
    1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16
P1  [•] [ ] [ ] [ ] [•] [ ] [ ] [ ] [•] [ ] [ ] [ ] [•] [ ] [ ] [ ]
P2  [ ] [ ] [•] [ ] [ ] [ ] [•] [ ] [ ] [ ] [•] [ ] [ ] [ ] [•] [ ]
P3  [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
...
```

**Features**:
- Click to toggle steps
- Visual playhead indicator
- Color-coded per pad
- Copy/paste patterns

## Color System

### Background Layers
- **Primary**: `#0a0a0f` - Deep black-blue
- **Secondary**: `#141420` - Elevated surfaces
- **Tertiary**: `#1e1e2e` - Cards/panels

### UI Elements
- **Surface Default**: `#252535`
- **Surface Hover**: `#2f2f45`
- **Surface Active**: `#3a3a55`

### Accent Colors
- **Cyan**: `#00d9ff` - Primary actions
- **Magenta**: `#ff00ea` - Secondary actions
- **Yellow**: `#ffea00` - Warnings/playing state
- **Green**: `#00ff9f` - Success
- **Red**: `#ff0055` - Danger/recording

### Pad Colors (16)
Each pad gets a unique color for easy identification:
```
#ff0055  #ff3366  #ff6699  #9933ff
#6633ff  #3366ff  #0099ff  #00d9ff
#00ff9f  #00ff66  #66ff00  #ccff00
#ffea00  #ffaa00  #ff6600  #ff3300
```

## Typography

### Font Families
- **Primary**: System font stack (Helvetica, SF Pro, Segoe UI)
- **Mono**: SF Mono, Monaco (for BPM, timers)

### Font Sizes
- **XXL**: 32px - Headers
- **XL**: 24px - Section titles
- **LG**: 20px - Important values (BPM)
- **MD**: 16px - Body text
- **SM**: 14px - Labels
- **XS**: 12px - Metadata

### Font Weights
- **Bold**: 700 - Headers
- **Semibold**: 600 - Emphasis
- **Medium**: 500 - UI elements
- **Regular**: 400 - Body text

## Spacing System

- **XXL**: 48px - Section gaps
- **XL**: 32px - Component gaps
- **LG**: 24px - Large padding
- **MD**: 16px - Standard padding/gaps
- **SM**: 8px - Small padding
- **XS**: 4px - Minimal spacing

## Visual Effects

### Shadows
- **Small**: Subtle elevation
- **Medium**: Card elevation
- **Large**: Modal elevation
- **Glow**: Active state (color-matched)

### Transitions
- **Fast**: 150ms - Hover states
- **Normal**: 250ms - State changes
- **Slow**: 400ms - Major transitions

### Border Radius
- **SM**: 4px - Small elements
- **MD**: 8px - Standard elements
- **LG**: 12px - Large elements
- **Full**: 9999px - Circular buttons

## Responsive Breakpoints

- **Mobile**: < 768px
  - Stack layout vertically
  - 8-pad grid only
  - Simplified controls
  
- **Tablet**: 768px - 1024px
  - Two-column layout
  - 16-pad grid option
  - Full controls
  
- **Desktop**: > 1024px
  - Full layout with sidebar
  - 16-pad grid
  - All features visible

## Accessibility

### Keyboard Navigation
- Tab: Focus next element
- Shift+Tab: Focus previous
- Enter/Space: Activate button
- Arrow keys: Navigate pads
- Numbers: Trigger pads directly
- Keyboard shortcuts for all actions

### Screen Reader Support
- ARIA labels on all interactive elements
- Status announcements for playback
- Description of pad states
- BPM value announcements

### Color Contrast
- All text meets WCAG AA standards
- Borders provide additional visual cues
- Icons supplement color coding

### Focus Indicators
- Clear focus rings on all interactive elements
- High contrast focus states
- Logical tab order

## Animation States

### Pad Trigger
1. Rapid scale down (50ms)
2. Fill with color + glow
3. Scale back to normal (100ms)
4. Fade glow out (200ms)

### Button Press
1. Scale down (100ms)
2. Color shift
3. Scale back (100ms)

### Loading States
1. Skeleton screens for sound packs
2. Progress bars for sample loading
3. Spinner for initialization

## Mobile Optimizations

- **Touch Targets**: Minimum 44x44px
- **Swipe Gestures**: 
  - Swipe pad grid: Change bank
  - Swipe transport: Adjust tempo
- **Haptic Feedback**: Vibration on pad trigger
- **Screen Wake Lock**: Prevent sleep during use

## Error States

- **Initialization Failed**: Clear message + retry button
- **Sample Load Failed**: Show error on pack card
- **Audio Context Suspended**: Prompt user to interact
- **Browser Unsupported**: Feature detection + message

## Future Enhancements

1. **Waveform Display**: Visual representation on pads
2. **Effect Rack**: Visual effect chain builder
3. **Pattern Sequencer**: Step-by-step programming
4. **Mixer View**: Volume/pan controls per pad
5. **Social Features**: Share patterns, browse community
6. **Recording**: Capture and export performances
7. **Cloud Sync**: Save projects to cloud
8. **Collaboration**: Real-time multi-user editing
