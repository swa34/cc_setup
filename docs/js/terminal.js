(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Add copy buttons to terminals
    document.querySelectorAll('.terminal-body').forEach(function(body) {
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function() {
        var text = body.textContent.replace(/^Copy/, '').trim();
        copyToClipboard(text, btn);
      });
      body.style.position = 'relative';
      body.appendChild(btn);
    });

    // Add copy buttons to code blocks
    document.querySelectorAll('pre').forEach(function(pre) {
      if (pre.querySelector('.copy-btn')) return;
      var code = pre.querySelector('code');
      if (!code) return;

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function() {
        copyToClipboard(code.textContent, btn);
      });
      pre.appendChild(btn);
    });
  });

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopied(btn);
      }).catch(function() {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch(e) {
      btn.textContent = 'Failed';
    }
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
  }
})();
