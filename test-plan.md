# Validating the .NET Extension Pack

## Installer bits to test
 
We generate both Online and Offline installers during the build. Online installer exes are smaller in size, and they download the SDKs/extensions during the install, so slightly slower. Offline installer exes are much bigger in size as they embed the downloaded bits. 

X64 online installers are our primary target which can be used for majority of testing, others are secondary and only need a sanity check not a full matrix validation.
 
Following VSCode Extensions will be installed as part of the installer steps:
- .NET Extension pack (contains C# extension, .NET interactive notebooks and F# Ionide extensions): https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.vscode-dotnet-pack.
- .NET SDK installing extension: https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.vscode-dotnet-sdk. This extension will download and install .NET SDK into a VSCode specific user local path, it is not a global .NET SDK install.
 
## Test scenarios:
 
Below are the test scenarios that we would like to verify. Feel free to do additional testing as appropriate.
 
1. Clean install: Run installer on clean machine, never installed VSCode or ran the installer before on the machine
2. Partial install: Install scenarios where one or more of VSCode, .NET extension pack or .NET SDK are already installed
3. Dirty install: Install scenarios where installer has been executed and then VSCode and/or .NET extension pack were uninstalled
4. Uninstall: User can uninstall any of the above two VSCode extensions and also VSCode
5. SxS install: SxS scenarios where there are pre-existing .NET SDK installs and/or VS install. 
    1. Try with a different version of .NET SDK (say a pre-.NET 7 SDK already installed). 
    2. Also SxS scenarios where user has already installed coding pack for Python and Java: https://code.visualstudio.com/learntocode
6. Mac OS: Ensure the Mac installer is validated
7. No Network connectivity install: 
    1. Verify graceful errors when executing online installer with no network access.
    2. Verify the offline installer (at least x64 one) works fine (Offline has not yet been validated by me, so currently you may see this not working as expected)
8. Getting started page:
    1. Launching VSCode after clicking the Finish button on the installer should open a quick start file and automatically bring up getting started page.
    2. Validate that getting started page does not automatically show up when opening subsequent instances of VSCode, we only want it happen for first launch.
    3. Validate that pressing Ctrl + Shift + P brings up the command pallete and “.NET: Getting Started” is an available command which user can explicitly bring up anytime.
    4. Currently, the content is stub, but Phillip is working on updating this content. Once available, we should read through the content and examples on this page, try navigate to different hyperlinks, etc. r from add/remove programs
 
You can file issues here: https://github.com/dotnet/vscode-dotnet-pack/issues
