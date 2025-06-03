# CSS Architecture Guide

## Overview
This document describes the CSS architecture and design system used in the Worldbuilder App.

## Design Philosophy
- **Dark Fantasy Theme**: Reflecting D&D aesthetics
- **Component-Based**: Reusable UI components
- **Utility-First**: Tailwind for rapid development
- **Performance**: Optimized animations and effects

## Architecture Layers

### 1. Design Tokens (`tokens.css`)
CSS variables defining core visual properties:
- Colors (primary, accents, semantic)
- Spacing scale
- Typography settings
- Shadows and effects
- Animation timings

### 2. Typography System (`typography.css`)
Pre-defined text styles:
- `.heading-1` through `.heading-3`
- `.body-text` and `.body-small`
- `.stat-text`, `.damage-text`, `.spell-text`
- `.narrative-text` for session summaries

### 3. Animation Library (`animations.css`)
Reusable animations:
- `glow-pulse`: Magical glow effect
- `fade-in`: Entrance animation
- `slide-up`: Content reveal
- `sparkle`: Magic sparkle effect
- `dice-roll`: Dice animation

### 4. Utility Classes (`utilities.css`)
Custom utilities for D&D theme:
- `.parchment`: Scroll-like containers
- `.border-glow`: Glowing borders
- `.session-card`: Card hover effects
- `.magic-sparkle`: Sparkle decorations

## Component Patterns

### Basic Component Structure
```tsx
import { cn } from '@/lib/utils'
import styles from './Component.module.css'

export function Component({ className, variant }) {
  return (
    <div className={cn(
      'base-tailwind-classes',
      styles.complexStyles,
      variant && styles[variant],
      className
    )}>
      {/* Content */}
    </div>
  )
}