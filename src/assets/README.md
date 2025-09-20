# Assets Directory

This directory contains static assets for the NFTYield mini app.

## Structure

- `images/` - Image files (logos, icons, graphics)
- `icons/` - SVG icons and small graphics
- `fonts/` - Custom font files (if any)

## Usage

Import assets using the standard Next.js public folder or import statements:

```javascript
// For images in the public folder
<img src="/images/logo.png" alt="NFTYield Logo" />

// For imported assets
import Logo from '../assets/images/logo.svg';
```

## Guidelines

- Use SVG format for icons when possible
- Optimize images for web (WebP, compressed PNG/JPG)
- Follow consistent naming conventions
- Include alt text for accessibility