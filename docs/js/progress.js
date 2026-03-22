(function() {
  var STORAGE_KEY = 'cc-docs-levels';
  var LEVELS = ['beginner', 'intermediate', 'advanced'];

  function getState() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return 'all';  // 'all' or a specific level name
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyFilter(state) {
    LEVELS.forEach(function(level) {
      var sections = document.querySelectorAll('[data-level="' + level + '"]');
      var show = (state === 'all' || state === level);
      sections.forEach(function(el) {
        el.style.display = show ? '' : 'none';
      });
    });
  }

  function updateButtons(state) {
    // Update "All" button
    var allBtn = document.querySelector('.level-filter-btn[data-level="all"]');
    if (allBtn) {
      if (state === 'all') allBtn.classList.add('active');
      else allBtn.classList.remove('active');
    }

    // Update level buttons
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

        // If clicking the already-active filter, reset to "all"
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
