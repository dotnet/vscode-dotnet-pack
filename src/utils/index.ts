// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { readFile as fsReadFile } from "fs";
import * as util from "util";
import { initialize as initializeIdle } from "./idle";
import { initialize as initializeScheduler } from "./scheduler";
import { sendInfo } from "vscode-extension-telemetry-wrapper";

const readFile = util.promisify(fsReadFile);

let extensionContext: vscode.ExtensionContext;

export function initialize(context: vscode.ExtensionContext) {
  extensionContext = context;
  initializeIdle(context);
  initializeScheduler(context);
}

export function getExtensionContext() {
  return extensionContext;
}

export async function loadTextFromFile(resourceUri: string) {
  let buffer = await readFile(resourceUri);
  return buffer.toString();
}

export * from "./command";
export * from "./extension";

export async function webviewCmdLinkHandler(obj: { webview: string, identifier: string, command: string, args?: string[] }) {
  const { webview, identifier, command, args } = obj;
  sendInfo("", {
    name: "openWebviewUrl",
    webview,
    identifier
  });
  await vscode.commands.executeCommand(command, args);
}
