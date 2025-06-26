/**
 * Main JavaScript for Personal Portfolio
 * Handles theme switching, navigation, form submission, and animations
 */

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const backToTopBtn = document.querySelector('.back-to-top');
    const contactForm = document.getElementById('contact-form');
    const currentYear = document.getElementById('current-year');

    // Set current year in footer
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // ===== THEME TOGGLE =====
    if (themeToggle && themeIcon) {
        // Check for saved user preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

        // Apply the theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);

        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            updateMetaThemeColor(newTheme);
        });

        // Update theme icon based on current theme
        function updateThemeIcon(theme) {
            if (!themeIcon) return;
            const isDark = theme === 'dark';
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }

        // Update meta theme color for mobile browsers
        function updateMetaThemeColor(theme) {
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.content = theme === 'dark' ? '#121212' : '#ffffff';
            }
        }
    }

    // ===== MOBILE MENU TOGGLE =====
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('no-scroll');

            // Update ARIA attributes
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            navToggle.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
        });

        // Close menu when clicking on a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('no-scroll');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open menu');
            });
        });
    }

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            // Calculate the scroll position, accounting for fixed header
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update URL without page jump
            history.pushState(null, '', targetId);
        });
    });

    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    const sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        let scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight
            ) {
                document.querySelector(`.nav__link[href*="${sectionId}"]`).classList.add('active');
            } else {
                document.querySelector(`.nav__link[href*="${sectionId}"]`).classList.remove('active');
            }
        });
    }

    // Initial call
    highlightNav();

    // Debounce scroll event for better performance
    let isScrolling;
    window.addEventListener('scroll', () => {
        // Show/hide back to top button
        if (backToTopBtn) {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // Highlight active nav link
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(highlightNav, 100);
    }, { passive: true });

    // Back to top button
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===== CONTACT FORM HANDLING =====
    function mail() {

        if (contactForm) {
            contactForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const formData = new FormData(this);
                const submitButton = this.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;

                try {
                    // Disable submit button and show loading state
                    submitButton.disabled = true;
                    submitButton.innerHTML = 'Verzenden...';

                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    const result = await response.json();

                    if (response.ok) {
                        // Show success message
                        showNotification('Bericht succesvol verzonden! Ik neem zo snel mogelijk contact met je op.', 'success');
                        // Reset form
                        this.reset();
                    } else {
                        // Show error message
                        const errorMessage = result.message || 'Er is iets misgegaan. Probeer het later opnieuw.';
                        showNotification(errorMessage, 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Er is een fout opgetreden. Controleer je verbinding en probeer het opnieuw.', 'error');
                } finally {
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            });
        }
    }

    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    const animateOnScroll = () => {
        // Get all elements with animation classes
        const animatedElements = document.querySelectorAll(
            '.animate-fade-up, .animate-fade-left, .animate-fade-right, .animate-zoom'
        );

        // Add base animation class to all elements
        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
        });

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                const delay = parseInt(entry.target.dataset.animationDelay) || 0;

                if (entry.isIntersecting) {
                    // Add 'animated' class after a delay when element comes into view
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, delay);
                } else {
                    // Remove 'animated' class when element goes out of view
                    setTimeout(() => {
                        entry.target.classList.remove('animated');
                    }, delay);
                }
            });
        }, {
            root: null,
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe all animated elements
        animatedElements.forEach(element => {
            observer.observe(element);
        });

        return observer;
    };

    // Initialize animations
    const animationObserver = animateOnScroll();

    // Re-run animations when the page is resized (in case of layout shifts)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-initialize animations after resize
            if (animationObserver) {
                document.querySelectorAll('.animate-on-scroll').forEach(el => {
                    animationObserver.unobserve(el);
                    animationObserver.observe(el);
                });
            }
        }, 250);
    });

});

// Handle page load with hash in URL
window.addEventListener('load', function () {
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            // Small delay to ensure everything is loaded
            setTimeout(() => {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
});
