// Enhanced Main JavaScript for Thanaweya Results 2025
// Created by Marwan Abdelgaffar

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize all components
    initializeLanguageToggle();
    initializeSearchForm();
    initializeAnimations();
    initializeTheme();
    initializeAccessibility();
    
    // Add loading states
    addLoadingStates();
    
    // Initialize page-specific features
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeSearchPage();
            break;
        case 'result':
            initializeResultsPage();
            break;
        case 'student_details':
            initializeDetailsPage();
            break;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('/student/')) return 'student_details';
    if (path.includes('/result/')) return 'result';
    return 'index';
}

// Language Toggle Enhancement
function initializeLanguageToggle() {
    const languageToggle = document.querySelector('.language-toggle');
    if (!languageToggle) return;
    
    languageToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Add loading animation
        this.classList.add('loading');
        this.disabled = true;
        
        // Get current language
        const currentLang = document.documentElement.lang || 'ar';
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        
        // Smooth transition
        document.body.style.opacity = '0.7';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            // Navigate to toggle language route
            window.location.href = `/toggle-language/${currentLang}`;
        }, 300);
    });
}

// Enhanced Search Form
function initializeSearchForm() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#searchInput');
    const searchButton = document.querySelector('.search-btn');
    
    if (!searchForm || !searchInput || !searchButton) return;
    
    // Real-time validation
    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        const isValid = value.length > 0;
        
        // Update button state
        searchButton.disabled = !isValid;
        searchButton.classList.toggle('disabled', !isValid);
        
        // Visual feedback
        this.classList.toggle('valid', isValid);
        this.classList.toggle('invalid', !isValid && value.length > 0);
    });
    
    // Enhanced form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchValue = searchInput.value.trim();
        if (!searchValue) {
            showNotification('يرجى إدخال رقم الجلوس أو الاسم', 'error');
            return;
        }
        
        // Add loading state
        searchButton.classList.add('loading');
        searchButton.disabled = true;
        
        // Show loading animation
        showLoadingOverlay();
        
        // Submit form
        setTimeout(() => {
            this.submit();
        }, 500);
    });
    
    // Auto-focus on page load
    setTimeout(() => {
        searchInput.focus();
    }, 500);
}

// Search Page Specific
function initializeSearchPage() {
    const searchCard = document.querySelector('.search-card');
    if (searchCard) {
        // Add entrance animation
        setTimeout(() => {
            searchCard.classList.add('animate-in');
        }, 200);
    }
    
    // Add typing animation to placeholder
    animatePlaceholder();
}

// Results Page Specific
function initializeResultsPage() {
    const studentCards = document.querySelectorAll('.student-card');
    
    studentCards.forEach((card, index) => {
        // Staggered animation
        setTimeout(() => {
            card.classList.add('animate-in');
        }, index * 100);
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        // Click animation
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn')) return;
            
            // Ripple effect
            createRippleEffect(e, this);
            
            // Navigate after animation
            setTimeout(() => {
                const link = this.querySelector('.btn-primary');
                if (link) link.click();
            }, 200);
        });
    });
}

// Details Page Specific
function initializeDetailsPage() {
    // Animate progress bars and circles
    animateProgressElements();
    
    // Add celebration for high scores
    const percentage = parseFloat(document.querySelector('.percentage-main')?.textContent);
    if (percentage >= 85) {
        setTimeout(() => {
            createCelebrationEffect();
        }, 1500);
    }
    
    // Print functionality
    const printBtn = document.querySelector('[onclick="window.print()"]');
    if (printBtn) {
        printBtn.addEventListener('click', function(e) {
            e.preventDefault();
            preparePrintView();
            setTimeout(() => window.print(), 100);
        });
    }
}

// Animation Functions
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

function animateProgressElements() {
    // Animate score bar
    const scoreBar = document.querySelector('.score-fill');
    if (scoreBar) {
        const targetWidth = scoreBar.style.width;
        scoreBar.style.width = '0%';
        setTimeout(() => {
            scoreBar.style.width = targetWidth;
        }, 800);
    }
    
    // Animate circular progress
    const circleProgress = document.querySelector('.circle-fill');
    if (circleProgress) {
        const targetDash = circleProgress.getAttribute('stroke-dasharray');
        circleProgress.setAttribute('stroke-dasharray', '0, 100');
        setTimeout(() => {
            circleProgress.setAttribute('stroke-dasharray', targetDash);
        }, 1000);
    }
}

function animatePlaceholder() {
    const searchInput = document.querySelector('#searchInput');
    if (!searchInput) return;
    
    const placeholders = [
        'رقم الجلوس أو اسم الطالب',
        'مثال: 1001660',
        'مثال: محمد أحمد'
    ];
    
    let currentIndex = 0;
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % placeholders.length;
        searchInput.placeholder = placeholders[currentIndex];
    }, 3000);
}

// Visual Effects
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function createCelebrationEffect() {
    const celebration = document.createElement('div');
    celebration.innerHTML = '🎉🎊✨';
    celebration.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 3rem;
        animation: celebrate 3s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
        text-align: center;
    `;
    
    // Add celebration keyframes if not exists
    if (!document.querySelector('#celebration-styles')) {
        const style = document.createElement('style');
        style.id = 'celebration-styles';
        style.textContent = `
            @keyframes celebrate {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) scale(0) rotate(0deg);
                }
                25% {
                    opacity: 1;
                    transform: translateX(-50%) scale(1.2) rotate(180deg);
                }
                50% {
                    transform: translateX(-50%) scale(1) rotate(360deg);
                }
                75% {
                    transform: translateX(-50%) scale(1.1) rotate(540deg);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) scale(0.8) translateY(-100px) rotate(720deg);
                }
            }
            
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(celebration);
    
    setTimeout(() => celebration.remove(), 3000);
}

// Loading States
function addLoadingStates() {
    // Add loading styles if not exists
    if (!document.querySelector('#loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(102, 126, 234, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(10px);
            }
            
            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .btn.loading {
                position: relative;
                color: transparent !important;
            }
            
            .btn.loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .language-toggle.loading {
                opacity: 0.7;
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }
}

function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
    
    // Remove after 10 seconds max
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 10000);
}

// Theme and Accessibility
function initializeTheme() {
    // Add smooth transitions to all interactive elements
    const style = document.createElement('style');
    style.textContent = `
        * {
            transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

function initializeAccessibility() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // ESC key to go back
        if (e.key === 'Escape') {
            const backBtn = document.querySelector('.btn[href*="index"]');
            if (backBtn) backBtn.click();
        }
        
        // Enter key on cards
        if (e.key === 'Enter' && e.target.classList.contains('student-card')) {
            e.target.click();
        }
    });
    
    // Add focus indicators
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        .student-card:focus,
        .btn:focus,
        input:focus {
            outline: 2px solid #667eea;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#f44336' : '#4caf50'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function preparePrintView() {
    // Hide unnecessary elements for printing
    const elementsToHide = document.querySelectorAll('.details-actions, .language-toggle, footer');
    elementsToHide.forEach(el => {
        el.style.display = 'none';
    });
    
    // Restore after printing
    window.addEventListener('afterprint', () => {
        elementsToHide.forEach(el => {
            el.style.display = '';
        });
    });
}

// Performance Optimization
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

// Export for global access
window.ThanaweyaApp = {
    showNotification,
    createRippleEffect,
    createCelebrationEffect,
    showLoadingOverlay
};

