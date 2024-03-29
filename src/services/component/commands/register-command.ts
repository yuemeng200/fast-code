import * as vscode from 'vscode'
import fs from 'fs'
import path from 'path'
import {
  kebabToPascal,
  capitalize,
  getConfigurationValue,
} from '../../../utils/common'

interface Position {
  row: number
  column: number
}

/**
 *  Get the position of the target string in the text
 * @param text
 * @param target
 * @returns
 */
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

const handler = async (componentName: string, position: vscode.Position) => {
  console.log('🚀 ~ handler ~ componentName:', componentName)
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    return
  }

  const deleteTextLength = componentName.length + 1
  const deleteRange = new vscode.Range(
    new vscode.Position(position.line, position.character - deleteTextLength),
    position
  )

  await activeEditor.edit(editBuilder => {
    editBuilder.delete(deleteRange)
  })

  const isEnableAutoRegistration = getConfigurationValue<Boolean>(
    'componentAutoRegistration',
    false
  )
  if (!isEnableAutoRegistration) {
    return
  }

  const activeDocument = activeEditor.document
  const currentFilePath = activeDocument.uri.fsPath

  const relativePath = getComponentRelativePath(componentName, currentFilePath)
  if (!relativePath) {
    return
  }
  registerComponentInVueFile(componentName, relativePath)
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

  const componentPascalName = kebabToPascal(componentName)

  const importText = `import ${componentPascalName} from '${relativePath}'`
  // if already registered, return
  const importTextRegex = new RegExp(importText)
  const otherTextRegex = new RegExp(
    `import\s+${capitalize(componentPascalName)}\s+from\s+'${relativePath}'`
  )

  const fileText = activeDocument.getText()
  if (importTextRegex.test(fileText) || otherTextRegex.test(fileText)) {
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

export default {
  name: 'fast-code.registerComponent',
  handler,
}
