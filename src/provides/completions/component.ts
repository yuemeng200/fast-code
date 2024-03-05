import * as vscode from 'vscode'
import fs from 'fs'
import path from 'path'

import { kebabToPascal } from '../../utils/common'

/**
 *  Recursively find the target file in the current folder and its parent folder utill the rootPath
 * @param targetFileName
 * @param currentFolderPath
 * @returns
 */
function findComponentFile(targetFileName: string, currentFolderPath: string) {
  const currentFolderPathWithFile = path.join(currentFolderPath, targetFileName)
  if (fs.existsSync(currentFolderPathWithFile)) {
    return currentFolderPathWithFile
  }

  if (currentFolderPath === vscode.workspace.rootPath) {
    return null
  }
  if (fs.readdirSync(currentFolderPath).includes('components')) {
    return findComponentFile(
      targetFileName,
      path.join(currentFolderPath, 'components')
    )
  } else {
    const parentFolderPath = path.dirname(currentFolderPath)
    return findComponentFile(
      targetFileName,
      path.join(parentFolderPath, 'components')
    )
  }
}

/**
 *
 * @param componentName
 * @param currentFilePath
 * @returns
 */
function getComponentRelativePath(
  componentName: string,
  currentFilePath: string
): string | undefined {
  const targetFileName = componentName + '.vue'
  const currentFolderPath = path.dirname(currentFilePath)
  const targetFilePath = findComponentFile(targetFileName, currentFolderPath)
  if (!targetFilePath) {
    vscode.window.showErrorMessage('Component not found')
    return
  } else {
    let relativePath = path.relative(
      path.dirname(currentFilePath),
      targetFilePath
    )
    if (relativePath[0] !== '.') {
      relativePath = './' + relativePath
    }
    return relativePath
  }
}

interface Position {
  row: number
  column: number
}

function getTargetPosition(text: string, target: string): Position | undefined {
  const targetIndex = text.indexOf(target)
  if (targetIndex === -1) {
    return
  }
  const targetLine = text.slice(0, targetIndex).split('\n').length - 1
  const targetChar = targetIndex - text.lastIndexOf('\n', targetIndex - 1) - 1
  return {
    row: targetLine,
    column: targetChar,
  }
}

/**
 *  Register component in .vue file
 * @param componentName
 * @param relativePath
 * @returns
 */
function registerComponentInVueFile(
  componentName: string,
  relativePath: string
) {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    return
  }
  const activeDocument = activeEditor.document

  const importText = `import ${kebabToPascal(
    componentName
  )} from '${relativePath}'`
  // if already registered, return
  const importTextRegex = new RegExp(importText)
  const fileText = activeDocument.getText()
  if (importTextRegex.test(fileText)) {
    return
  }

  const lastImport = fileText.match(/import.*from.*/g)?.pop()
  let insertImportPosition: vscode.Position
  if (lastImport) {
    const lastImportPosition = getTargetPosition(fileText, lastImport)
    insertImportPosition = new vscode.Position(
      lastImportPosition!.row + 1,
      lastImportPosition!.column
    )
  } else if (fileText.includes('<script>')) {
    const scriptPosition = getTargetPosition(fileText, '<script>')
    insertImportPosition = new vscode.Position(
      scriptPosition!.row + 1,
      scriptPosition!.column
    )
  } else {
    vscode.window.showErrorMessage('No <script> tag found')
    return
  }

  // register component in components option
  const componentsOptionRegex = /components:\s*{[^}]*}/
  const componentsOptionMatch = fileText.match(componentsOptionRegex)
  if (!componentsOptionMatch) {
    vscode.window.showErrorMessage('No components option found')
    return
  }
  const componentsOption = componentsOptionMatch[0]
  const componentsOptionIndex = fileText.indexOf(componentsOption)
  const componentsOptionEndPosition = activeDocument.positionAt(
    componentsOptionIndex + componentsOption.length
  )
  const insertComponentPosition = new vscode.Position(
    componentsOptionEndPosition.line,
    0
  )
  const componentOptionText = `${kebabToPascal(componentName)},`
  activeEditor.edit(editBuilder => {
    editBuilder.insert(insertImportPosition, importText + '\n')
    editBuilder.insert(insertComponentPosition, `    ${componentOptionText}\n`)
  })
}

const provider: vscode.CompletionItemProvider = {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ) {
    const completionItems: vscode.CompletionItem[] = []
    const lineText = document.lineAt(position).text
    if (!lineText.match(/\S*\<[a-zA-Z\-\d]+\S*/)) {
      return
    }

    const completionItem = new vscode.CompletionItem(
      '/>',
      vscode.CompletionItemKind.Snippet
    )
    completionItem.detail = 'Insert component'

    // FIX 合理的方案是触发后替换行，但 Range 会导致自动补全提示失效，目前通过<绕过问题，后续优化
    // completionItem.range = new vscode.Range(
    //   new vscode.Position(position.line, 0),
    //   new vscode.Position(position.line, lineText.length)
    // )
    // const replaceLine = lineText.replace(
    //   /^(\s*)(\S+),(\s*)$/,
    //   (_, $1, $2, $3) => `${$1}<${$2}/>${$3}`
    // )

    completionItems.push(completionItem)
    return completionItems
  },
  // FIX 并不是用户接收后触发
  resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ) {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      return
    }
    const activeDocument = activeEditor.document
    const lineNumber = activeEditor.selection.active.line
    const lineText = activeDocument.lineAt(lineNumber).text
    const tagNameRegex = /<([A-Za-z0-9-]+)[>\s\n].*/
    const tagNameMatch = lineText.match(tagNameRegex)
    if (!tagNameMatch || !tagNameMatch[1]) {
      return
    }
    const componentName = tagNameMatch[1]
    const currentFilePath = activeDocument.uri.fsPath

    const relativePath = getComponentRelativePath(
      componentName,
      currentFilePath
    )
    if (!relativePath) {
      return
    }
    registerComponentInVueFile(componentName, relativePath)
    return item
  },
}

export default function componentCompletionProvider() {
  return vscode.languages.registerCompletionItemProvider('vue', provider, ' ')
}
