const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const savePreference = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        return false;
    }
    return true;
};

function initTheme() {
    const themeToggle = qs('.theme-toggle');
    if (!themeToggle) return;

    const icon = qs('i', themeToggle);
    const setTheme = (theme) => {
        document.documentElement.dataset.theme = theme;
        savePreference('theme', theme);
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    };

    const currentTheme = document.documentElement.dataset.theme || 'light';
    setTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
}

function initTypingText() {
    const typingText = qs('.typing-text');
    if (!typingText || prefersReducedMotion) return;

    const phrases = [
        'Innovator by Heart, Coder by Passion',
        'Software Developer',
        'Full-Stack Developer',
        'Competitive Programmer',
        'Problem Solver'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const phrase = phrases[phraseIndex];
        typingText.textContent = phrase.slice(0, charIndex);

        if (!deleting && charIndex < phrase.length) {
            charIndex++;
        } else if (deleting && charIndex > 0) {
            charIndex--;
        } else if (!deleting) {
            deleting = true;
            setTimeout(tick, 1300);
            return;
        } else {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }

        setTimeout(tick, deleting ? 45 : 80);
    };

    tick();
}

function initSmoothNavigation() {
    const navbar = qs('.navbar');
    const navLinks = qs('.nav-links');
    const menuButton = qs('.mobile-menu-btn');
    const links = qsa('.nav-links a, .hero-buttons a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href) return;
            const target = qs(href);
            if (!target) return;

            event.preventDefault();
            navLinks?.classList.remove('active');
            menuButton?.setAttribute('aria-expanded', 'false');
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
    });

    menuButton?.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.innerHTML = `<i class="fas ${isOpen ? 'fa-times' : 'fa-bars'}"></i>`;
    });

    document.addEventListener('click', (event) => {
        if (!navbar?.contains(event.target)) {
            navLinks?.classList.remove('active');
            menuButton?.setAttribute('aria-expanded', 'false');
            if (menuButton) menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

function initScrollAnimations() {
    const animatedElements = qsa('section h2, .hero-content, .hero-visual, .about-description, .about-details .detail, .about-image, .project-card, .skill-category, .skill-card, .timeline-item, .contact-content');
    animatedElements.forEach((element, index) => {
        element.classList.add('reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 80}ms`);
    });

    if (prefersReducedMotion) {
        animatedElements.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16, rootMargin: '0px 0px -80px 0px' });

    animatedElements.forEach((element) => observer.observe(element));
}

function initActiveNav() {
    const sections = qsa('section[id]');
    const navItems = qsa('.nav-links a');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navItems.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { threshold: 0.45 });

    sections.forEach((section) => observer.observe(section));
}

function initTiltCards() {
    if (prefersReducedMotion || matchMedia('(pointer: coarse)').matches) return;

    qsa('[data-tilt], .project-card, .skill-card, .detail').forEach((card) => {
        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.setProperty('--rotate-x', `${y * -10}deg`);
            card.style.setProperty('--rotate-y', `${x * 10}deg`);
            card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`);
            card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rotate-x', '0deg');
            card.style.setProperty('--rotate-y', '0deg');
        });
    });
}

function initMagneticButtons() {
    if (prefersReducedMotion || matchMedia('(pointer: coarse)').matches) return;

    qsa('.cta-button, .resume-btn, .project-link, .submit-btn, .social-link').forEach((button) => {
        button.classList.add('magnetic');
        button.addEventListener('mousemove', (event) => {
            const rect = button.getBoundingClientRect();
            const x = (event.clientX - rect.left - rect.width / 2) * 0.22;
            const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
            button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

function initCursorGlow() {
    const cursor = qs('.cursor-glow');
    if (!cursor || prefersReducedMotion || matchMedia('(pointer: coarse)').matches) return;

    window.addEventListener('pointermove', (event) => {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
}

function initParallax() {
    if (prefersReducedMotion) return;
    const hero = qs('.hero');
    const visual = qs('.hero-visual');
    const particles = qsa('.hero-particles span');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const offset = window.scrollY;
        if (offset > window.innerHeight) return;
        if (visual) visual.style.setProperty('--parallax-y', `${offset * 0.08}px`);
        particles.forEach((particle, index) => {
            particle.style.transform = `translate3d(0, ${offset * (0.04 + index * 0.015)}px, 0)`;
        });
    }, { passive: true });
}

function initSkillBars() {
    const skillCards = qsa('.skill-card');
    skillCards.forEach((card, index) => {
        if (qs('.skill-meter', card)) return;
        const meter = document.createElement('div');
        meter.className = 'skill-meter';
        meter.innerHTML = `<span style="--skill-level: ${78 + (index % 5) * 4}%"></span>`;
        qs('.skill-info', card)?.appendChild(meter);
    });
}

function initReadMore() {
    qsa('.read-more').forEach((button) => {
        button.addEventListener('click', () => {
            const skillCard = button.closest('.skill-card');
            skillCard.classList.toggle('expanded');
            const expanded = skillCard.classList.contains('expanded');
            button.innerHTML = `${expanded ? 'Read Less' : 'Read More'} <i class="fas fa-chevron-${expanded ? 'up' : 'down'}"></i>`;
        });
    });
}

function initContactForm() {
    const form = qs('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const button = qs('.submit-btn', form);
        const status = qs('.form-status', form);
        button.classList.add('is-sent');
        button.innerHTML = '<i class="fas fa-check"></i> Message Ready';
        status.textContent = 'Thanks for reaching out. You can also email me directly at bhardwajshubhankit@gmail.com.';
        form.reset();

        setTimeout(() => {
            button.classList.remove('is-sent');
            button.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
        }, 2600);
    });
}

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTypingText();
    initSmoothNavigation();
    initScrollAnimations();
    initActiveNav();
    initSkillBars();
    initTiltCards();
    initMagneticButtons();
    initCursorGlow();
    initParallax();
    initReadMore();
    initContactForm();
});
