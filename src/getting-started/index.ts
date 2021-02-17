// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import * as path from "path";
import { loadTextFromFile, getExtensionContext } from "../utils";
import { sendInfo, instrumentOperation } from "vscode-extension-telemetry-wrapper";

let dotnetGettingStartedView: vscode.WebviewPanel | undefined;

export async function dotnetGettingStartedCmdHandler(context: vscode.ExtensionContext, operationId: string, tabId?: string) {
  if (dotnetGettingStartedView) {
    setActiveTab(dotnetGettingStartedView, operationId, tabId);
    dotnetGettingStartedView.reveal();
    return;
  }

  dotnetGettingStartedView = vscode.window.createWebviewPanel("dotnet.gettingStarted", ".NET Getting Started", {
    viewColumn: vscode.ViewColumn.One,
  }, {
    enableScripts: true,
    enableCommandUris: true,
    retainContextWhenHidden: true
  });

  setActiveTab(dotnetGettingStartedView, operationId, tabId);
  await initializeDotnetGettingStartedView(context, dotnetGettingStartedView, onDidDisposeWebviewPanel, operationId);
}

function setActiveTab(webviewPanel: vscode.WebviewPanel, operationId: string, tabId?: string) {
  if (tabId) {
    sendInfo(operationId, {
      infoType: "tabActivated",
      tabId: tabId
    });
    webviewPanel.webview.postMessage({
      command: "tabActivated",
      tabId,
    });
  }
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
