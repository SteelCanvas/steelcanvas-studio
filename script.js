document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    
    function openMobileMenu() {
        mobileNavOverlay.classList.add('active');
        mobileNavMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        mobileNavOverlay.classList.remove('active');
        mobileNavMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Mobile menu event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close mobile menu when clicking on navigation links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header background opacity on scroll
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    });
    
    // Simple animation for elements coming into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('.about, .games, .contact');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});