(function() {
  var STORAGE_KEY = 'cc-docs-levels';
  var LEVELS = ['beginner', 'intermediate', 'advanced'];

  function getState() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return 'all';
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyFilter(state) {
    // Find all h2 elements with data-level and wrap each section
    // (h2 + everything until the next h2) in show/hide logic
    var article = document.querySelector('article');
    if (!article) return;

    var children = Array.from(article.children);
    var currentLevel = null;

    children.forEach(function(el) {
      // Check if this is a leveled h2
      if (el.tagName === 'H2' && el.hasAttribute('data-level')) {
        currentLevel = el.getAttribute('data-level');
      } else if (el.tagName === 'H2') {
        // An h2 without data-level resets — always show
        currentLevel = null;
      } else if (el.tagName === 'H1') {
        currentLevel = null;
      }

      // Apply visibility
      if (currentLevel) {
        var show = (state === 'all' || state === currentLevel);
        el.style.display = show ? '' : 'none';
      }
    });
  }

  function updateButtons(state) {
    var allBtn = document.querySelector('.level-filter-btn[data-level="all"]');
    if (allBtn) {
      if (state === 'all') allBtn.classList.add('active');
      else allBtn.classList.remove('active');
    }

    LEVELS.forEach(function(level) {
      var btn = document.querySelector('.level-filter-btn[data-level="' + level + '"]');
      if (btn) {
        if (state === level) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var state = getState();
    applyFilter(state);
    updateButtons(state);

    document.querySelectorAll('.level-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var level = btn.getAttribute('data-level');

        if (state === level) {
          state = 'all';
        } else {
          state = level;
        }

        saveState(state);
        applyFilter(state);
        updateButtons(state);
      });
    });
  });
})();
