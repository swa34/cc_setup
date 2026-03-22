(function() {
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-group').forEach(function(group) {
      var buttons = group.querySelectorAll('.tab-btn');
      var panels = group.querySelectorAll('.tab-panel');

      buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var target = btn.getAttribute('data-tab');

          buttons.forEach(function(b) { b.classList.remove('active'); });
          panels.forEach(function(p) { p.classList.remove('active'); });

          btn.classList.add('active');
          var panel = group.querySelector('.tab-panel[data-tab="' + target + '"]');
          if (panel) panel.classList.add('active');
        });

        // Keyboard navigation
        btn.addEventListener('keydown', function(e) {
          var btns = Array.from(buttons);
          var idx = btns.indexOf(btn);
          if (e.key === 'ArrowRight' && idx < btns.length - 1) {
            btns[idx + 1].focus();
            btns[idx + 1].click();
          } else if (e.key === 'ArrowLeft' && idx > 0) {
            btns[idx - 1].focus();
            btns[idx - 1].click();
          }
        });
      });
    });
  });
})();
