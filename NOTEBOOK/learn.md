# Learn

## 介绍

### User interface

- Editor Group
- Side Bar
- Activity Bar
- Status Bar
- Title Bar
- Panel

在 Visual Studio Code 中，"Workbench" 这个术语通常用来指代整个用户界面，包括编辑器窗口、侧边栏、活动栏、状态栏等各种界面元素。

vscode 本身内置的很多功能也以拓展的形式存在, 如对 npm、markdown 等的支持, 可以看到[内置拓展列表](https://github.com/microsoft/vscode/tree/main/extensions)

### .vscode

settings.json：用于设置项目的特定配置选项，比如代码格式化、编辑器外观、语言相关设置等。
launch.json：用于配置调试器（Debugger）的设置，包括启动和调试应用程序时的各种选项，比如启动参数、环境变量等。
tasks.json：用于配置任务（Tasks）的设置，比如编译项目、运行脚本等。
extensions.json：这个文件用于定义推荐的扩展（Extensions），可以指定项目中推荐安装的扩展列表。
keybindings.json 是 Visual Studio Code 中用于配置快捷键绑定（Keybindings）的文件。

## Commmand

> vscode.commands namespace

插件通过 package 配置将 Command export 到外部，使得外部可访问（通过 palette、keybinding 和 程序调用），插件本身需要在 active 时 Reigster Command

- executeCommand
- getCommands
  - thenable
  - commands 里面，有着以下划线(underscore)开头的 command，那即是 vscode 内部使用的命令。
- registerCommand
- registerTextEditorCommand
  - editor 开启时才能被 invoke

> 调试项目时将 ActiveEvents 设置为 \*

## Context Menu

```js
{
  "menu": {
    "${選單元件位置}": [
         {
            command: "${commandId}",
            when: "${boolean}",
            alt: "${commandId}",
            group: "${Sorting Group}"
         }
    ]
  }
}
```

## Configuration

```json
{
  "configuration": {
    "title": "${Extension專案設定的主標題}",
    "properties": {
      "${套件的Namespace}.${設定選項名稱}": {
        "type": "${使用者輸入資料類型: boolean、string、number...}",
        "default": "${選項預設值}",
        "description": "${選項內容描述}" // 支持 Markdown
      }
    }
  }
}
```

> vscode.workspace namespace

- getConfiguration(plugin_id)

## Data Storage

## Interact

> vscode.window namespace

- createStatusBarItem
- showQuickPick
- showInputBox
- showInformationMessage

## API 设计

### vscode.window

- Variable
  - textEditor
  - activeTerminal
- Event
  - onDidChangeActiveTerminal
- Function
  - createXXX
  - registerXXXDataProvider
  - showXXX

## TreeView

```json
{
  "views": {
    "${選單元件位置}": [
      {
        "id": "${樹狀選單Id}",
        "name": "${樹狀選單名字}",
        "icon": "${選單Icon路徑}",
        "contextualTitle": "${樹狀選單標題}"
      }
    ]
  }
}
```

位置比如 explorer, 最后会显示到 sideBar 上，如果没有提供 DataProvider 会显示 viewsWelcome 的指定内容或为空。

举例：

```json
{
  "viewsWelcome": [
    {
      "view": "day12TreeView",
      "contents": "Welcome to NewTreeView \n [learn more](https://code.visualstudio.com/api/extension-guides/tree-view/).\n[Resgister Data Provider](command:day12-treeview-practice.registerDataProvider)"
    }
  ]
}
```

> 使用了 markdown 语法的 command

实现 DataProvider:

```js
class TreeViewItem extends vscode.TreeItem {
 constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);
  }
}

class DataProvider implements vscode.TreeDataProvider<TreeViewItem> {
  getTreeItem(element: TreeViewItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: TreeViewItem): vscode.ProviderResult<TreeViewItem[]> {
    return Promise.resolve([
      new TreeViewItem('TreeItem-01'),
      new TreeViewItem('TreeItem-02'),
      new TreeViewItem('TreeItem-03'),
    ])
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('day12-treeview-practice.registerDataProvider', () => {
    vscode.window.registerTreeDataProvider('day12TreeView', new DataProvider());
    vscode.window.showInformationMessage('Create day12-treeview!');
  });
  context.subscriptions.push(disposable);
}

```

## EventEmitter

```js
/**
 * 創建新的EventEmitter物件
 */
const eventEmitter = new vscode.EventEmitter()

/**
 * 發射事件相關資料
 */
eventEmitter.fire('new changed data!')

/**
 * 監聽與事件相關資料
 */
eventEmitter.event(message => {
  console.log(`Receive message: ${message}`) // 'Receive message: new changed data!'
})
```

> 跟 Nodejs 内建的 EventEmitter 或其他程式框架常见的 EventBus 比起来， vscode.EventEmitter 的用法简单与简化许多。通常在其他 library 的实作里，一个 eventEmitter 可以监听多个事件，同时在传送事件源头的资料时指定其中一个事件发射资料，但在 vscode.EventEmitter 里，emitter 并不会监听多个事件，而仅会将不同事件源头的资料发布给订阅者，这是专为 VSCode 的元件特化的设计。

TreeDataProvider 已经监听了自己的 eventEmitter，只需要 fire 即可，此时会 refresh view

注册新的 viewContainer:

```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "treeview-explorer",
          "title": "TreeView Explorer",
          "icon": "assets/output.svg"
        }
      ]
    },
    "views": {
      "treeview-explorer": [
        {
          "id": "treeview",
          "name": "TreeView Explorer",
          "icon": "assets/output.svg",
          "contextualTitle": "TreeView Explorer"
        }
      ]
    },
    "viewsWelcome": [
      {
        "view": "treeview",
        "contents": "Welcome to NewTreeView \n [learn more](https://code.visualstudio.com/api/extension-guides/tree-view/).\n[Resgister Data Provider](command:day13-dataprovider.registerDataProvider)"
      }
    ]
  }
}
```

## Output Channel

在 OUTPUT panel 下

## Webview

````js
			const webviewPanel = vscode.window.createWebviewPanel(
				'webviewId',
				'WebView Title',
				vscode.ViewColumn.One,
			);

			webviewPanel.webview.html = loadWebView('./webview.html');
      ```
````
