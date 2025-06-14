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
        const elements = {
            menuBtn: SteelCanvasUtils.DOM.select('#mobileMenuBtn'),
            closeBtn: SteelCanvasUtils.DOM.select('#mobileCloseBtn'),
            overlay: SteelCanvasUtils.DOM.select('#mobileNavOverlay'),
            menu: SteelCanvasUtils.DOM.select('#mobileNavMenu'),
            links: SteelCanvasUtils.DOM.selectAll('.mobile-nav-links a')
        };

        // Bind event listeners
        MobileNavigation._bindEvents(elements);
    },

    /**
     * Open mobile navigation menu with accessibility support
     * @param {Object} elements - Navigation elements
     */
    open: (elements) => {
        if (elements.overlay && elements.menu) {
            elements.overlay.classList.add('active');
            elements.menu.classList.add('active');
            SteelCanvasUtils.UI.toggleBodyOverflow(true);
            
            // Update ARIA attributes for accessibility
            if (elements.menuBtn) elements.menuBtn.setAttribute('aria-expanded', 'true');
            if (elements.overlay) elements.overlay.setAttribute('aria-hidden', 'false');
            if (elements.menu) elements.menu.setAttribute('aria-hidden', 'false');
            
            // Focus management
            if (elements.closeBtn) elements.closeBtn.focus();
        }
    },

    /**
     * Close mobile navigation menu with accessibility support
     * @param {Object} elements - Navigation elements
     */
    close: (elements) => {
        if (elements.overlay && elements.menu) {
            elements.overlay.classList.remove('active');
            elements.menu.classList.remove('active');
            SteelCanvasUtils.UI.toggleBodyOverflow(false);
            
            // Update ARIA attributes for accessibility
            if (elements.menuBtn) elements.menuBtn.setAttribute('aria-expanded', 'false');
            if (elements.overlay) elements.overlay.setAttribute('aria-hidden', 'true');
            if (elements.menu) elements.menu.setAttribute('aria-hidden', 'true');
            
            // Return focus to menu button
            if (elements.menuBtn) elements.menuBtn.focus();
        }
    },

    /**
     * Bind all mobile navigation events
     * @param {Object} elements - Navigation elements
     * @private
     */
    _bindEvents: (elements) => {
        // Open menu button
        SteelCanvasUtils.DOM.addEvent(elements.menuBtn, 'click', (e) => {
            SteelCanvasUtils.Events.preventDefault(e);
            MobileNavigation.open(elements);
        });

        // Close menu button
        SteelCanvasUtils.DOM.addEvent(elements.closeBtn, 'click', (e) => {
            SteelCanvasUtils.Events.preventDefault(e);
            MobileNavigation.close(elements);
        });

        // Overlay click to close
        SteelCanvasUtils.DOM.addEvent(elements.overlay, 'click', (e) => {
            SteelCanvasUtils.Events.preventDefault(e);
            MobileNavigation.close(elements);
        });

        // Close menu when clicking navigation links
        elements.links.forEach(link => {
            SteelCanvasUtils.DOM.addEvent(link, 'click', () => {
                MobileNavigation.close(elements);
            });
        });

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

// Main Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize all modules
        MobileNavigation.init();
        SmoothScrolling.init();
        HeaderEffects.init();
        PageAnimations.init();

        // Log successful initialization in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Steel Canvas Studio website initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing Steel Canvas Studio website:', error);
    }
});