// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { dotnetsdk } from "vscode-dotnet-runtime";
import { dispose as disposeTelemetryWrapper, initialize, instrumentOperation } from "vscode-extension-telemetry-wrapper";

import { initialize as initUtils } from "./utils";
import { initialize as initCommands } from "./commands";
import { HelpViewType } from "./misc";
import { initialize as initExp } from "./exp";
import { scheduleAction } from "./utils/scheduler";

const isDotnetGettingStartedPresented = 'isDotnetGettingStartedPresented';
const dotnetSdkVersion = '7.0';
let gettingStartedShownByActivation = false;

interface DotnetPackExtensionExports {
  getDotnetPath(version?: string): Promise<string | undefined>;
}

export async function activate(context: vscode.ExtensionContext): Promise<DotnetPackExtensionExports> {
  initializeTelemetry(context);
  await instrumentOperation("activation", initializeExtension)(context);

  return {
    getDotnetPath
  }
}

async function getDotnetPath(version?: string) {
  const request: dotnetsdk.IDotnetAcquireContext = {
    version: version ?? dotnetSdkVersion,
    requestingExtensionId: 'ms-dotnettools.vscode-dotnet-pack'
  };
  const commands = await vscode.commands.getCommands();
  if (commands.includes('dotnet-sdk.acquireStatus')) {
    const result = await vscode.commands.executeCommand('dotnet-sdk.acquireStatus', request);
    return result?.dotnetPath;
  } else {
    return undefined;
  }
}

async function initializeExtension(_operationId: string, context: vscode.ExtensionContext) {
  await initUrlHandler(context);
  initUtils(context);
  initCommands(context);
  initExp(context);

  const config = vscode.workspace.getConfiguration("dotnet.help");

  if (config.get("firstView") !== HelpViewType.None) {
    scheduleAction("showFirstView", true).then(() => {
      presentFirstView(context);
    });
  }
}

async function initUrlHandler(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri: async (uri: vscode.Uri) => {
        switch (uri.path) {
          case '/gettingStarted':
            if (!gettingStartedShownByActivation) {
              await vscode.commands.executeCommand("dotnet.gettingStarted");
            }
            break;
        }
      }
    }));
}

async function presentFirstView(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("dotnet.help");
  const firstView = config.get("firstView");
  switch (firstView) {
    case HelpViewType.None:
      break;
    default:
      await showGettingStartedView(context);
  }
}

async function showGettingStartedView(context: vscode.ExtensionContext, _isForce: boolean = false) {
  if (!!context.globalState.get(isDotnetGettingStartedPresented)) {
    return;
  }

  await vscode.commands.executeCommand("dotnet.gettingStarted");
  gettingStartedShownByActivation = true;
  context.globalState.update(isDotnetGettingStartedPresented, true);
}

function initializeTelemetry(_context: vscode.ExtensionContext) {
  const ext = vscode.extensions.getExtension("ms-dotnettools.vscode-dotnet-pack");
  const packageInfo = ext ? ext.packageJSON : undefined;
  if (packageInfo) {
    if (packageInfo.aiKey) {
      initialize(packageInfo.id, packageInfo.version, packageInfo.aiKey, { firstParty: true });
    }
  }
}

export async function deactivate() {
  await disposeTelemetryWrapper();
}
