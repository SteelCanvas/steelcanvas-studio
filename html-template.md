# Steel Canvas Studio - HTML Template Standards

## Standard HTML Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Required Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Page Specific Meta Tags -->
    <title>[Page Title] - Steel Canvas Studio</title>
    <meta name="description" content="[Page specific description - 150-160 characters]">
    <meta name="keywords" content="[relevant keywords separated by commas]">
    <meta name="author" content="Steel Canvas Studio">
    <meta name="robots" content="index, follow">
    <meta name="language" content="en">
    <link rel="canonical" href="https://steelcanvas.studio/[page-url]">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://steelcanvas.studio/[page-url]">
    <meta property="og:title" content="[Page Title] - Steel Canvas Studio">
    <meta property="og:description" content="[Page specific description]">
    <meta property="og:image" content="https://steelcanvas.studio/logo.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Steel Canvas Studio [Page Context]">
    <meta property="og:site_name" content="Steel Canvas Studio">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://steelcanvas.studio/[page-url]">
    <meta property="twitter:title" content="[Page Title] - Steel Canvas Studio">
    <meta property="twitter:description" content="[Page specific description]">
    <meta property="twitter:image" content="https://steelcanvas.studio/logo.png">
    <meta property="twitter:image:alt" content="Steel Canvas Studio [Page Context]">
    <meta name="twitter:creator" content="@SteelCanvasDev">
    <meta name="twitter:site" content="@SteelCanvasDev">
    
    <!-- Favicons -->
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="apple-touch-icon" href="logo.png">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "[Schema Type - WebPage, AboutPage, Blog, etc.]",
        "name": "[Page Title]",
        "description": "[Page description]",
        "url": "https://steelcanvas.studio/[page-url]",
        "publisher": {
            "@type": "Organization",
            "name": "Steel Canvas Studio",
            "url": "https://steelcanvas.studio",
            "logo": "https://steelcanvas.studio/logo.png"
        }
    }
    </script>
</head>
<body>
    <!-- Standard Header -->
    <header>
        <nav>
            <div class="logo">
                <a href="/" aria-label="Steel Canvas Studio Homepage">
                    <img src="logo.png" alt="Steel Canvas Studio Logo" class="logo-img">
                    <h1>Steel Canvas Studio</h1>
                </a>
            </div>
            <ul class="nav-links" role="navigation" aria-label="Main navigation">
                <li><a href="/" class="[active if current page]">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="games.html">Games</a></li>
                <li><a href="news.html">News</a></li>
                <li><a href="community.html">Community</a></li>
                <li><a href="support.html">Support</a></li>
                <li><a href="careers.html">Careers</a></li>
            </ul>
            <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle mobile menu" aria-expanded="false">
                ☰
            </button>
        </nav>
        
        <!-- Mobile Navigation Overlay -->
        <div class="mobile-nav-overlay" id="mobileNavOverlay" role="dialog" aria-hidden="true"></div>
        
        <!-- Mobile Navigation Menu -->
        <div class="mobile-nav-menu" id="mobileNavMenu" role="dialog" aria-labelledby="mobile-nav-title" aria-hidden="true">
            <div class="mobile-nav-header">
                <div class="logo">
                    <a href="/" aria-label="Steel Canvas Studio Homepage">
                        <img src="logo.png" alt="Steel Canvas Studio Logo" class="logo-img">
                        <h1 id="mobile-nav-title">Steel Canvas Studio</h1>
                    </a>
                </div>
                <button class="mobile-close-btn" id="mobileCloseBtn" aria-label="Close mobile menu">
                    ✕
                </button>
            </div>
            <ul class="mobile-nav-links" role="navigation" aria-label="Mobile navigation">
                <li><a href="/" class="[active if current page]">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="games.html">Games</a></li>
                <li><a href="news.html">News</a></li>
                <li><a href="community.html">Community</a></li>
                <li><a href="support.html">Support</a></li>
                <li><a href="careers.html">Careers</a></li>
            </ul>
        </div>
    </header>

    <!-- Main Content -->
    <main role="main">
        <!-- Page specific content goes here -->
        <!-- Always wrap sections in .container for consistent layout -->
        <!-- Use semantic HTML5 elements: section, article, aside, etc. -->
    </main>

    <!-- Standard Footer -->
    <footer class="clean-footer" role="contentinfo">
        <div class="container">
            <h2>Steel Canvas Studio</h2>
            <p>Crafting immersive gaming experiences with passion and innovation.</p>
            <div class="footer-links" role="navigation" aria-label="Footer navigation">
                <a href="copyright.html">Copyright</a>
                <a href="terms.html">Terms</a>
                <a href="privacy.html">Privacy</a>
                <a href="security.html">Security</a>
                <a href="status.html">Status</a>
                <a href="docs.html">Docs</a>
                <a href="mailto:contact@steelcanvas.studio" aria-label="Send email to Steel Canvas Studio">Contact</a>
                <a href="cookies.html">Manage Cookies</a>
            </div>
            <p class="copyright">&copy; 2025 Steel Canvas Studio. All rights reserved.</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="script.js"></script>
</body>
</html>
```

## Accessibility Standards Checklist

### Required Attributes
- [ ] All images have descriptive `alt` attributes
- [ ] Form elements have associated `label` elements
- [ ] Interactive elements have focus states
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Touch targets are minimum 44x44 pixels
- [ ] Page has proper heading hierarchy (h1, h2, h3, etc.)

### ARIA Labels
- [ ] Navigation has `role="navigation"` and `aria-label`
- [ ] Main content has `role="main"`
- [ ] Footer has `role="contentinfo"`
- [ ] Modal elements have appropriate ARIA attributes
- [ ] Expandable elements have `aria-expanded`
- [ ] Hidden content has `aria-hidden="true"`

### Semantic HTML
- [ ] Use `<main>` for primary content
- [ ] Use `<nav>` for navigation areas
- [ ] Use `<article>` for standalone content
- [ ] Use `<section>` for thematic groupings
- [ ] Use `<aside>` for tangential content
- [ ] Use `<header>` and `<footer>` appropriately

## SEO Best Practices

### Meta Tags
- [ ] Unique, descriptive title tag (50-60 characters)
- [ ] Meta description (150-160 characters)
- [ ] Canonical URL specified
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags for Twitter sharing
- [ ] Appropriate schema.org structured data

### Content Structure
- [ ] One H1 per page
- [ ] Proper heading hierarchy
- [ ] Descriptive link text
- [ ] Image alt tags for SEO
- [ ] Clean, descriptive URLs

## Performance Considerations

### Images
- [ ] Optimize image file sizes
- [ ] Use appropriate image formats (WebP, AVIF when supported)
- [ ] Implement lazy loading for below-fold images
- [ ] Provide appropriate alt text

### Loading
- [ ] Minimize render-blocking resources
- [ ] Use efficient CSS and JavaScript
- [ ] Implement proper caching headers
- [ ] Monitor Core Web Vitals

## Component Usage Examples

### Standard Section
```html
<section class="bg-light">
    <div class="container">
        <h2 class="text-center mb-4">Section Title</h2>
        <div class="grid grid-auto-fit">
            <!-- Content -->
        </div>
    </div>
</section>
```

### Card Component
```html
<div class="card">
    <h3 class="text-primary mb-2">Card Title</h3>
    <p class="text-secondary mb-3">Card content description.</p>
    <a href="#" class="btn btn-primary">Action Button</a>
</div>
```

### Button Components
```html
<!-- Primary Button -->
<a href="#" class="btn btn-primary">Primary Action</a>

<!-- Secondary Button -->
<a href="#" class="btn btn-secondary">Secondary Action</a>

<!-- With Icon -->
<a href="mailto:contact@steelcanvas.studio" class="btn btn-primary">
    <span class="btn-icon">✉️</span>
    Contact Us
</a>
```

### Badge Components
```html
<!-- Primary Badge -->
<span class="badge badge-primary">Featured</span>

<!-- Accent Badge -->
<span class="badge badge-accent">New</span>
```