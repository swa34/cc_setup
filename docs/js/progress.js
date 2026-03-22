(function() {
  var STORAGE_KEY = 'cc-docs-levels';

  function getState() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return { beginner: true, intermediate: true, advanced: true };
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyFilter(state) {
    ['beginner', 'intermediate', 'advanced'].forEach(function(level) {
      var sections = document.querySelectorAll('[data-level="' + level + '"]');
      sections.forEach(function(el) {
        el.style.display = state[level] ? '' : 'none';
      });
    });
  }

  function updateButtons(state) {
    document.querySelectorAll('.level-filter-btn').forEach(function(btn) {
      var level = btn.getAttribute('data-level');
      if (state[level]) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
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
        state[level] = !state[level];

        // Ensure at least one level is always active
        var anyActive = state.beginner || state.intermediate || state.advanced;
        if (!anyActive) {
          state[level] = true;
          return;
        }

        saveState(state);
        applyFilter(state);
        updateButtons(state);
      });
    });
  });
})();
