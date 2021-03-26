// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import "../../assets/vscode.scss";
import "bootstrap/js/src/tab";
import $ from "jquery";

$("#navigationPanel a").on("click", event => {
  const panelId = $(event.target).attr("href") || "";
  $(panelId).tab("show");
});

let os = "win";
if (navigator.platform.toLowerCase().includes("mac")) {
  os = "mac";
}

const osToHide = os === "win" ? "mac" : "win";
$(`[data-os=${osToHide}]`).hide();

declare function acquireVsCodeApi(): any;
const vscode = acquireVsCodeApi();

$("a[data-toggle='tab']").on("shown.bs.tab", event => {
  vscode.postMessage({
    command: "tabActivated",
    tabId: event.target.id
  });
});

// Handle the message inside the webview
window.addEventListener("message", event => {
  const message = event.data;
  switch (message.command) {
    case "tabActivated":
      $(message.tabId).tab("show");
      break;
  }
});
