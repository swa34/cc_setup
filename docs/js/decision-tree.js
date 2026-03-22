(function() {
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.decision-tree[data-tree]').forEach(initTree);
  });

  function initTree(container) {
    var dataEl = container.querySelector('script[type="application/json"]');
    if (!dataEl) return;

    var data;
    try { data = JSON.parse(dataEl.textContent); } catch(e) { return; }

    render(container, data, data);
  }

  function render(container, tree, rootTree) {
    // Clear previous dynamic content
    var existing = container.querySelectorAll('.dt-dynamic');
    existing.forEach(function(el) { el.remove(); });

    // Find or create question
    var questionEl = container.querySelector('.dt-question');
    if (!questionEl) {
      questionEl = document.createElement('div');
      questionEl.className = 'dt-question';
      container.appendChild(questionEl);
    }
    questionEl.textContent = tree.question;

    // Create options
    var optionsWrap = document.createElement('div');
    optionsWrap.className = 'dt-options dt-dynamic';
    container.appendChild(optionsWrap);

    tree.options.forEach(function(opt) {
      var optEl = document.createElement('div');
      optEl.className = 'dt-option';
      optEl.innerHTML = '<div class="dt-option-title">' + opt.label + '</div>' +
                        '<div class="dt-option-desc">' + (opt.desc || '') + '</div>';

      optEl.addEventListener('click', function() {
        // Remove previous selections at this level
        optionsWrap.querySelectorAll('.dt-option').forEach(function(o) { o.classList.remove('selected'); });
        optEl.classList.add('selected');

        // Remove any deeper results
        var deeper = container.querySelectorAll('.dt-result, .dt-connector');
        deeper.forEach(function(d) { if (d.classList.contains('dt-dynamic')) d.remove(); });

        if (opt.result) {
          var connector = document.createElement('div');
          connector.className = 'dt-connector dt-dynamic';
          connector.innerHTML = '&#x25BC;';
          container.appendChild(connector);

          var resultEl = document.createElement('div');
          resultEl.className = 'dt-result visible dt-dynamic';
          resultEl.innerHTML = '<div class="dt-result-title">' + opt.label + '</div>' +
                               '<div class="dt-result-body">' + opt.result + '</div>';
          container.appendChild(resultEl);
        } else if (opt.next) {
          // Render next level
          var connector = document.createElement('div');
          connector.className = 'dt-connector dt-dynamic';
          connector.innerHTML = '&#x25BC;';
          container.appendChild(connector);
          render(container, opt.next, rootTree);
        }
      });

      optionsWrap.appendChild(optEl);
    });

    // Reset button
    var resetBtn = document.createElement('button');
    resetBtn.className = 'dt-reset dt-dynamic';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', function() {
      var dynamics = container.querySelectorAll('.dt-dynamic');
      dynamics.forEach(function(d) { d.remove(); });
      container.querySelector('.dt-question').textContent = '';
      render(container, rootTree, rootTree);
    });
    container.appendChild(resetBtn);
  }
})();
