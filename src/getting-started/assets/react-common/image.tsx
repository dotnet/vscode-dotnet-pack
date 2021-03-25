// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import * as React from 'react';

import InlineSVG from 'svg-inline-react';

// This react component loads our svg files inline so that we can load them in vscode as it no longer
// supports loading svgs from disk. Please put new images in this list as appropriate.
export enum ImageName {
    DotNet,
    Notebook,
    OpenFolder,
}

// All of the images must be 'require' so that webpack doesn't rewrite the import as requiring a .default.

const images: { [key: string]: { light: string; dark: string } } = {
    DotNet: {
        light: require('./images/startPage/dotnet-logo.svg'),
        dark: require('./images/startPage/dotnet-logo.svg'),
    },
    Notebook: {
        light: require('./images/startPage/Notebook.svg'),
        dark: require('./images/startPage/Notebook-inverse.svg'),
    },
    OpenFolder: {
        light: require('./images/startPage/OpenFolder.svg'),
        dark: require('./images/startPage/OpenFolder-inverse.svg'),
    },
};

interface IImageProps {
    baseTheme: string;
    image: ImageName;
    class: string;
    title?: string;
}

export class Image extends React.Component<IImageProps> {
    constructor(props: IImageProps) {
        super(props);
    }

    public render() {
        const key = ImageName[this.props.image].toString();
        const image = images.hasOwnProperty(key) ? images[key] : images.Cancel; // Default is cancel.
        const source = this.props.baseTheme.includes('dark') ? image.dark : image.light;
        return <InlineSVG className={this.props.class} src={source} title={this.props.title} />;
    }
}