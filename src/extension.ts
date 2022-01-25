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
const dotnetSdkVersion = '6.0';

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
  initUtils(context);
  initCommands(context);
  initExp(context);
  initializeDependencies();

  const config = vscode.workspace.getConfiguration("dotnet.help");

  if (config.get("firstView") !== HelpViewType.None) {
    scheduleAction("showFirstView", true).then(() => {
      presentFirstView(context);
    });
  }
}

async function initializeDependencies() {
  // Acquire status for .NET SDK
  // TODO: Once we have an automated pipeline to have the latest SDK bundled with the education pack installer, we can change the below command to "dotnet-sdk.acquire", to get the latest SDK update.
  let sdkResult = await initializeDependency("ms-dotnettools.vscode-dotnet-sdk", "dotnet-sdk.acquireStatus", { version: dotnetSdkVersion, requestingExtensionId: 'ms-dotnettools.vscode-dotnet-pack' });
  if (!sdkResult?.dotnetPath) {
    const acquirePromise = initializeDependency("ms-dotnettools.vscode-dotnet-sdk", "dotnet-sdk.acquire", { version: dotnetSdkVersion, requestingExtensionId: 'ms-dotnettools.vscode-dotnet-pack' });
    sdkResult = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Acquiring latest .NET SDK...' },
      (_progress, _token) => acquirePromise
    );
  }

  // Acquire .NET Interactive
  initializeDependency("ms-dotnettools.dotnet-interactive-vscode", "dotnet-interactive.acquire", sdkResult?.dotnetPath);
}

async function initializeDependency(extensionName: string, command: string, commandArgs?: any): Promise<any> {
  const extension = vscode.extensions.getExtension(extensionName);
  if (extension === undefined) {
    return Promise.resolve();
  }

  // is the ext loaded and ready?
  if (!extension.isActive) {
    return extension.activate().then(
      function () {
        console.log("Extension activated");
        return vscode.commands.executeCommand(command, commandArgs);
      },
      function () {
        console.log("Extension activation failed");
      }
    );
  } else {
    return vscode.commands.executeCommand(command, commandArgs);
  }
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
  await initializeDependencies();
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
