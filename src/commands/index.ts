// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";

import { instrumentCommand, webviewCmdLinkHandler } from "../utils";
import { dotnetGettingStartedCmdHandler } from "../getting-started";
import { instrumentOperationAsVsCodeCommand } from "vscode-extension-telemetry-wrapper";

export function initialize(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand("dotnet.gettingStarted", instrumentCommand(context, "dotnet.gettingStarted", dotnetGettingStartedCmdHandler)));
  context.subscriptions.push(instrumentOperationAsVsCodeCommand("dotnet.webview.runCommand", webviewCmdLinkHandler));
}
