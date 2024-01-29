import * as vscode from 'vscode'

// 插件激活时调用
export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor
  let timeout: NodeJS.Timeout | undefined = undefined

  // 监听活动编辑器的变化
  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeEditor = editor
    },
    null,
    context.subscriptions
  )

  // 监听文档变化
  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerHighlight(activeEditor)
      }
    },
    null,
    context.subscriptions
  )

  // 监听鼠标悬停事件
  vscode.languages.registerHoverProvider('vue', {
    provideHover(document, position, token) {
      const line = document.lineAt(position.line)
      const match = line.text.match(/\{\{\s*(\w+)\s*\}\}/)
      if (match) {
        return new vscode.Hover('Go to Definition')
      }
    },
  })

  // 注册命令，用于跳转到数据定义位置
  let disposable = vscode.commands.registerCommand(
    'vueGoToDefinition.goToDefinition',
    () => {
      if (!activeEditor) {
        return
      }

      const position = activeEditor.selection.active
      const line = activeEditor.document.lineAt(position)

      // 检查是否在变量上
      const match = line.text.match(/\{\{\s*(\w+)\s*\}\}/)
      if (!match) {
        return
      }

      const dataName = match[1]

      // 检查数据定义所在的位置，这里假设数据定义在 <script> 部分的 data() 方法中
      const scriptStartPosition = activeEditor.document.positionAt(
        activeEditor.document.getText().indexOf('<script>')
      )
      const scriptEndPosition = activeEditor.document.positionAt(
        activeEditor.document.getText().indexOf('</script>')
      )
      const scriptRange = new vscode.Range(
        scriptStartPosition,
        scriptEndPosition
      )

      // 搜索数据定义
      const dataMatch = activeEditor.document
        .getText(scriptRange)
        .match(new RegExp(`data\\s*\\(\\s*\\)\\s*\\{[^}]*\\b${dataName}\\s*:`))
      if (!dataMatch) {
        return
      }

      // 找到数据定义的位置并跳转
      const dataPosition = activeEditor.document.positionAt(
        scriptRange.start.character + dataMatch.index
      )
      activeEditor.selection = new vscode.Selection(dataPosition, dataPosition)
      activeEditor.revealRange(new vscode.Range(dataPosition, dataPosition))
    }
  )

  context.subscriptions.push(disposable)
}

// 触发高亮变量的函数
function triggerHighlight(editor: vscode.TextEditor) {
  if (timeout) {
    clearTimeout(timeout)
    timeout = undefined
  }
  timeout = setTimeout(() => {
    highlightDataReferences(editor)
  }, 500) // 延迟一段时间再进行高亮，以免影响编辑体验
}

// 高亮数据变量的函数
function highlightDataReferences(editor: vscode.TextEditor) {
  const document = editor.document
  const text = document.getText()

  // 匹配所有的 {{ dataName }}，并对其进行标记
  const dataReferences = text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)
  const decorations: vscode.DecorationOptions[] = []

  for (const match of dataReferences) {
    const dataName = match[1]
    const startPos = document.positionAt(match.index)
    const endPos = document.positionAt(match.index + match[0].length)
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: 'Go to Definition',
    }
    decorations.push(decoration)
  }

  // 应用标记
  editor.setDecorations(
    vscode.window.createTextEditorDecorationType({
      textDecoration: 'underline',
      overviewRulerColor: 'blue',
    }),
    decorations
  )
}
