# Steel Canvas Studio Website

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fsteelcanvas.studio)](https://steelcanvas.studio)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/built%20with-HTML%2FCSS%2FJS-blue.svg)](#tech-stack)
[![Visual Flow](https://img.shields.io/badge/UI-Visual%20Flow%20System-green.svg)](#visual-enhancements)

**Steel Canvas Studio** is an independent game development company crafting immersive gaming experiences. This repository contains the complete website featuring cutting-edge visual flow systems, seamless animations, and professional design patterns.

## 🎮 About Steel Canvas Studio

We're passionate about creating innovative gaming experiences that respect players while pushing the boundaries of interactive entertainment. Our debut title, **Pocket Legion**, launches July 10th, 2025 in select regions, with global release in September 2025.

## 🌟 Website Features

### Visual Flow System
- **Seamless Gradient Backgrounds** - Continuous transitions between sections
- **SVG Wave Dividers** - Organic flowing shapes between page sections
- **Glassmorphism Effects** - Modern translucent card designs with backdrop filters
- **Scroll-Triggered Animations** - Staggered reveals and smooth entrance effects
- **Floating Geometric Elements** - Subtle parallax animations and visual depth
- **Responsive Mobile Dropdown** - Clean hamburger menu with proper dropdown functionality

### Core Pages
- **Homepage** - Hero section with visual flow system, games showcase, and company introduction
- **About** - Company story, mission, values, and roadmap with animated sections
- **Games** - Detailed game information with enhanced card designs and release schedules
- **News** - Development updates and announcements with smooth animations
- **Community** - Social platform links and community guidelines
- **Support** - Patreon integration and funding transparency

### Legal & Compliance
- **Privacy Policy** - Data protection and privacy practices
- **Terms of Service** - Usage terms and conditions
- **Security** - Security practices and reporting
- **Copyright** - Intellectual property information
- **Cookie Policy** - Cookie usage and management
- **Documentation** - API and developer resources
- **Status** - System status and uptime monitoring

## 🛠 Tech Stack

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with custom properties (design tokens)
- **JavaScript (ES6+)**: Modular architecture with utility modules
- **Animation**: CSS keyframes, intersection observers, scroll-triggered effects

### Visual Enhancement Features
- **CSS Custom Properties**: Comprehensive design token system
- **Glassmorphism**: Backdrop-filter effects and translucent backgrounds
- **SVG Graphics**: Custom wave dividers and geometric elements
- **Responsive Design**: Mobile-first approach with performance optimizations
- **Accessibility**: ARIA attributes, reduced motion support, keyboard navigation

### Development & SEO
- **Clean URLs**: Extension-less navigation paths
- **SEO Optimization**: Structured data (JSON-LD), Open Graph, Twitter Cards
- **Performance**: Optimized animations, mobile-specific fallbacks
- **Analytics**: Ready for Google Analytics integration
- **Deployment**: Static site hosting compatible (GitHub Pages, Netlify, Vercel)

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- Web server (for local development)
- Git for version control

### Local Development
```bash
# Clone the repository
git clone https://github.com/SteelCanvas/steelcanvas-studio.git
cd steelcanvas-studio

# Serve locally (choose one method)
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

## ✨ Visual Enhancements

The Steel Canvas Studio website features a comprehensive visual flow system designed for modern web experiences:

### Animation System
- **Scroll-Triggered Reveals**: Elements animate into view as users scroll
- **Staggered Card Animations**: Sequential card reveals with smooth timing
- **Floating Parallax Elements**: Subtle background motion that responds to scroll
- **Micro-Interactions**: Button hover effects with ripple animations
- **Page Transitions**: Smooth navigation between sections

### Performance Optimizations
- **Mobile-First Approach**: Simplified animations on mobile devices
- **Reduced Motion Support**: Respects user accessibility preferences
- **Hardware Acceleration**: CSS transforms and GPU optimization
- **Intersection Observer**: Efficient scroll-triggered animation handling
- **Debounced Events**: Optimized scroll and resize event handling

### Browser Compatibility
- **Modern CSS Features**: Backdrop-filter, custom properties, grid layouts
- **Progressive Enhancement**: Graceful fallbacks for older browsers
- **Cross-Platform Testing**: Optimized for desktop, tablet, and mobile devices

## 📱 Page Structure

```
steelcanvas-studio/
├── index.html          # Homepage with visual flow system
├── about.html           # Company information with animations
├── games.html           # Games showcase with enhanced cards
├── pocket-legion.html   # Featured game detailed page
├── news.html            # News and updates with smooth animations
├── community.html       # Community platforms
├── support.html         # Support and funding
├── story.html           # Company origin story
├── careers.html         # Career opportunities
├── privacy.html         # Privacy policy
├── terms.html           # Terms of service
├── security.html        # Security information
├── copyright.html       # Copyright information
├── cookies.html         # Cookie policy
├── docs.html            # Documentation
├── status.html          # System status
├── styles.css           # Enhanced stylesheet with visual flow system
├── script.js            # Modular JavaScript with animation modules
├── logo.png             # Company logo
├── favicon.png          # Site favicon
├── CLAUDE.md            # Development context and guidelines
└── README.md            # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Steel Grey (#C0C0C0)
- **Secondary**: Deep Grey (#2d2d2d)
- **Accent**: Orange (#ff6b47)
- **Background**: Dark (#1a1a1a)
- **Text**: Light Grey (#f0f0f0)

### Visual Enhancement System
- **Gradient Flows**: Seamless background transitions between sections
- **Glassmorphism**: Translucent cards with backdrop-filter blur effects
- **Animation Timing**: Smooth cubic-bezier curves for professional motion
- **Typography Scale**: Consistent font sizing with CSS custom properties
- **Spacing System**: 8pt grid system with standardized spacing tokens
- **Shadow System**: Layered elevation system with glow effects

### Mobile Navigation
- **Dropdown Menu**: Professional dropdown from hamburger button
- **Touch Optimized**: 44px minimum touch targets for accessibility
- **Smooth Animations**: Fade and transform effects with proper timing
- **Click-Outside**: Intuitive menu closing behavior

## 📈 SEO & Analytics

### Implemented SEO Features
- **Meta Tags**: Title, description, keywords for all pages
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Structured Data**: JSON-LD for search engines
- **Canonical URLs**: Proper URL canonicalization

## 🔧 Development

### Updating Content
1. Edit HTML files directly for content changes
2. Modify styles.css for styling updates
3. Update script.js for interactive features

### Testing Commands
```bash
# No build process required - static HTML/CSS/JS
# Test locally with any web server

# Validate HTML
npx html-validate *.html

# Check links
npx broken-link-checker http://localhost:8000

# Performance testing
npx lighthouse http://localhost:8000
```

## 📞 Contact & Support

### Business Inquiries
- **Press**: press@steelcanvas.studio
- **Partnerships**: partnerships@steelcanvas.studio
- **General**: contact@steelcanvas.studio

## 📄 License

This project is private and proprietary to Steel Canvas Studio. All rights reserved.

## 📋 Changelog

### [Latest] - 2025-06-14
- **🎨 Visual Flow System Implementation**
  - Added seamless gradient background system with continuous transitions
  - Implemented SVG wave dividers between sections for organic flow
  - Created glassmorphism effects on all cards with backdrop-filter
  - Added scroll-triggered animations with staggered reveals
  - Integrated floating geometric elements with parallax motion

- **📱 Mobile Navigation Overhaul**
  - Converted slide-in sidebar to professional dropdown menu
  - Added click-outside functionality for intuitive UX
  - Implemented proper toggle behavior and smooth animations
  - Enhanced accessibility with ARIA attributes and keyboard support

- **🔧 Technical Improvements**
  - Removed .html extensions from all navigation links for clean URLs
  - Enhanced button interactions with ripple effects and micro-animations
  - Added comprehensive mobile optimizations for performance
  - Implemented reduced motion support for accessibility
  - Created modular JavaScript architecture with utility modules

### [Previous] - 2025-01-06
- Enhanced support page with additional funding options
- Fixed Patreon icon display in community section
- Removed "Legion" branding from community page
- Added comprehensive financial transparency section

### [Initial] - 2025-01-06
- Initial website creation with all core pages
- Implemented responsive design system
- Added SEO optimization and social media integration

---

**Steel Canvas Studio** - *Crafting Immersive Gaming Experiences*

For more information, visit [steelcanvas.studio](https://steelcanvas.studio)
ENDOFFILE < /dev/null
