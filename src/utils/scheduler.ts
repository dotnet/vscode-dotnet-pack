// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { onIdle } from "./idle";

interface Action {
  name: string;
  resolve: (name: string) => void;
}

const actionQueue: Action[] = [];
const pastActions: string[] = [];

export function initialize(context: vscode.ExtensionContext) {
  context.subscriptions.push(onIdle(() => idleHandler()));
}

// This is to queue the actions that need attention from users. One thing at a time, only on idle.
export function scheduleAction(name: string, isImmediate: boolean = false, isOneTime: boolean = false): Promise<string> {
  const isPastAction = actionQueue.some(action => action.name === name) || pastActions.includes(name);
  if (isOneTime && isPastAction) {
    return Promise.reject(`Action (${name}) was already scheduled or performed once.`);
  }

  return new Promise((resolve, _reject) => {
    if (isImmediate) {
      setImmediate(() => resolve(name));
      return;
    }

    actionQueue.push({
      name: name,
      resolve: resolve
    });
  });
}

function idleHandler() {
  if (actionQueue.length === 0) {
    return;
  }

  const action = actionQueue.shift();
  pastActions.push(action && action.name || "");

  if (action) {
    action.resolve(action && action.name);
  }
}
