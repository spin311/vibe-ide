// extensions/vibe-claude-terminal/media/webview.js
(function () {
  const vscode = acquireVsCodeApi();
  const terminals = new Map(); // sessionId -> { term, fitAddon }
  let activeId = null;

  const tabBar = document.getElementById('tab-bar');
  const terminalContainer = document.getElementById('terminal-container');
  const newSessionButton = document.getElementById('new-session');

  function ensureTerminal(sessionId) {
    if (terminals.has(sessionId)) {
      return terminals.get(sessionId);
    }
    const container = document.createElement('div');
    container.className = 'terminal-instance';
    container.style.display = 'none';
    terminalContainer.appendChild(container);

    const term = new Terminal({ convertEol: true });
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);

    term.onData((data) => {
      vscode.postMessage({ type: 'input', sessionId, data });
    });

    const entry = { term, fitAddon, container };
    terminals.set(sessionId, entry);
    return entry;
  }

  function renderTabs(state) {
    tabBar.querySelectorAll('.tab').forEach((el) => el.remove());
    for (const entry of state.entries) {
      const tab = document.createElement('div');
      tab.className = 'tab' + (entry.id === state.activeId ? ' active' : '');
      tab.textContent = entry.title + (entry.isEnded ? ' (ended)' : '');
      tab.addEventListener('click', () => {
        vscode.postMessage({ type: 'selectSession', sessionId: entry.id });
      });
      const close = document.createElement('span');
      close.className = 'tab-close';
      close.textContent = ' ×';
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ type: 'closeSession', sessionId: entry.id });
      });
      tab.appendChild(close);
      tabBar.insertBefore(tab, newSessionButton);
    }
  }

  function fitAndNotify(sessionId, entry) {
    entry.fitAddon.fit();
    const dims = entry.fitAddon.proposeDimensions();
    if (dims) {
      vscode.postMessage({ type: 'resize', sessionId, cols: dims.cols, rows: dims.rows });
    }
  }

  function showActive(state) {
    activeId = state.activeId;
    for (const [id, entry] of terminals) {
      entry.container.style.display = id === activeId ? 'block' : 'none';
    }
    if (activeId && terminals.has(activeId)) {
      fitAndNotify(activeId, terminals.get(activeId));
    }
  }

  newSessionButton.addEventListener('click', () => {
    vscode.postMessage({ type: 'newSession' });
  });

  window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.type) {
      case 'stateChanged': {
        for (const entry of message.state.entries) {
          ensureTerminal(entry.id);
        }
        renderTabs(message.state);
        showActive(message.state);
        break;
      }
      case 'output': {
        const entry = terminals.get(message.sessionId);
        entry?.term.write(message.data);
        break;
      }
      case 'sessionEnded': {
        const entry = terminals.get(message.sessionId);
        entry?.term.write('\r\n[process exited with code ' + message.exitCode + ']\r\n');
        break;
      }
    }
  });

  window.addEventListener('resize', () => {
    if (activeId && terminals.has(activeId)) {
      fitAndNotify(activeId, terminals.get(activeId));
    }
  });
})();
