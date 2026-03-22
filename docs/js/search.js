(function() {
  var searchIndex = [
    { page: 'index.html', title: 'Getting Started', sections: [
      { heading: 'What is Claude Code', keywords: 'install agentic loop cli terminal agent', anchor: 'what-is-claude-code' },
      { heading: 'Installation', keywords: 'install npm brew curl setup', anchor: 'installation' },
      { heading: 'First Run', keywords: 'init authenticate login first run start', anchor: 'first-run' },
      { heading: 'Essential Commands', keywords: 'commands help cost clear compact init slash', anchor: 'essential-commands' },
      { heading: 'The Agentic Loop', keywords: 'agentic loop tool use observe respond cycle', anchor: 'the-agentic-loop' }
    ]},
    { page: 'core-workflows.html', title: 'Core Workflows', sections: [
      { heading: 'Code Review', keywords: 'review simplify diff pull request PR', anchor: 'code-review' },
      { heading: 'Committing & Pull Requests', keywords: 'commit pr push git branch', anchor: 'committing-pull-requests' },
      { heading: 'Debugging', keywords: 'debug error stack trace fix bug', anchor: 'debugging' },
      { heading: 'Exploring Codebases', keywords: 'explore plan mode navigate understand architecture', anchor: 'exploring-codebases' }
    ]},
    { page: 'claude-md.html', title: 'CLAUDE.md Best Practices', sections: [
      { heading: 'What is CLAUDE.md', keywords: 'claude md project context instructions', anchor: 'what-is-claude-md' },
      { heading: 'File Hierarchy', keywords: 'global project subdirectory monorepo hierarchy', anchor: 'file-hierarchy' },
      { heading: 'What to Include', keywords: 'include build commands conventions architecture', anchor: 'what-to-include' },
      { heading: 'What to Exclude', keywords: 'exclude avoid bloat tokens waste', anchor: 'what-to-exclude' }
    ]},
    { page: 'token-management.html', title: 'Token Management', sections: [
      { heading: 'Why Context Matters', keywords: 'context window tokens limit performance', anchor: 'why-context-matters' },
      { heading: 'Tracking Usage', keywords: 'cost stats tracking monitor usage tokens', anchor: 'tracking-usage' },
      { heading: '/clear vs /compact', keywords: 'clear compact summarize reset context free', anchor: 'clear-vs-compact' },
      { heading: 'Subagent Delegation', keywords: 'subagent agent delegate fan out parallel', anchor: 'subagent-delegation' },
      { heading: 'Model Selection', keywords: 'sonnet opus haiku model switch cost speed', anchor: 'model-selection' }
    ]},
    { page: 'memory-system.html', title: 'Memory System', sections: [
      { heading: 'Memory Types', keywords: 'memory types auto persistent custom', anchor: 'memory-types' },
      { heading: 'Setting Up Memory', keywords: 'setup bootstrap memory persistent cross session', anchor: 'setting-up-memory' },
      { heading: 'Organization Patterns', keywords: 'organize memory general domain tools index', anchor: 'organization-patterns' }
    ]},
    { page: 'hooks-skills.html', title: 'Hooks, Skills & Plugins', sections: [
      { heading: 'Decision Tree', keywords: 'decide choose hooks skills plugins mcp when', anchor: 'decision-tree' },
      { heading: 'Hooks', keywords: 'hooks pretooluse posttooluse automatic event lifecycle', anchor: 'hooks' },
      { heading: 'Skills', keywords: 'skills slash commands custom workflow invoke', anchor: 'skills' },
      { heading: 'Plugins', keywords: 'plugins bundle package install share marketplace', anchor: 'plugins' },
      { heading: 'MCP Servers', keywords: 'mcp model context protocol server external tools', anchor: 'mcp-servers' }
    ]},
    { page: 'legacy-codebases.html', title: 'Legacy Codebases', sections: [
      { heading: 'Onboarding Strategy', keywords: 'onboard legacy unfamiliar large codebase strategy', anchor: 'onboarding-strategy' },
      { heading: 'Claude as Guide', keywords: 'guide explore navigate ask questions understand', anchor: 'claude-as-guide' },
      { heading: 'Plan Mode Workflow', keywords: 'plan mode explore implement commit workflow', anchor: 'plan-mode-workflow' },
      { heading: 'Fan-Out Patterns', keywords: 'batch fan out migration parallel worktree', anchor: 'fan-out-patterns' }
    ]},
    { page: 'security.html', title: 'Security & Permissions', sections: [
      { heading: 'Permission System', keywords: 'permission allow deny bash file read write', anchor: 'permission-system' },
      { heading: 'API Key Management', keywords: 'api key secret credential environment variable', anchor: 'api-key-management' },
      { heading: 'Sandboxing', keywords: 'sandbox container isolation devcontainer', anchor: 'sandboxing' },
      { heading: 'Sensitive Files', keywords: 'env credentials secrets deny protect gitignore', anchor: 'sensitive-files' }
    ]},
    { page: 'team-workflows.html', title: 'Team Workflows & CI/CD', sections: [
      { heading: 'Shared Configuration', keywords: 'shared config git team version control commit', anchor: 'shared-configuration' },
      { heading: 'CI/CD Integration', keywords: 'github actions gitlab ci cd pipeline automation', anchor: 'cicd-integration' },
      { heading: 'Non-Interactive Mode', keywords: 'headless non interactive pipeline script claude -p', anchor: 'non-interactive-mode' },
      { heading: 'Agent Teams', keywords: 'agent teams multiple instances parallel coordinate', anchor: 'agent-teams' }
    ]},
    { page: 'cost-optimization.html', title: 'Cost Optimization', sections: [
      { heading: 'Token Budgeting', keywords: 'budget token cost session clear focused', anchor: 'token-budgeting' },
      { heading: 'Model Selection Guide', keywords: 'model sonnet opus haiku cost comparison', anchor: 'model-selection-guide' },
      { heading: 'Extended Thinking', keywords: 'thinking tokens max extended reasoning', anchor: 'extended-thinking' },
      { heading: 'Team Budgeting', keywords: 'team budget rate limit workspace spend', anchor: 'team-budgeting' }
    ]}
  ];

  document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    if (!input || !results) return;

    var debounceTimer;
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() { search(input.value, results); }, 200);
    });

    input.addEventListener('focus', function() {
      if (input.value.trim().length >= 2) search(input.value, results);
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-container')) {
        results.classList.remove('visible');
      }
    });

    // Close on Escape
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        results.classList.remove('visible');
        input.blur();
      }
    });
  });

  function search(query, resultsEl) {
    query = query.trim().toLowerCase();
    if (query.length < 2) {
      resultsEl.classList.remove('visible');
      return;
    }

    var terms = query.split(/\s+/);
    var matches = [];

    searchIndex.forEach(function(page) {
      page.sections.forEach(function(section) {
        var text = (section.heading + ' ' + section.keywords + ' ' + page.title).toLowerCase();
        var score = 0;
        terms.forEach(function(term) {
          if (text.indexOf(term) !== -1) score++;
        });
        if (score > 0) {
          matches.push({ page: page.page, pageTitle: page.title, heading: section.heading, anchor: section.anchor, score: score });
        }
      });
    });

    matches.sort(function(a, b) { return b.score - a.score; });
    matches = matches.slice(0, 8);

    if (matches.length === 0) {
      resultsEl.innerHTML = '<div class="search-no-results">No results found</div>';
    } else {
      var html = '';
      matches.forEach(function(m) {
        html += '<a href="' + m.page + '#' + m.anchor + '" class="search-result-item">';
        html += '<div class="search-result-page">' + m.pageTitle + '</div>';
        html += '<div class="search-result-title">' + m.heading + '</div>';
        html += '</a>';
      });
      resultsEl.innerHTML = html;
    }
    resultsEl.classList.add('visible');
  }
})();
