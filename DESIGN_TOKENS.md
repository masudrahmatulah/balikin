# Balikin Design Tokens

## Color Palette

### Primary Colors
- **Primary Text**: `gray-900` (#111827) - Used for main headings
- **Secondary Text**: `gray-600` (#4b5563) - Used for body text
- **Muted Text**: `gray-500` (#6b7280) - Used for descriptions
- **Light Text**: `gray-400` (#9ca3af) - Used for subtitles

### Brand Colors
- **Brand Blue**: `blue-600` (#2563eb) - Primary brand color
- **Brand Blue Light**: `blue-50` (#eff6ff) - Background accents
- **Brand Blue Dark**: `blue-700` (#1d4ed8) - Hover states

### Accent Colors
- **Success Green**: `green-600` (#16a34a)
- **Warning Orange**: `orange-600` (#ea580c)
- **Danger Red**: `red-600` (#dc2626)
- **Purple**: `purple-600` (#9333ea)

### Background Gradients
- **Hero**: `from-blue-50 via-white to-white`
- **Pain Points**: `from-red-50 to-orange-50`
- **How It Works**: `from-white to-blue-50`
- **Comparison**: `from-gray-50 to-blue-50`
- **Benefits**: `from-blue-600 via-blue-700 to-purple-700`

## Typography Scale

### Headings
- **Hero H1**: `text-4xl md:text-6xl font-bold` (line-height: leading-tight)
- **Section H2**: `text-3xl md:text-4xl font-bold`
- **Card H3**: `text-xl font-bold`
- **Small H4**: `text-2xl md:text-3xl font-bold`

### Body Text
- **Large Body**: `text-xl md:text-2xl` (hero descriptions)
- **Standard Body**: `text-lg` (sub-descriptions)
- **Normal Body**: `text-base` (default)
- **Small Body**: `text-sm` (meta info)
- **Tiny Text**: `text-xs` (badges, captions)

### Font Weights
- **Bold**: `font-bold` (700) - Headings
- **Semibold**: `font-semibold` (600) - Emphasis
- **Medium**: `font-medium` (500) - Labels, badges
- **Normal**: Default (400) - Body text

## Spacing System

### Section Padding
- **Standard Section**: `py-16` (4rem)
- **Compact Section**: `py-12` (3rem)
- **Hero Section**: `py-16 md:py-24` (4rem / 6rem)

### Container
- **Horizontal Padding**: `px-4` (1rem)
- **Max Width - Small**: `max-w-3xl` (48rem)
- **Max Width - Medium**: `max-w-4xl` (56rem)
- **Max Width - Large**: `max-w-5xl` (64rem)
- **Max Width - XL**: `max-w-7xl` (80rem)

### Component Spacing
- **Gap - Small**: `gap-2` (0.5rem)
- **Gap - Medium**: `gap-4` (1rem)
- **Gap - Large**: `gap-6` (1.5rem)
- **Gap - XL**: `gap-8` (2rem)

### Margin/Padding
- **Small**: `mb-2` (0.5rem), `mb-4` (1rem)
- **Medium**: `mb-6` (1.5rem), `mb-8` (2rem)
- **Large**: `mb-10` (2.5rem), `mb-12` (3rem)

## Border & Radius

### Border Radius
- **Small**: `rounded` (0.25rem) - Badges, small elements
- **Medium**: `rounded-lg` (0.5rem) - Buttons, inputs
- **Large**: `rounded-xl` (0.75rem) - Cards
- **XL**: `rounded-2xl` (1rem) - Hero cards, featured elements
- **Full**: `rounded-full` - Circular elements, pills

### Border Width
- **Thin**: `border` (1px)
- **Medium**: `border-2` (2px) - Featured cards

### Border Colors
- **Default**: `border-gray-200`
- **Brand**: `border-blue-600`
- **Muted**: `border-gray-300`

## Shadow System

### Shadows
- **Small**: `shadow-sm` - Subtle elevation
- **Medium**: `shadow-md` - Standard cards
- **Large**: `shadow-lg` - Hover states
- **XL**: `shadow-xl` - Featured cards, modals
- **2XL**: `shadow-2xl` - Hero cards, CTAs

### Colored Shadows
- **Blue Shadow**: `shadow-blue-600/30` - Primary CTAs
- **Green Shadow**: `shadow-green-600/30` - Success actions
- **Purple Shadow**: `shadow-purple-600/30` - Premium features

## Component Patterns

### Cards
- **Standard Card**: `bg-white rounded-xl border border-gray-200 shadow-md`
- **Hover Card**: Add `hover:shadow-lg transition-shadow`
- **Featured Card**: `border-2 border-blue-600 shadow-xl shadow-blue-600/20`
- **Gradient Card**: `bg-gradient-to-br from-blue-50 to-purple-50`

### Buttons
- **Primary**: Default variant with `bg-blue-600`
- **Secondary**: `variant="outline"`
- **Ghost**: `variant="ghost"` for subtle actions
- **Sizes**: `size="lg"` for CTAs, default for standard

### Badges
- **Success**: `bg-green-100 text-green-700 px-3 py-1 rounded-full`
- **Info**: `bg-blue-100 text-blue-700 px-3 py-1 rounded-full`
- **Warning**: `bg-orange-100 text-orange-700 px-3 py-1 rounded-full`

## Animations

### Motion Components
- **Scroll Reveal**: Fade in with Y translation
- **Hover Effects**: Scale up on hover
- **Floating Elements**: Continuous Y translation
- **Pulse**: Scale animation for CTAs

### Animation Durations
- **Fast**: 0.3s - Button hovers
- **Medium**: 0.6s - Scroll reveals
- **Slow**: 2s - Floating elements

## Layout Patterns

### Grid Systems
- **2 Columns**: `grid md:grid-cols-2 gap-6`
- **3 Columns**: `grid md:grid-cols-3 gap-6`
- **4 Columns**: `grid md:grid-cols-2 lg:grid-cols-4 gap-6`

### Container Pattern
```tsx
<section className="container mx-auto px-4 py-16">
  <div className="max-w-4xl mx-auto">
    {/* Content */}
  </div>
</section>
```

## Icon Usage

### Icon Sizes
- **Small**: `h-4 w-4` - Inline with text
- **Medium**: `h-5 w-5` - Buttons, badges
- **Large**: `h-6 w-6` - Cards, headers
- **XL**: `h-8 w-8` - Featured icons
- **Hero**: `h-10 w-10` - Hero icons

### Icon Colors
- **Brand**: `text-blue-600`
- **Success**: `text-green-600`
- **Warning**: `text-orange-600`
- **Danger**: `text-red-600`
- **Muted**: `text-gray-500`

## Responsive Breakpoints

- **Mobile**: Default (0px+)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

## Special Effects

### Gradient Text
```tsx
className="gradient-text" // Defined in globals.css
```

### Glow Effect
```tsx
className="animate-glow-pulse shadow-xl shadow-blue-600/30"
```

### Hover Cards
```tsx
className="hover-card-effect" // Defined in globals.css
```
