// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { dispose as disposeTelemetryWrapper, initialize, instrumentOperation } from "vscode-extension-telemetry-wrapper";

import { initialize as initUtils } from "./utils";
import { initialize as initCommands } from "./commands";
import { HelpViewType } from "./misc";
import { initialize as initExp } from "./exp";
import { scheduleAction } from "./utils/scheduler";

export async function activate(context: vscode.ExtensionContext) {
  initializeTelemetry(context);
  await instrumentOperation("activation", initializeExtension)(context);
}

async function initializeExtension(_operationId: string, context: vscode.ExtensionContext) {
  initUtils(context);
  initCommands(context);
  initExp(context);
  initializeDependencies(context);
  
  const config = vscode.workspace.getConfiguration("dotnet.help");

  if (config.get("firstView") !== HelpViewType.None) {
    scheduleAction("showFirstView", true).then(() => {
      presentFirstView(context);
    });
  }
}

async function initializeDependencies() {
  // Start OmniSharp
  initializeDependency("ms-dotnettools.csharp", "o.restart");

  // Download Debugger
  initializeDependency("ms-dotnettools.csharp", "csharp.downloadDebugger");
}

async function initializeDependency(extensionName: string, command: string) {
  var extension =  vscode.extensions.getExtension(extensionName);
  if (extension == undefined) {
    return;
  }

  // is the ext loaded and ready?
  if(extension.isActive == false) {
    extension.activate().then(
      function(){
        console.log("Extension activated");
        vscode.commands.executeCommand(command);
      },
      function(){
        console.log("Extension activation failed");
      }
    );   
  } else {
    vscode.commands.executeCommand(command);
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
  if (!!context.globalState.get("isDotnetGettingStartedPresented")) {
    return;
  }

  await vscode.commands.executeCommand("dotnet.gettingStarted");
  await initializeDependencies(context);
  context.globalState.update("isDotnetGettingStartedPresented", true);
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
