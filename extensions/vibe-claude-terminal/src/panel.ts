// extensions/vibe-claude-terminal/src/panel.ts
import * as vscode from 'vscode';
import { SessionManager } from './sessionManager';

export class ClaudeTerminalPanel {
  private static current: ClaudeTerminalPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly sessionManager: SessionManager;
  private disposed = false;

  static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext): void {
    if (ClaudeTerminalPanel.current) {
      ClaudeTerminalPanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'vibeClaudeTerminal',
      'Claude',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm'),
        ],
      }
    );
    // Registering the panel as a disposable means a normal extension deactivation
    // (not just the user closing the tab) also disposes it, which fires
    // onDidDispose below and stops every live session.
    context.subscriptions.push(panel);
    ClaudeTerminalPanel.current = new ClaudeTerminalPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.sessionManager = new SessionManager(
      (state) => this.postMessage({ type: 'stateChanged', state }),
      (sessionId, data) => this.postMessage({ type: 'output', sessionId, data }),
      (sessionId, exitCode) => this.postMessage({ type: 'sessionEnded', sessionId, exitCode })
    );

    this.panel.webview.html = this.getHtml(extensionUri);

    this.panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'newSession': {
          const folders = vscode.workspace.workspaceFolders;
          const directory = folders && folders.length > 0 ? folders[0].uri.fsPath : process.env.HOME || '/';
          this.sessionManager.openSession(directory);
          break;
        }
        case 'closeSession':
          this.sessionManager.closeSession(message.sessionId);
          break;
        case 'selectSession':
          this.sessionManager.selectSession(message.sessionId);
          break;
        case 'input':
          this.sessionManager.handleInput(message.sessionId, message.data);
          break;
        case 'resize':
          this.sessionManager.handleResize(message.sessionId, message.cols, message.rows);
          break;
      }
    });

    this.panel.onDidDispose(() => {
      this.disposed = true;
      this.sessionManager.disposeAll();
      ClaudeTerminalPanel.current = undefined;
    });
  }

  private postMessage(message: unknown): void {
    if (this.disposed) {
      return;
    }
    try {
      this.panel.webview.postMessage(message);
    } catch {
      // Webview may have been disposed between the check above and this call
      // (e.g. a callback fired during the same tick as disposal); ignore.
    }
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const xtermJs = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm', 'xterm', 'lib', 'xterm.js')
    );
    const xtermCss = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm', 'xterm', 'css', 'xterm.css')
    );
    const fitAddonJs = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm', 'addon-fit', 'lib', 'addon-fit.js')
    );
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview.css'));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; script-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};">
  <link rel="stylesheet" href="${xtermCss}">
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="tab-bar"><span id="new-session">+</span></div>
  <div id="terminal-container"></div>
  <script src="${xtermJs}"></script>
  <script src="${fitAddonJs}"></script>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
