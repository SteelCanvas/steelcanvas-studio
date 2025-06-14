/**
 * Steel Canvas Studio - Website JavaScript Utilities
 * Professional modular JavaScript for enhanced user experience
 * @version 1.0.0
 * @author Steel Canvas Studio
 */

// Utility Functions Module
const SteelCanvasUtils = {
    /**
     * DOM Element Selection Utilities
     */
    DOM: {
        /**
         * Safe element selection with null checking
         * @param {string} selector - CSS selector
         * @returns {Element|null} Selected element or null
         */
        select: (selector) => {
            try {
                return document.querySelector(selector);
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return null;
            }
        },

        /**
         * Select multiple elements with error handling
         * @param {string} selector - CSS selector
         * @returns {NodeList|Array} Selected elements or empty array
         */
        selectAll: (selector) => {
            try {
                return document.querySelectorAll(selector) || [];
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return [];
            }
        },

        /**
         * Check if element exists
         * @param {Element} element - DOM element to check
         * @returns {boolean} True if element exists
         */
        exists: (element) => element !== null && element !== undefined,

        /**
         * Add event listener with error handling
         * @param {Element} element - Target element
         * @param {string} event - Event type
         * @param {Function} callback - Event callback
         * @param {Object} options - Event options
         */
        addEvent: (element, event, callback, options = {}) => {
            if (SteelCanvasUtils.DOM.exists(element)) {
                element.addEventListener(event, callback, options);
            }
        }
    },

    /**
     * Animation and Effects Utilities
     */
    Animation: {
        /**
         * Smooth scroll to element with offset
         * @param {Element} target - Target element
         * @param {number} offset - Offset in pixels (default: header height)
         */
        smoothScrollTo: (target, offset = null) => {
            if (!SteelCanvasUtils.DOM.exists(target)) return;

            const header = SteelCanvasUtils.DOM.select('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const scrollOffset = offset !== null ? offset : headerHeight;
            const targetPosition = target.offsetTop - scrollOffset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        },

        /**
         * Initialize intersection observer for element animations
         * @param {string} selector - Elements to observe
         * @param {Object} options - Observer options
         * @param {Function} callback - Custom callback function
         */
        initScrollAnimations: (selector, options = {}, callback = null) => {
            const defaultOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observerOptions = { ...defaultOptions, ...options };
            const elements = SteelCanvasUtils.DOM.selectAll(selector);

            if (elements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (callback) {
                            callback(entry.target);
                        } else {
                            // Default animation
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }
                    }
                });
            }, observerOptions);

            // Set initial styles and observe elements
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(element);
            });
        }
    },

    /**
     * User Interface Management
     */
    UI: {
        /**
         * Toggle element class with optional callback
         * @param {Element} element - Target element
         * @param {string} className - Class to toggle
         * @param {Function} callback - Optional callback function
         */
        toggleClass: (element, className, callback = null) => {
            if (!SteelCanvasUtils.DOM.exists(element)) return;

            element.classList.toggle(className);
            if (callback && typeof callback === 'function') {
                callback(element.classList.contains(className));
            }
        },

        /**
         * Show/hide body overflow for modal states
         * @param {boolean} hidden - True to hide overflow, false to show
         */
        toggleBodyOverflow: (hidden) => {
            document.body.style.overflow = hidden ? 'hidden' : '';
        },

        /**
         * Set dynamic header background based on scroll position
         * @param {Element} header - Header element
         * @param {number} threshold - Scroll threshold (default: 100px)
         */
        updateHeaderOnScroll: (header, threshold = 100) => {
            if (!SteelCanvasUtils.DOM.exists(header)) return;

            const scrollTop = window.pageYOffset;
            const background = scrollTop > threshold 
                ? 'rgba(0, 0, 0, 0.95)' 
                : 'rgba(0, 0, 0, 0.9)';
            
            header.style.background = background;
        }
    },

    /**
     * Event Handler Utilities
     */
    Events: {
        /**
         * Prevent default event behavior and stop propagation
         * @param {Event} event - Event object
         */
        preventDefault: (event) => {
            event.preventDefault();
            event.stopPropagation();
        },

        /**
         * Debounce function to limit event firing
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @param {boolean} immediate - Execute immediately on first call
         * @returns {Function} Debounced function
         */
        debounce: (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        }
    }
};

// Mobile Navigation Module
const MobileNavigation = {
    /**
     * Initialize mobile navigation functionality
     */
    init: () => {
        console.log('MobileNavigation.init() called'); // Debug log
        
        // Test basic DOM access first
        console.log('Testing DOM access...');
        const testBtn = document.querySelector('#mobileMenuBtn');
        const testMenu = document.querySelector('#mobileNavMenu');
        console.log('Direct querySelector results:', { testBtn, testMenu });
        
        const elements = {
            menuBtn: SteelCanvasUtils.DOM.select('#mobileMenuBtn'),
            menu: SteelCanvasUtils.DOM.select('#mobileNavMenu'),
            links: SteelCanvasUtils.DOM.selectAll('.mobile-nav-links a')
        };

        console.log('Found elements via utils:', elements); // Debug log

        // Only bind events if elements exist
        if (elements.menuBtn && elements.menu) {
            console.log('Binding mobile navigation events...'); // Debug log
            MobileNavigation._bindEvents(elements);
        } else {
            console.error('Mobile navigation elements not found!', {
                menuBtn: !!elements.menuBtn,
                menu: !!elements.menu,
                menuBtnExists: !!testBtn,
                menuExists: !!testMenu
            }); // Debug log
            
            // Fallback: Try direct binding if elements exist
            if (testBtn && testMenu) {
                console.log('Attempting fallback direct binding...');
                testBtn.addEventListener('click', (e) => {
                    console.log('Direct button click!');
                    e.preventDefault();
                    e.stopPropagation();
                    testMenu.classList.toggle('active');
                    console.log('Toggled active class, menu now has active:', testMenu.classList.contains('active'));
                });
            }
        }
    },

    /**
     * Open mobile navigation dropdown with accessibility support
     * @param {Object} elements - Navigation elements
     */
    open: (elements) => {
        console.log('Opening mobile menu...', elements.menu); // Debug log
        if (elements.menu) {
            elements.menu.classList.add('active');
            console.log('Added active class to menu'); // Debug log
            
            // Update ARIA attributes for accessibility
            if (elements.menuBtn) elements.menuBtn.setAttribute('aria-expanded', 'true');
            if (elements.menu) elements.menu.setAttribute('aria-hidden', 'false');
            
            // Add click-outside listener to close menu
            setTimeout(() => {
                document.addEventListener('click', MobileNavigation._handleClickOutside);
            }, 10);
        } else {
            console.error('Mobile menu element not found!'); // Debug log
        }
    },

    /**
     * Close mobile navigation dropdown with accessibility support
     * @param {Object} elements - Navigation elements
     */
    close: (elements) => {
        if (elements.menu) {
            elements.menu.classList.remove('active');
            
            // Update ARIA attributes for accessibility
            if (elements.menuBtn) elements.menuBtn.setAttribute('aria-expanded', 'false');
            if (elements.menu) elements.menu.setAttribute('aria-hidden', 'true');
            
            // Remove click-outside listener
            document.removeEventListener('click', MobileNavigation._handleClickOutside);
        }
    },

    /**
     * Toggle mobile navigation menu state
     * @param {Object} elements - Navigation elements
     */
    toggle: (elements) => {
        console.log('Toggle function called!'); // Debug log
        const isOpen = elements.menu && elements.menu.classList.contains('active');
        console.log('Menu is currently open:', isOpen); // Debug log
        
        if (isOpen) {
            console.log('Closing menu...'); // Debug log
            MobileNavigation.close(elements);
        } else {
            console.log('Opening menu...'); // Debug log
            MobileNavigation.open(elements);
        }
    },

    /**
     * Handle clicks outside the mobile menu to close it
     * @param {Event} e - Click event
     */
    _handleClickOutside: (e) => {
        const menu = SteelCanvasUtils.DOM.select('#mobileNavMenu');
        const menuBtn = SteelCanvasUtils.DOM.select('#mobileMenuBtn');
        
        if (menu && menuBtn && 
            !menu.contains(e.target) && 
            !menuBtn.contains(e.target) && 
            menu.classList.contains('active')) {
            
            const elements = {
                menuBtn: menuBtn,
                menu: menu
            };
            MobileNavigation.close(elements);
        }
    },

    /**
     * Bind all mobile navigation events
     * @param {Object} elements - Navigation elements
     * @private
     */
    _bindEvents: (elements) => {
        // Menu toggle button
        if (elements.menuBtn) {
            console.log('Binding click event to menu button'); // Debug log
            SteelCanvasUtils.DOM.addEvent(elements.menuBtn, 'click', (e) => {
                console.log('Menu button clicked!'); // Debug log
                SteelCanvasUtils.Events.preventDefault(e);
                e.stopPropagation();
                MobileNavigation.toggle(elements);
            });
        } else {
            console.error('Menu button not found for event binding!'); // Debug log
        }

        // Close menu when clicking navigation links
        if (elements.links && elements.links.length > 0) {
            elements.links.forEach(link => {
                SteelCanvasUtils.DOM.addEvent(link, 'click', () => {
                    MobileNavigation.close(elements);
                });
            });
        }

        // Close menu on escape key
        SteelCanvasUtils.DOM.addEvent(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                MobileNavigation.close(elements);
            }
        });
    }
};

// Smooth Scrolling Module
const SmoothScrolling = {
    /**
     * Initialize smooth scrolling for anchor links
     */
    init: () => {
        const anchorLinks = SteelCanvasUtils.DOM.selectAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            SteelCanvasUtils.DOM.addEvent(link, 'click', (e) => {
                SteelCanvasUtils.Events.preventDefault(e);
                
                const targetId = link.getAttribute('href');
                const targetSection = SteelCanvasUtils.DOM.select(targetId);
                
                if (targetSection) {
                    SteelCanvasUtils.Animation.smoothScrollTo(targetSection);
                }
            });
        });
    }
};

// Header Scroll Effects Module
const HeaderEffects = {
    /**
     * Initialize header scroll effects
     */
    init: () => {
        const header = SteelCanvasUtils.DOM.select('header');
        if (!header) return;

        const debouncedScrollHandler = SteelCanvasUtils.Events.debounce(() => {
            SteelCanvasUtils.UI.updateHeaderOnScroll(header);
        }, 10);

        SteelCanvasUtils.DOM.addEvent(window, 'scroll', debouncedScrollHandler);
    }
};

// Page Animations Module
const PageAnimations = {
    /**
     * Initialize page load animations
     */
    init: () => {
        // Animate main sections on scroll
        SteelCanvasUtils.Animation.initScrollAnimations('.about, .games, .contact');
        
        // Animate cards and other elements
        SteelCanvasUtils.Animation.initScrollAnimations('.game-card, .news-card, .platform-card', {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });
    }
};

// Visual Flow Effects Module
const VisualFlowEffects = {
    /**
     * Initialize visual flow system
     */
    init: () => {
        VisualFlowEffects.setupScrollAnimations();
        VisualFlowEffects.setupStaggeredAnimations();
        VisualFlowEffects.setupParallaxElements();
    },

    /**
     * Setup enhanced scroll-triggered animations
     */
    setupScrollAnimations: () => {
        // Skip animations if user prefers reduced motion or on mobile
        if (VisualFlowEffects.respectsReducedMotion() || window.innerWidth <= 768) return;
        
        const elements = SteelCanvasUtils.DOM.selectAll('.game-card, .contact-card, .news-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-on-scroll', 'animate');
                    }, index * 100); // Staggered delay
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    },

    /**
     * Setup staggered card animations
     */
    setupStaggeredAnimations: () => {
        const gameGrids = SteelCanvasUtils.DOM.selectAll('.games-grid');
        
        gameGrids.forEach(grid => {
            const cards = grid.querySelectorAll('.game-card');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                                card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                            }, index * 150);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            // Initially hide cards
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
            });

            observer.observe(grid);
        });
    },

    /**
     * Setup floating parallax elements
     */
    setupParallaxElements: () => {
        // Skip parallax on mobile devices for performance
        if (window.innerWidth <= 768) return;
        
        const floatingElements = SteelCanvasUtils.DOM.selectAll('.floating-circle');
        
        if (floatingElements.length === 0) return;

        const handleScroll = SteelCanvasUtils.Events.debounce(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.3;
                element.style.transform = `translateY(${rate * speed}px)`;
            });
        }, 10);

        SteelCanvasUtils.DOM.addEvent(window, 'scroll', handleScroll);
    },

    /**
     * Check if device prefers reduced motion
     */
    respectsReducedMotion: () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

// Ultra-Simple Mobile Navigation (Primary System)
(function() {
    console.log('🚀 MOBILE NAV: Starting setup...');
    
    function createMobileNav() {
        const btn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileNavMenu');
        
        if (!btn || !menu) {
            console.error('❌ Mobile nav elements missing');
            return;
        }
        
        console.log('✅ Elements found, setting up...');
        
        // Clear any existing handlers
        btn.onclick = null;
        
        // Simple toggle function
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = menu.classList.contains('active');
            console.log('🔄 Toggling menu from', isOpen ? 'OPEN' : 'CLOSED');
            
            if (isOpen) {
                menu.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-hidden', 'true');
            } else {
                menu.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
                menu.setAttribute('aria-hidden', 'false');
            }
        };
        
        // Close on outside click
        document.onclick = function(e) {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-hidden', 'true');
            }
        };
        
        // Close on nav link click
        const links = menu.querySelectorAll('a');
        links.forEach(link => {
            link.onclick = function() {
                menu.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-hidden', 'true');
            };
        });
        
        console.log('🎯 Mobile navigation ready!');
    }
    
    // Test function for debugging
    window.testMobileMenu = function() {
        const menu = document.getElementById('mobileNavMenu');
        if (menu) {
            menu.classList.add('active');
            console.log('🧪 TEST: Menu forced open');
        }
    };
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createMobileNav);
    } else {
        createMobileNav();
    }
})();

// Simple Mobile Navigation (Fallback)
function initSimpleMobileNav() {
    console.log('Initializing simple mobile navigation...');
    
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileNavMenu');
    
    console.log('Simple nav elements:', { mobileBtn, mobileMenu });
    
    if (mobileBtn && mobileMenu) {
        console.log('Setting up simple mobile navigation...');
        
        mobileBtn.addEventListener('click', function(e) {
            console.log('Simple mobile button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = mobileMenu.classList.contains('active');
            console.log('Menu currently active:', isActive);
            
            if (isActive) {
                mobileMenu.classList.remove('active');
                mobileBtn.setAttribute('aria-expanded', 'false');
                console.log('Menu closed');
            } else {
                mobileMenu.classList.add('active');
                mobileBtn.setAttribute('aria-expanded', 'true');
                console.log('Menu opened');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when clicking nav links
        const navLinks = mobileMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileBtn.setAttribute('aria-expanded', 'false');
            });
        });
        
        console.log('Simple mobile navigation setup complete!');
    } else {
        console.error('Simple mobile nav elements not found!');
    }
}

// Main Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize simple mobile navigation first
        initSimpleMobileNav();
        
        // Initialize other modules
        MobileNavigation.init();
        SmoothScrolling.init();
        HeaderEffects.init();
        PageAnimations.init();
        VisualFlowEffects.init();

        // Log successful initialization in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Steel Canvas Studio website initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing Steel Canvas Studio website:', error);
    }
});