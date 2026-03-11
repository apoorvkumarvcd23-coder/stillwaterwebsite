document.addEventListener('DOMContentLoaded', () => {
  // Drawer Menu Logic
  const menuBtn = document.querySelector('.menu-btn');
  const closeBtn = document.querySelector('.menu-drawer-close');
  const drawer = document.querySelector('.menu-drawer');
  
  if (menuBtn && closeBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });
    
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Sticky Header Logic
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Scroll Animations (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Run once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });

  // Cookie Consent Logic
  const initCookieConsent = () => {
    if (!localStorage.getItem('stillwater_cookie_consent')) {
      // Create banner dynamically
      const banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.innerHTML = `
        <div class="cookie-text">
          <strong style="color: var(--color-text-primary); display: block; margin-bottom: 0.25rem;">We respect your sanctuary.</strong>
          This website uses strictly necessary cookies (like express-session) to securely maintain your authentication state when accessing The Bridge and the Recovery Portal. By continuing or pressing "Accept Cookies", you consent to our use of these exact cookies.
        </div>
        <div class="cookie-buttons">
          <button id="btnAcceptCookies" class="btn btn-solid btn-cookie">Accept Cookies</button>
        </div>
      `;
      
      document.body.appendChild(banner);

      // Trigger animation after brief delay
      setTimeout(() => {
        banner.classList.add('show');
      }, 1000);

      // Handle Acceptance
      document.getElementById('btnAcceptCookies').addEventListener('click', () => {
        localStorage.setItem('stillwater_cookie_consent', 'true');
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 600); // Remove from DOM after animation
      });
    }
  };

  initCookieConsent();
});
