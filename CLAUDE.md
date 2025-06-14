# Claude Development Context (CLAUDE.md)

This file contains essential context and commands for Claude Code when working on the Steel Canvas Studio website.

## 🎯 Project Overview

**Project Type**: Static website for indie game development company
**Tech Stack**: HTML5, CSS3, JavaScript (Vanilla)
**Deployment**: Static site hosting (GitHub Pages, Netlify, Vercel)
**Repository**: Private GitHub repository

## 🛠 Development Commands

### Local Development
```bash
# Start local server for testing
python -m http.server 8000
# OR
npx serve .
# OR  
php -S localhost:8000

# Test site at http://localhost:8000
```

### Git Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit with proper format
git commit -m "type: brief description

- Detailed change 1
- Detailed change 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin main
```

### Testing & Validation
```bash
# No build process required - static files
# Validate HTML structure
npx html-validate *.html

# Check for broken links
npx broken-link-checker http://localhost:8000

# Performance testing
npx lighthouse http://localhost:8000 --output html --output-path ./lighthouse-report.html
```

## 📁 File Structure & Responsibilities

### Core Pages
- `index.html` - Homepage with hero, games showcase, contact
- `about.html` - Company story, mission, values, roadmap
- `games.html` - Game catalog and featured titles
- `brainrot-battle.html` - Featured game detailed page
- `news.html` - Development updates and announcements
- `community.html` - Social platforms and release timeline
- `support.html` - Patreon integration and funding transparency

### Legal Pages
- `privacy.html` - Privacy policy and data protection
- `terms.html` - Terms of service and user agreements
- `security.html` - Security practices and vulnerability reporting
- `copyright.html` - Intellectual property and DMCA
- `cookies.html` - Cookie policy and consent management
- `docs.html` - API documentation and developer resources
- `status.html` - System status and uptime monitoring

### Assets
- `styles.css` - Main stylesheet with responsive design
- `script.js` - JavaScript for interactive features
- `logo.png` - Company logo (used in header and favicon)
- `favicon.png` - Browser favicon

## 🎨 Design System

### Colors (CSS Custom Properties)
```css
:root {
  --primary-color: #C0C0C0;      /* Steel Grey */
  --secondary-color: #2d2d2d;    /* Deep Grey */
  --accent-color: #ff6b47;       /* Orange */
  --background-color: #1a1a1a;   /* Dark */
  --text-color: #f0f0f0;         /* Light Grey */
  --border-color: #444;          /* Medium Grey */
}
```

### Layout Components
- `.hero` - Full-width hero sections with call-to-action
- `.games` - Card grid layouts for content sections
- `.contact` - Contact and newsletter signup sections
- `.game-card` - Individual content cards
- `.game-button` - Primary and secondary button styles
- `.container` - Content width container (must wrap sections)

### Navigation Structure
```html
<nav>
  <div class="logo">
    <a href="/"><img src="logo.png" alt="Steel Canvas Studio Logo" class="logo-img">
    <h1>Steel Canvas Studio</h1></a>
  </div>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="about">About</a></li>
    <li><a href="games">Games</a></li>
    <li><a href="news">News</a></li>
    <li><a href="community">Community</a></li>
    <li><a href="support">Support</a></li>
  </ul>
</nav>
```

## 📝 Content Guidelines

### SEO Requirements
- Every page MUST have proper meta tags (title, description, keywords)
- Include Open Graph and Twitter Card meta tags
- Add JSON-LD structured data for rich snippets
- Use semantic HTML structure (header, main, section, footer)
- Include canonical URLs for all pages

### Content Standards
- **Company Name**: Steel Canvas Studio (never "Steel Canvas" alone)
- **Game Title**: Brainrot Battle (capitalize both words)
- **Release Dates**: 
  - Soft Release: July 10th, 2025 (UK, Canada, Australia)
  - Global Release: September 2025
- **Contact Email**: contact@steelcanvas.studio
- **Patreon**: https://www.patreon.com/SteelCanvasStudio

### Writing Style
- Professional but approachable tone
- Focus on player respect and innovative gaming
- Emphasize indie development values
- Include calls-to-action in hero sections
- Use consistent emoji icons throughout

## 🔧 Common Maintenance Tasks

### Adding New Content
1. **New Blog Post**: Add to `news.html` in the games-grid section
2. **New Game**: Create dedicated page and update `games.html`
3. **Social Media**: Update links in `community.html` and footer
4. **Support Tiers**: Modify Patreon section in `support.html`

### Updating Existing Content
1. **Release Dates**: Update in multiple files (index, games, community, news)
2. **Contact Info**: Update in footer across all pages
3. **Company Info**: Update `about.html` and meta descriptions
4. **Navigation**: Must update all pages when adding new sections

### Theme Consistency Rules
- Every page MUST use consistent hero section structure
- All content sections MUST be wrapped in `<div class="container">`
- Use `games` class for content grids, `contact` class for contact sections
- Maintain consistent button styles (`game-button`, `contact-button`)
- Follow the established card layout patterns

## 🚨 Critical Requirements

### Always Required
- **Container Wrapping**: All sections need `<div class="container">` wrapper
- **Responsive Design**: Test on mobile devices
- **Cross-page Consistency**: Navigation, footer, styling must match
- **Email Links**: Use proper mailto: format with subjects
- **External Links**: Include target="_blank" rel="noopener"

### Never Do
- Don't break the established design system
- Don't add external dependencies without discussion
- Don't remove SEO meta tags or structured data
- Don't use inconsistent naming or branding
- Don't create orphaned pages without navigation

## 📧 Contact Context

### Email Addresses by Purpose
- `contact@steelcanvas.studio` - General inquiries
- `press@steelcanvas.studio` - Press and media
- `feedback@steelcanvas.studio` - User feedback and beta testing
- `partnerships@steelcanvas.studio` - Business partnerships
- `community@steelcanvas.studio` - Community management
- `info@steelcanvas.studio` - Newsletter subscriptions

### Social Media Links
- **Patreon**: https://www.patreon.com/SteelCanvasStudio
- **Twitch**: https://www.twitch.tv/steelcanvas
- **Instagram**: https://www.instagram.com/steelcanvasstudio
- **TikTok**: https://www.tiktok.com/@steelcanvas
- **Twitter**: https://x.com/SteelCanvasDev
- **YouTube**: https://www.youtube.com/@steelcanvasstudio

## 🎮 Game-Specific Content

### Brainrot Battle Details
- **Genre**: Strategic crowd runner with depth
- **Platform**: Mobile (iOS, Android)
- **Unique Selling Point**: Combines casual accessibility with strategic gameplay
- **Theme**: Internet culture without talking down to players
- **Monetization**: Player-first, no dark patterns or predatory mechanics

### Development Philosophy
- Player respect over profit maximization
- Innovation through depth in casual games
- Community-driven development approach
- Transparency in business practices
- Quality over quantity in releases

## 📊 Analytics & Performance

### Key Metrics to Track
- Page load speeds (target: <3s)
- Mobile responsiveness scores
- SEO ranking for game development keywords
- Social media engagement from website traffic
- Newsletter signup conversion rates

### Performance Targets
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <3s
- **Cumulative Layout Shift**: <0.1
- **Lighthouse Score**: >90 for all categories

---

## 🤖 Claude Code Integration

This file serves as context for Claude Code development sessions. When working on this project:

1. **Always read this file first** to understand project structure
2. **Follow the established patterns** for consistency
3. **Test changes locally** before committing
4. **Use proper commit message format** as specified
5. **Maintain all SEO and accessibility standards**

### Useful Claude Code Commands
```bash
# Read project structure
ls -la

# Check current git status
git status

# Test site locally
python -m http.server 8000

# Validate recent changes
git diff HEAD~1

# Quick deploy test
git log --oneline -5
```

**Last Updated**: 2025-01-06
**Maintained By**: Claude Code AI Assistant
**Project Contact**: contact@steelcanvas.studio
ENDOFFILE < /dev/null
