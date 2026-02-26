/**
 * Hello World Enhanced UX Application
 * Interactive features including personalized greetings, theme toggling, and particle effects
 */

// ========================================
// Application State
// ========================================
const AppState = {
    theme: localStorage.getItem('theme') || 'dark',
    userName: '',
    particles: []
};

// ========================================
// DOM Elements
// ========================================
const DOM = {
    greeting: document.getElementById('greeting'),
    nameInput: document.getElementById('nameInput'),
    greetBtn: document.getElementById('greetBtn'),
    themeBtn: document.getElementById('themeBtn'),
    themeIcon: document.querySelector('.theme-icon'),
    particlesContainer: document.getElementById('particles')
};

// ========================================
// Theme Management
// ========================================
const ThemeManager = {
    init() {
        this.apply(AppState.theme);
        DOM.themeBtn.addEventListener('click', () => this.toggle());
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        DOM.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        AppState.theme = theme;
        localStorage.setItem('theme', theme);
    },

    toggle() {
        const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
        this.apply(newTheme);
        this.addTransitionEffect();
    },

    addTransitionEffect() {
        DOM.themeBtn.style.transform = 'rotate(360deg) scale(1.2)';
        setTimeout(() => {
            DOM.themeBtn.style.transform = '';
        }, 300);
    }
};

// ========================================
// Greeting Functionality
// ========================================
const GreetingManager = {
    greetings: [
        'Hello',
        'Hi',
        'Hey',
        'Welcome',
        'Greetings',
        'Howdy',
        'Hola',
        'Bonjour',
        'Ciao'
    ],

    init() {
        DOM.greetBtn.addEventListener('click', () => this.updateGreeting());
        DOM.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.updateGreeting();
            }
        });
    },

    updateGreeting() {
        const name = DOM.nameInput.value.trim();

        if (name) {
            AppState.userName = name;
            const randomGreeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
            this.animateGreetingChange(`${randomGreeting}, ${name}!`);
            this.createConfetti();
        } else {
            this.animateGreetingChange('Hello World!');
            this.shake(DOM.nameInput);
        }
    },

    animateGreetingChange(newText) {
        DOM.greeting.style.animation = 'none';
        setTimeout(() => {
            DOM.greeting.textContent = newText;
            DOM.greeting.style.animation = 'fadeInUp 0.5s ease-out';
        }, 50);
    },

    shake(element) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },

    createConfetti() {
        const confettiCount = 30;
        const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.opacity = '0.8';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '1000';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

                document.body.appendChild(confetti);

                const animation = confetti.animate([
                    {
                        transform: `translateY(0) rotate(0deg)`,
                        opacity: 0.8
                    },
                    {
                        transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 720}deg)`,
                        opacity: 0
                    }
                ], {
                    duration: 2000 + Math.random() * 1000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });

                animation.onfinish = () => confetti.remove();
            }, i * 50);
        }
    }
};

// ========================================
// Particle System
// ========================================
const ParticleSystem = {
    particleCount: 30,
    particles: [],

    init() {
        this.createParticles();
        this.animateParticles();
    },

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';

            DOM.particlesContainer.appendChild(particle);
            this.particles.push(particle);
        }
    },

    animateParticles() {
        // Particles are animated via CSS animations
        // This method can be extended for more complex interactions
    }
};

// ========================================
// Input Enhancement
// ========================================
const InputEnhancement = {
    init() {
        this.addFocusEffects();
        this.addAutoFocus();
    },

    addFocusEffects() {
        DOM.nameInput.addEventListener('focus', () => {
            DOM.nameInput.parentElement.style.transform = 'scale(1.02)';
        });

        DOM.nameInput.addEventListener('blur', () => {
            DOM.nameInput.parentElement.style.transform = '';
        });
    },

    addAutoFocus() {
        // Auto-focus on name input when page loads (after a short delay for better UX)
        setTimeout(() => {
            DOM.nameInput.focus();
        }, 500);
    }
};

// ========================================
// Accessibility Features
// ========================================
const AccessibilityManager = {
    init() {
        this.addKeyboardNavigation();
        this.addAriaLiveRegions();
    },

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Toggle theme with 't' key
            if (e.key === 't' || e.key === 'T') {
                if (document.activeElement !== DOM.nameInput) {
                    ThemeManager.toggle();
                }
            }
        });
    },

    addAriaLiveRegions() {
        // Add screen reader announcements
        const announcer = document.createElement('div');
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.className = 'sr-only';
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);

        // Announce theme changes
        const originalToggle = ThemeManager.toggle.bind(ThemeManager);
        ThemeManager.toggle = function() {
            originalToggle();
            announcer.textContent = `Theme changed to ${AppState.theme} mode`;
        };
    }
};

// ========================================
// Animation Utilities
// ========================================
const AnimationUtils = {
    init() {
        this.addHoverEffects();
        this.addEntranceAnimations();
    },

    addHoverEffects() {
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.animation = 'fadeInUp 0.6s ease-out forwards';
        });
    },

    addEntranceAnimations() {
        const elements = [
            { el: DOM.greeting.parentElement, delay: 0 },
            { el: document.querySelector('.subtitle'), delay: 0.1 },
            { el: document.querySelector('.interaction-section'), delay: 0.2 },
            { el: document.querySelector('.theme-toggle'), delay: 0.3 },
            { el: document.querySelector('.features'), delay: 0.4 }
        ];

        elements.forEach(({ el, delay }) => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    el.style.transition = 'all 0.6s ease-out';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay * 1000);
            }
        });
    }
};

// ========================================
// Performance Monitoring
// ========================================
const PerformanceMonitor = {
    init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
            });
        }
    }
};

// ========================================
// Application Initialization
// ========================================
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        console.log('🚀 Hello World Enhanced UX - Initializing...');

        // Initialize all modules
        ThemeManager.init();
        GreetingManager.init();
        ParticleSystem.init();
        InputEnhancement.init();
        AccessibilityManager.init();
        AnimationUtils.init();
        PerformanceMonitor.init();

        console.log('✨ Application ready!');
        console.log('💡 Tip: Press "T" to toggle theme');
    }
}

// ========================================
// Start Application
// ========================================
const app = new App();

// ========================================
// Add shake animation CSS dynamically
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ========================================
// Export for potential module usage
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, ThemeManager, GreetingManager, ParticleSystem };
}
