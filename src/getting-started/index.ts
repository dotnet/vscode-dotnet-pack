// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import * as path from "path";
import { loadTextFromFile, getExtensionContext } from "../utils";
import { sendInfo, instrumentOperation } from "vscode-extension-telemetry-wrapper";

let dotnetGettingStartedView: vscode.WebviewPanel | undefined;

export async function dotnetGettingStartedCmdHandler(context: vscode.ExtensionContext, operationId: string, tabId?: string) {
  const editors = vscode.window.visibleTextEditors;
  if (editors.some(editor => editor.document.fileName.endsWith('.NET getting started.ipynb'))) {
    return;
  }

  const notebookPath = context.asAbsolutePath(path.join('misc', '.NET getting started.ipynb'));
  const notebookUri = vscode.Uri.file(notebookPath);

  await vscode.commands.executeCommand('vscode.openWith', notebookUri, 'dotnet-interactive-jupyter');

  // ignore some values to make webpack happy lol
  operationId;
  tabId;
}

function onDidDisposeWebviewPanel() {
  dotnetGettingStartedView = undefined;
}

async function initializeDotnetGettingStartedView(context: vscode.ExtensionContext, webviewPanel: vscode.WebviewPanel, onDisposeCallback: () => void, operationId: string) {
  webviewPanel.iconPath = vscode.Uri.file(path.join(context.extensionPath, "logo.lowres.png"));
  const resourceUri = context.asAbsolutePath("./out/assets/getting-started/index.html");
  webviewPanel.webview.html = await loadTextFromFile(resourceUri);
  context.subscriptions.push(webviewPanel.onDidDispose(onDisposeCallback));
  context.subscriptions.push(webviewPanel.webview.onDidReceiveMessage(async (e) => {
    if (e.command === "tabActivated") {
      let tabId = e.tabId;
      sendInfo(operationId, {
        infoType: "tabActivated",
        tabId: tabId
      });
    }
  }));
}

export class DotnetGettingStartedViewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, _state: any) {
    if (dotnetGettingStartedView) {
      dotnetGettingStartedView.reveal();
      webviewPanel.dispose();
      return;
    }

    dotnetGettingStartedView = webviewPanel;
    instrumentOperation("restoreGettingStartedView", operationId => {
      initializeDotnetGettingStartedView(getExtensionContext(), webviewPanel, onDidDisposeWebviewPanel, operationId);
    })();
  }
}
