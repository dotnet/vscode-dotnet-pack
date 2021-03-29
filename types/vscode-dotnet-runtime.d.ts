import * as vscode from "vscode";

declare module dotnetsdk {
    export enum AcquireErrorConfiguration {
        DisplayAllErrorPopups = 0,
        DisableErrorPopups = 1,
    }

    export interface IDotnetAcquireContext {
        version: string;
        requestingExtensionId?: string;
        errorConfiguration?: AcquireErrorConfiguration;
    }

    export interface IDotnetAcquireResult {
        dotnetPath: string;
    }
}

declare module "vscode" {
    export namespace commands {
        export function executeCommand(command: 'dotnet-sdk.acquire', context: dotnetsdk.IDotnetAcquireContext): Thenable<dotnetsdk.IDotnetAcquireResult>;
        export function executeCommand(command: 'dotnet-sdk.acquireStatus', context: dotnetsdk.IDotnetAcquireContext): Thenable<dotnetsdk.IDotnetAcquireResult>;
    }
}
