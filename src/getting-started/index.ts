// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import * as path from "path";

export async function dotnetGettingStartedCmdHandler(context: vscode.ExtensionContext) {
  const editors = vscode.window.visibleTextEditors;
  if (editors.some(editor => editor.document.fileName.endsWith('Getting Started with .NET.dib'))) {
    return;
  }

  const notebookPath = context.asAbsolutePath(path.join('misc', 'Getting Started with .NET.dib'));
  const notebookUri = vscode.Uri.file(notebookPath);

  await vscode.commands.executeCommand('vscode.openWith', notebookUri, 'polyglot-notebook');
}
