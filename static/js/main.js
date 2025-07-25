// Main JavaScript file for Thanaweya 2025 Results Portal
// Author: Marwan Yasser

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupLanguageToggle();
    setupFormValidation();
    setupAnimations();
    setupKeyboardNavigation();
    setupAccessibility();
}

// Language toggle functionality
function toggleLanguage() {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    
    // Add loading state
    const toggleButton = document.querySelector('.language-toggle');
    const originalContent = toggleButton.innerHTML;
    toggleButton.innerHTML = '<div class="loading"></div>';
    toggleButton.disabled = true;
    
    // Navigate to the same page with new language
    const currentPath = window.location.pathname;
    let newPath;
    
    if (currentPath === '/' || currentPath === '/ar' || currentPath === '/en') {
        newPath = `/${newLang}`;
    } else {
        // Handle result pages and other routes
        newPath = currentPath.replace(/\/(ar|en)/, `/${newLang}`);
    }
    
    // Smooth transition
    document.body.style.opacity = '0.7';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = newPath;
    }, 300);
}

// Setup language toggle
function setupLanguageToggle() {
    const toggleButton = document.querySelector('.language-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleLanguage);
    }
}

// Form validation and enhancement
function setupFormValidation() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchForm || !searchInput || !searchButton) return;
    
    // Real-time validation
    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        const isValid = value.length > 0;
        
        // Update button state
        searchButton.disabled = !isValid;
        searchButton.style.opacity = isValid ? '1' : '0.6';
        
        // Clear error styling
        if (this.style.borderColor === 'var(--error-color)') {
            this.style.borderColor = '';
        }
    });
    
    // Enhanced form submission
    searchForm.addEventListener('submit', function(e) {
        const value = searchInput.value.trim();
        
        if (!value) {
            e.preventDefault();
            showInputError(searchInput, 'يرجى إدخال رقم الجلوس أو الاسم');
            return;
        }
        
        // Validate input format
        if (value.length < 2) {
            e.preventDefault();
            showInputError(searchInput, 'يرجى إدخال قيمة صحيحة');
            return;
        }
        
        // Show loading state
        showLoadingState(searchButton);
    });
    
    // Auto-focus on page load
    searchInput.focus();
}

// Show input error
function showInputError(input, message) {
    input.style.borderColor = 'var(--error-color)';
    input.style.animation = 'shake 0.6s ease';
    input.focus();
    
    // Show tooltip or alert
    const currentLang = document.documentElement.lang;
    const errorMessage = currentLang === 'ar' ? message : 'Please enter a valid value';
    
    // Create temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.textContent = errorMessage;
    errorDiv.style.cssText = `
        position: absolute;
        background: var(--error-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    const inputGroup = input.closest('.input-group');
    inputGroup.style.position = 'relative';
    inputGroup.appendChild(errorDiv);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
        input.style.animation = '';
    }, 3000);
}

// Show loading state for button
function showLoadingState(button) {
    const currentLang = document.documentElement.lang;
    const loadingText = currentLang === 'ar' ? 'جاري البحث...' : 'Searching...';
    
    button.innerHTML = `
        <div class="loading"></div>
        ${loadingText}
    `;
    button.disabled = true;
    button.style.cursor = 'not-allowed';
}

// Setup animations and transitions
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.search-section, .result-section, .error-section');
    animatedElements.forEach(el => observer.observe(el));
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Keyboard navigation setup
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape key - go back to search
        if (e.key === 'Escape') {
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.click();
            }
        }
        
        // Enter key on language toggle
        if (e.key === 'Enter' && e.target.classList.contains('language-toggle')) {
            toggleLanguage();
        }
        
        // Ctrl/Cmd + K - focus search input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// Accessibility enhancements
function setupAccessibility() {
    // Add ARIA labels dynamically
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const currentLang = document.documentElement.lang;
        const ariaLabel = currentLang === 'ar' 
            ? 'أدخل رقم الجلوس أو اسم الطالب للبحث عن النتيجة'
            : 'Enter seat number or student name to search for results';
        searchInput.setAttribute('aria-label', ariaLabel);
    }
    
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('button, input, a, [tabindex]');
    focusableElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-color)';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
    
    // Announce page changes for screen readers
    announcePageChange();
}

// Announce page changes for screen readers
function announcePageChange() {
    const currentLang = document.documentElement.lang;
    let announcement = '';
    
    if (document.querySelector('.search-section')) {
        announcement = currentLang === 'ar' 
            ? 'صفحة البحث عن النتائج'
            : 'Results search page';
    } else if (document.querySelector('.result-section')) {
        announcement = currentLang === 'ar' 
            ? 'صفحة عرض النتيجة'
            : 'Result display page';
    } else if (document.querySelector('.error-section')) {
        announcement = currentLang === 'ar' 
            ? 'صفحة خطأ في البحث'
            : 'Search error page';
    }
    
    if (announcement) {
        // Create live region for screen readers
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        liveRegion.textContent = announcement;
        document.body.appendChild(liveRegion);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(liveRegion);
        }, 1000);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        });
    }
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    measurePerformance();
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleLanguage,
        setupFormValidation,
        setupAnimations,
        debounce,
        throttle
    };
}

