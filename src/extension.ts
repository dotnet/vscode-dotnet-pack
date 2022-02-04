// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { dotnetsdk } from "vscode-dotnet-runtime";
import { dispose as disposeTelemetryWrapper, initialize, instrumentOperation } from "vscode-extension-telemetry-wrapper";

import { initialize as initUtils } from "./utils";
import { initialize as initCommands } from "./commands";
import { initialize as initExp } from "./exp";

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
