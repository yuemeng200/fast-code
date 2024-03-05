# Vscode Extension Development Share

## Overview

### About Vscode

- Editor Group
- Side Bar
- Activity Bar
- Status Bar
- Title Bar
- Panel

### About Extension

- [内置拓展列表](https://github.com/microsoft/vscode/tree/main/extensions)

- [官方案例](https://github.com/microsoft/vscode-extension-samples)

## Capabilities

- **Command**
- **Configuration**
- **Keybinding**
- Language Provider
  - **Definition**
  - **Hover**
  - **Completion**
  - ...
- Context Menu
- Data Storage
- Interaction
  - createStatusBarItem
  - showQuickPick
  - showInputBox
  - showInformationMessage
  - File Picker
  - ...
- Output Channel
- Theming
  - Color Theme
  - File Icon
  - Product Icon
- Syntax Highlight
- Extending Workbench
  - TreeView
- Webview
- Snippets
- Language Server

> [contribution-points](https://code.visualstudio.com/api/references/contribution-points)

### Highlight

- Tokenization: tokens -> scopes
- Colour: scopes -> style

> Developer: Inspect Editor Tokens and Scopes
> [TextMate grammars](https://macromates.com/manual/en/language_grammars)
> TextMate provides list of common scopes that many themes target. In order to have your grammar as broadly supported as possible, try to build on existing scopes rather than defining new ones.
