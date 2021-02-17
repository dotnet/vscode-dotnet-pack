// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";

export enum HelpViewType {
  Auto = "auto",
  GettingStarted = "gettingStarted",
  None = "none",
}

function showInfoButton() {
  const config = vscode.workspace.getConfiguration("dotnet.help");
  const firstView = config.get("firstView");

  let infoButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  switch (firstView) {
    case HelpViewType.None:
      return;
    default:
      infoButton.command = "dotnet.gettingStarted";
  }

  infoButton.text = "$(info)";
  infoButton.tooltip = "Learn more about .NET features";
  infoButton.show();
}

export function initialize(_context: vscode.ExtensionContext) {
  showInfoButton();
}
