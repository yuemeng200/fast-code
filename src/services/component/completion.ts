import * as vscode from 'vscode'

const provider: vscode.CompletionItemProvider = {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character)
    console.log('🚀 ~ linePrefix:', linePrefix)

    if (linePrefix.endsWith('/')) {
      const componentName = linePrefix.split('/').shift()?.trim()
      if (!componentName) {
        return []
      }
      const completionItem = new vscode.CompletionItem(
        `<${componentName}></${componentName}>`,
        vscode.CompletionItemKind.Snippet
      )
      completionItem.insertText = new vscode.SnippetString(
        `<${componentName}>$0</${componentName}>`
      )
      completionItem.detail = `Vue component: ${componentName}`
      completionItem.documentation = new vscode.MarkdownString(
        `Inserts a Vue component: \`<${componentName}></${componentName}>\``
      )
      completionItem.filterText = componentName
      completionItem.sortText = `a${componentName}`
      completionItem.preselect = true
      completionItem.command = {
        title: 'Trigger Completed',
        command: 'fast-code.registerComponent',
        arguments: [componentName, position],
      }
      return [completionItem]
    }
    return []
  },
}

export default function componentCompletionProvider() {
  return vscode.languages.registerCompletionItemProvider('vue', provider, '/')
}
