# Otomono Jerseys - Design Rules & Style Guide

## 🎨 Brand Identity
**Theme**: ROG (Republic of Gamers) Gaming Aesthetic  
**Style**: Modern, Professional, Gaming-Inspired  
**Target**: Premium Custom Jersey Design Platform

---

## 🎯 Color Palette

### Primary Colors
- **ROG Red**: `#ff0037` - Primary brand color, buttons, accents
- **ROG Orange**: `#ff6b35` - Secondary accent, gradients
- **ROG Blue**: `#00d4ff` - Tertiary accent, highlights
- **ROG Purple**: `#8b5cf6` - Special effects, gradients

### Background Colors
- **ROG Dark**: `#000000` - Primary background
- **ROG Light**: `#1a1a1a` - Secondary background
- **ROG Gray**: `#333333` - Tertiary background, borders

### Text Colors
- **Primary Text**: `#ffffff` (white)
- **Secondary Text**: `#d1d5db` (gray-300)
- **Muted Text**: `#9ca3af` (gray-400)

---

## 🔤 Typography

### Font Families
```css
'rog-display': ['Orbitron', 'monospace']     /* Headers, titles */
'rog-heading': ['Exo 2', 'sans-serif']       /* Subheadings, buttons */
'rog-body': ['Roboto', 'sans-serif']          /* Body text, descriptions */
```

### Font Weights
- **Display**: 400, 500, 600, 700, 800, 900
- **Heading**: 300, 400, 500, 600, 700, 800, 900
- **Body**: 300, 400, 500, 700, 900

### Usage Guidelines
- **Display Font (Orbitron)**: Main titles, hero text, brand elements
- **Heading Font (Exo 2)**: Section headers, buttons, navigation
- **Body Font (Roboto)**: All body text, descriptions, content

---

## 🎭 Visual Effects

### Gradients
```css
/* Primary Button Gradient */
background: linear-gradient(135deg, #ff0037 0%, #ff6b35 50%, #00d4ff 100%);

/* Hero Background Gradient */
background: linear-gradient(135deg, #000000 0%, #1a1a1a 30%, #333333 70%, #000000 100%);

/* Text Gradient */
background: linear-gradient(to right, #ff0037, #ff6b35, #00d4ff);
```

### Glass Effects
```css
.glass-effect {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 0, 55, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Glow Effects
```css
.glow {
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
    animation: glow 2s ease-in-out infinite alternate;
}
```

---

## 🎬 Animations

### Keyframe Animations
```css
@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

@keyframes slideUp {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

@keyframes slideInLeft {
    0% { transform: translateX(-30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
    0% { transform: translateX(30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

@keyframes glow {
    0% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.5); }
    100% { box-shadow: 0 0 30px rgba(220, 38, 38, 0.8); }
}
```

### Animation Classes
- `animate-fade-in`: 0.6s ease-out
- `animate-slide-up`: 0.8s ease-out
- `animate-slide-in-left`: 0.8s ease-out
- `animate-slide-in-right`: 0.8s ease-out
- `animate-float`: 6s ease-in-out infinite
- `animate-glow`: 2s ease-in-out infinite alternate

---

## 🎨 Component Styles

### Buttons
```css
.rog-button {
    background: linear-gradient(135deg, #ff0037 0%, #ff6b35 50%, #00d4ff 100%);
    transition: all 0.3s ease;
    border: 1px solid #ff0037;
    box-shadow: 0 0 20px rgba(255, 0, 55, 0.3);
}

.rog-button:hover {
    background: linear-gradient(135deg, #ff6b35 0%, #ff0037 50%, #8b5cf6 100%);
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(255, 0, 55, 0.6);
    border-color: #00d4ff;
}
```

### Cards
```css
.jersey-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.jersey-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 50px rgba(255, 0, 55, 0.3), 0 0 30px rgba(0, 212, 255, 0.2);
}
```

### Headers
- Fixed positioning with glass effect
- ROG logo with consistent sizing
- Navigation with hover effects
- Mobile menu with slide-in animation

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Guidelines
- Hamburger menu with slide-in animation
- Touch-friendly button sizes (min 44px)
- Readable font sizes (min 16px)
- Proper spacing for touch interactions

---

## 🎯 Layout Principles

### Grid System
- Use Tailwind's grid system
- Consistent spacing with `space-y-*` and `gap-*`
- Responsive columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Spacing
- **Section Padding**: `py-20` (80px top/bottom)
- **Container Padding**: `px-4` (16px left/right)
- **Element Spacing**: `space-y-6` (24px between elements)

### Container Widths
- **Max Width**: `max-w-7xl` for main content
- **Centered**: `mx-auto` for center alignment
- **Responsive**: `container mx-auto px-4`

---

## 🎨 Visual Hierarchy

### Text Sizes
- **Hero Title**: `text-5xl md:text-7xl` (48px/56px)
- **Section Title**: `text-4xl md:text-6xl` (36px/48px)
- **Subsection Title**: `text-2xl md:text-3xl` (24px/30px)
- **Body Text**: `text-lg` (18px)
- **Small Text**: `text-sm` (14px)

### Font Weights
- **Hero**: `font-bold` (700)
- **Titles**: `font-bold` (700)
- **Subtitles**: `font-semibold` (600)
- **Body**: `font-normal` (400)

---

## 🎭 Interactive Elements

### Hover Effects
- **Buttons**: Scale up, glow enhancement
- **Cards**: Lift up, shadow increase
- **Links**: Color change to ROG red
- **Images**: Scale and overlay effects

### Transitions
- **Duration**: 0.3s for quick interactions
- **Easing**: `ease` for natural feel
- **Transform**: `translateY(-2px)` for lift effects

---

## 🎯 Content Guidelines

### Images
- **Hero Images**: Full-width, high quality
- **Product Images**: Consistent aspect ratios
- **Icons**: Font Awesome 6.4.0
- **Logos**: SVG preferred, PNG fallback

### Video
- **Background Videos**: Muted, autoplay, loop
- **Aspect Ratio**: 16:9 preferred
- **Format**: MP4 with WebM fallback

---

## 🎨 Brand Consistency

### Logo Usage
- **Size**: Consistent across all pages
- **Position**: Top-left in header
- **Spacing**: Proper margins and padding

### Navigation
- **Desktop**: Horizontal with hover effects
- **Mobile**: Slide-in menu
- **Active States**: ROG red color

### Footer
- **Background**: `bg-gray-900`
- **Text**: Consistent hierarchy
- **Links**: Hover effects with ROG red

---

## 🎯 Implementation Rules

### CSS Organization
1. **Tailwind Config**: Custom colors, fonts, animations
2. **Custom CSS**: Component-specific styles
3. **Responsive**: Mobile-first approach
4. **Performance**: Optimized animations

### JavaScript
- **Event Listeners**: Proper cleanup
- **Animations**: Smooth transitions
- **Mobile**: Touch-friendly interactions
- **Accessibility**: Keyboard navigation

---

## 🎨 Quality Standards

### Performance
- **Images**: Optimized and compressed
- **CSS**: Minified in production
- **JS**: Efficient event handling
- **Fonts**: Preloaded for speed

### Accessibility
- **Alt Text**: All images
- **ARIA Labels**: Interactive elements
- **Keyboard**: Full navigation support
- **Contrast**: WCAG AA compliant

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Fallbacks**: Graceful degradation

---

## 🎯 Maintenance

### Updates
- **Colors**: Update Tailwind config
- **Fonts**: Update font imports
- **Animations**: Test performance impact
- **Components**: Maintain consistency

### Testing
- **Cross-browser**: All major browsers
- **Responsive**: All device sizes
- **Performance**: Core Web Vitals
- **Accessibility**: Screen readers

---

*This design system ensures consistent, professional, and engaging user experience across the entire Otomono Jerseys platform.*
