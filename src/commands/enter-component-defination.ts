import * as vscode from 'vscode'
import * as path from 'path'
import { log, kebabToPascal, capitalize } from '../utils/common'

// 从文本中查找组件 import 的相对路径
function findImportRelativePath(fileText: string, componentName: string) {
  // fix regex to support the uppercase componentName both
  const regex = `import\\s+(?:${componentName}|${capitalize(
    componentName
  )})\\s+from\\s+['"](.*)['"]`
  const match = fileText.match(regex)
  if (match) {
    return match[1]
  }
  return ''
}

export default async () => {
  let editor = vscode.window.activeTextEditor
  if (!editor) {
    log('No active text editor')
    return
  }
  const activeDocument = editor.document
  const lineNumber = editor.selection.active.line
  const lineText = activeDocument.lineAt(lineNumber).text
  const tagNameRegex = /<([A-Za-z0-9-]+)[^>]*>/
  const tagNameMatch = lineText.match(tagNameRegex)
  if (!tagNameMatch) {
    log('No match found')
    return
  }
  const componentName = kebabToPascal(tagNameMatch[1])

  const fileText = activeDocument.getText()
  const RelativePath = findImportRelativePath(fileText, componentName)
  log(RelativePath)
  if (RelativePath) {
    const activeDocumentPath = activeDocument.uri.fsPath
    const targetPath = path.resolve(
      path.dirname(activeDocumentPath),
      RelativePath
    )
    const targetDocument = await vscode.workspace.openTextDocument(targetPath)
    await vscode.window.showTextDocument(targetDocument)
  } else {
    log('Component not found')
  }
}
