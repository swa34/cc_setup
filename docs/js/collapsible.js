(function() {
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.collapsible-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var collapsible = header.closest('.collapsible');
        collapsible.classList.toggle('open');
      });
    });
  });
})();
