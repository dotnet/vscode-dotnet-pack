// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

// import * as vscode from 'vscode'

import * as React from 'react';
import { SharedMessages } from '../utils/messages';
import { ISettingPackage, IStartPageMapping, StartPageMessages } from '../utils/types';
import { Image, ImageName } from './react-common/image';
import { getLocString, storeLocStrings } from './react-common/locReactSide';
import { IMessageHandler, PostOffice } from './react-common/postOffice';
import './startPage.css';

export interface IStartPageProps {
    skipDefault?: boolean;
    baseTheme: string;
    testMode?: boolean;
}

// Front end of the Python extension start page.
// In general it consists of its render method and methods that send and receive messages.
export class StartPage extends React.Component<IStartPageProps> implements IMessageHandler {
    private releaseNotes: ISettingPackage = {
        showAgainSetting: false,
    };
    private postOffice: PostOffice = new PostOffice();

    constructor(props: IStartPageProps) {
        super(props);
    }

    public componentDidMount() {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.RequestShowAgainSetting);
    }

    public componentWillMount() {
        // Add ourselves as a handler for the post office
        this.postOffice.addHandler(this);

        // Tell the start page code we have started.
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.Started);

        // Bind some functions to the window, as we need them to be accessible with clean HTML to use translations
        (window as any).openBlankNotebook = this.openBlankNotebook.bind(this);
        (window as any).openFileBrowser = this.openFileBrowser.bind(this);
        (window as any).openFolder = this.openFolder.bind(this);
        (window as any).openWorkspace = this.openWorkspace.bind(this);
        (window as any).openCommandPalette = this.openCommandPalette.bind(this);
        (window as any).openCommandPaletteWithSelection = this.openCommandPaletteWithSelection.bind(this);
        (window as any).openSampleNotebook = this.openSampleNotebook.bind(this);
    }

    public render() {
        return (
            <div className="main-page">
                <div className="title-row">
                    <div className="title-icon">
                        <Image
                            baseTheme={this.props.baseTheme}
                            class="image-button-image"
                            image={ImageName.DotNet}
                        />
                    </div>
                    <div className="title">{getLocString('StartPage.dotnetExtensionTitle', 'Get started with .NET')}</div>
                </div>
                <div className="row">
                    <div className="icon" onClick={this.openSampleNotebook} role="button">
                        <Image
                            baseTheme={this.props.baseTheme ? this.props.baseTheme : 'vscode-dark'}
                            class="image-button-image"
                            image={ImageName.Notebook}
                        />
                    </div>
                    <div className="block">
                        <div className="linkText" onClick={this.openSampleNotebook} role="button">
                            {getLocString('StartPage.createJupyterNotebook', 'Learn .NET with .NET Notebooks')}
                        </div>
                        {this.renderNotebookDescription()}
                    </div>
                </div>
                <div className="row">
                    <h2 className="text">Use the .NET CLI to create an app</h2>
                    <p>Open a terminal and run the following commands:</p>
                    <pre><code>dotnet new console</code></pre>
                    <pre><code>dotnet run</code></pre>
                    <p>You should see the following output:</p>
                    <pre><code>Hello, world!</code></pre>
                    {this.renderReleaseDotnetGetStartedInfo()}
                </div>
                <div className="block">
                    <input
                        type="checkbox"
                        aria-checked={!this.releaseNotes.showAgainSetting}
                        className="checkbox"
                        onClick={this.updateSettings}
                    ></input>
                </div>
                <div className="block">
                    <p>{getLocString('StartPage.dontShowAgain', "Don't show this page again")}</p>
                </div>
            </div>
        );
    }

    public handleMessage = (msg: string, payload?: any) => {
        switch (msg) {
            case StartPageMessages.SendSetting:
                this.releaseNotes.showAgainSetting = payload.showAgainSetting;
                this.setState({});
                break;

            case SharedMessages.LocInit:
                // Initialize localization.
                const locJSON = JSON.parse(payload);
                storeLocStrings(locJSON);
                break;

            default:
                break;
        }

        return false;
    };

    public openFileBrowser() {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenFileBrowser);
    }

    public openFolder = () => {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenFolder);
    };

    public openWorkspace() {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenWorkspace);
    }

    private renderNotebookDescription(): JSX.Element {
        return (
            <div
                className="paragraph list"
                dangerouslySetInnerHTML={{
                    __html: getLocString(
                        'StartPage.notebookDescription',
                        `- Learn .NET, C#, and F# interactively <br />- Visualize your outputs`,
                    ),
                }}
            />
        );
    }

    private renderReleaseDotnetGetStartedInfo(): JSX.Element {
        return (
            <div
                className="paragraph"
                dangerouslySetInnerHTML={{
                    __html: getLocString(
                        'StartPage.dotnetGetStarted',
                        `Follow the <a class="link" href=${'https://docs.microsoft.com/dotnet/csharp/tour-of-csharp/tutorials/local-environment'}>C# tutorials</a> to learn C# and .NET from the command line.`,
                    ),
                }}
            />
        );
    }

    private openBlankNotebook = () => {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenBlankNotebook);
    };

    private openCommandPalette = () => {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenCommandPalette);
    };

    private openCommandPaletteWithSelection = () => {
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenCommandPaletteWithOpenNBSelected);
    };

    private openSampleNotebook = () => {
        // let notebookPath = vscode.Uri.parse('quickstart.ipynb')
        // vscode.commands.executeCommand('vscode.open', notebookPath)
        this.postOffice.sendMessage<IStartPageMapping>(StartPageMessages.OpenSampleNotebook);
    };

    private updateSettings = () => {
        this.releaseNotes.showAgainSetting = !this.releaseNotes.showAgainSetting;
        this.postOffice.sendMessage<IStartPageMapping>(
            StartPageMessages.UpdateSettings,
            this.releaseNotes.showAgainSetting,
        );
    };
}