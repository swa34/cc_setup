(function() {
  var NAV_PAGES = [
    { id: 'getting-started', file: 'index.html', title: 'Getting Started', icon: '&#x1F680;' },
    { id: 'anatomy', file: 'anatomy.html', title: 'Anatomy of .claude/', icon: '&#x1F5C2;' },
    { id: 'core-workflows', file: 'core-workflows.html', title: 'Core Workflows', icon: '&#x2699;' },
    { id: 'claude-md', file: 'claude-md.html', title: 'CLAUDE.md Best Practices', icon: '&#x1F4DD;' },
    { id: 'token-management', file: 'token-management.html', title: 'Token Management', icon: '&#x1F4CA;' },
    { id: 'memory-system', file: 'memory-system.html', title: 'Memory System', icon: '&#x1F9E0;' },
    { id: 'hooks-skills', file: 'hooks-skills.html', title: 'Hooks, Skills & Plugins', icon: '&#x1F527;' },
    { id: 'legacy-codebases', file: 'legacy-codebases.html', title: 'Legacy Codebases', icon: '&#x1F3DB;' },
    { id: 'security', file: 'security.html', title: 'Security & Permissions', icon: '&#x1F512;' },
    { id: 'containers', file: 'containers.html', title: 'Containers & Isolation', icon: '&#x1F4E6;' },
    { id: 'team-workflows', file: 'team-workflows.html', title: 'Team Workflows & CI/CD', icon: '&#x1F465;' },
    { id: 'cost-optimization', file: 'cost-optimization.html', title: 'Cost Optimization', icon: '&#x1F4B0;' }
  ];

  function getCurrentPage() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '') path = 'index.html';
    return path;
  }

  function buildNav() {
    var nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    var currentPage = getCurrentPage();
    var html = '';

    NAV_PAGES.forEach(function(page) {
      var isActive = page.file === currentPage;
      html += '<a href="' + page.file + '" class="nav-link' + (isActive ? ' active' : '') + '" data-page="' + page.id + '">';
      html += '<span>' + page.icon + '</span>';
      html += '<span>' + page.title + '</span>';
      html += '</a>';

      // If active page, show section links
      if (isActive) {
        var sections = document.querySelectorAll('article h2[id]');
        if (sections.length > 0) {
          html += '<div class="nav-section-links">';
          sections.forEach(function(h2) {
            html += '<a href="#' + h2.id + '" class="nav-section-link" data-section="' + h2.id + '">';
            // Strip level badges from nav text
            var text = h2.textContent.replace(/beginner|intermediate|advanced/gi, '').trim();
            html += text;
            html += '</a>';
          });
          html += '</div>';
        }
      }
    });

    nav.innerHTML = html;

    // Build prev/next footer
    buildPageNav(currentPage);
  }

  function buildPageNav(currentPage) {
    var footer = document.getElementById('page-nav-footer');
    if (!footer) return;

    var idx = -1;
    NAV_PAGES.forEach(function(p, i) { if (p.file === currentPage) idx = i; });
    if (idx === -1) return;

    var html = '';
    if (idx > 0) {
      var prev = NAV_PAGES[idx - 1];
      html += '<a href="' + prev.file + '" class="page-nav-link prev">';
      html += '<span class="label">&larr; Previous</span>';
      html += '<span class="title">' + prev.title + '</span>';
      html += '</a>';
    } else {
      html += '<span></span>';
    }

    if (idx < NAV_PAGES.length - 1) {
      var next = NAV_PAGES[idx + 1];
      html += '<a href="' + next.file + '" class="page-nav-link next">';
      html += '<span class="label">Next &rarr;</span>';
      html += '<span class="title">' + next.title + '</span>';
      html += '</a>';
    }

    footer.innerHTML = html;
  }

  // Scroll spy for section links
  function setupScrollSpy() {
    var sections = document.querySelectorAll('article h2[id]');
    if (!sections.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var links = document.querySelectorAll('.nav-section-link');
          links.forEach(function(l) { l.classList.remove('active'); });
          var active = document.querySelector('.nav-section-link[data-section="' + entry.target.id + '"]');
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(function(s) { observer.observe(s); });
  }

  // Mobile toggle
  function setupMobile() {
    var toggle = document.getElementById('mobile-toggle');
    var sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking a nav link on mobile
    sidebar.addEventListener('click', function(e) {
      if (e.target.closest('.nav-link') && window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    buildNav();
    setupScrollSpy();
    setupMobile();
  });
})();
