import * as vscode from 'vscode'

/**
 *  Judge if the current position is in the template tag
 * @param document
 * @param position
 * @returns
 */
function judgeInTemplate(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const fileText = document.getText()

  const templateStartIndex = fileText.indexOf('<template>')
  const templateEndIndex = fileText.indexOf('</template>')
  return (
    templateStartIndex !== -1 &&
    templateEndIndex !== -1 &&
    position.isBeforeOrEqual(document.positionAt(templateEndIndex)) &&
    position.isAfterOrEqual(
      document.positionAt(templateStartIndex + '<template>'.length)
    )
  )
}

const provider: vscode.CompletionItemProvider = {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character)
    const isInTemplate = judgeInTemplate(document, position)

    if (!isInTemplate || !linePrefix.endsWith('/')) {
      return []
    }
    const componentName = linePrefix.split('/').shift()?.trim()
    console.log('🚀 ~ componentName:', componentName)
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
    completionItem.command = {
      title: 'Trigger Completed',
      command: 'fast-code.registerComponent',
      arguments: [componentName, position],
    }
    return [completionItem]
  },
}

export default function componentCompletionProvider() {
  return vscode.languages.registerCompletionItemProvider('vue', provider, '/')
}
