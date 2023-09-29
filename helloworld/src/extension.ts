import * as vscode from 'vscode';
// Code based on: https://github.com/microsoft/vscode-extension-samples/tree/main/webview-view-sample 
// and https://code.visualstudio.com/api/get-started/your-first-extension 

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "helloworld" is now active!');

  const provider = new WebViewProvider(context.extensionUri);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(WebViewProvider.viewType, provider));

  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    vscode.window.showInformationMessage('Hello World from HelloWorld!');
  });

  context.subscriptions.push(disposable);
}

class WebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'helloWorld.view';

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hello World</title>
      </head>
      <body>
          <h1>Hello World</h1>
		      <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
      </body>
      </html>`;
  }
}
