import path from 'path'
import { readFile } from 'fs/promises'
import * as vscode from 'vscode'
import fs from 'fs-extra'
import { capitalize, kebabToPascal } from './common'

const NATIVE_TAGS = [
  'div',
  'span',
  'table',
  'a',
  'input',
  'button',
  'img',
  'ul',
  'li',
]

/**
 * Find the import path string of full text
 * @param fileFullText
 * @param variable
 * @returns
 */
function findImportPathString(
  fileFullText: string,
  variable: string
): string | undefined {
  const regex = `import\\s+(?:${variable})\\s+from\\s+['"](.*)['"]`
  const match = fileFullText.match(regex)
  if (match) {
    return match[1]
  }
}

/**
 * Get the range of the file
 * @param filePath
 * @returns
 */
async function getFileRange(filePath: string) {
  const textContent = await readFile(filePath, 'utf8')
  const lines = textContent.split(/\r?\n/)
  const lastLine = lines.at(-1)
  return new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(
      Math.max(0, lines.length - 1),
      lastLine === undefined ? 0 : Math.max(0, lastLine.length - 1)
    )
  )
}

/**
 * Check whether it is an alias path
 * @param targetPath
 * @returns
 */
function isAliasPath(targetPath: string): boolean {
  return targetPath.startsWith('_')
}

/**
 * Open the target path document
 * @param targetPath
 */
async function openTargetPathDocument(targetPath: string): Promise<void> {
  console.log('🚀 ~ openTargetPathDocument ~ targetPath:', targetPath)
  const targetDocument = await vscode.workspace.openTextDocument(targetPath)
  await vscode.window.showTextDocument(targetDocument)
}

/**
 * Resolve the target path of an alias path
 * @param aliasPath
 * @returns The real path of the alias path
 */
async function resolveAliasPath(
  aliasPath: string
): Promise<string | undefined> {
  const jsconfigPath = vscode.workspace.rootPath
    ? path.join(vscode.workspace.rootPath, 'jsconfig.json')
    : undefined

  if (!jsconfigPath || !fs.existsSync(jsconfigPath)) {
    vscode.window.showErrorMessage('jsconfig.json not found.')
    return
  }

  const jsconfig = JSON.parse(fs.readFileSync(jsconfigPath, 'utf8'))
  const aliases = jsconfig.compilerOptions.paths
  const aliasKeys = Object.keys(aliases)

  for (const alias of aliasKeys) {
    const aliaskey = alias.replace('*', '')
    const regex = new RegExp(`^${aliaskey}.*$`)
    if (regex.test(aliasPath)) {
      const tagetKey = aliases[alias][0].replace('*', '')
      const realPath = path.resolve(
        vscode.workspace.rootPath!,
        tagetKey,
        aliasPath.replace(aliaskey, '')
      )
      return realPath
    }
  }
  vscode.window.showErrorMessage(`Alias not found: ${aliasPath}`)
  return
}

/**
 * Find the target path of the component element
 * @param document
 * @param position
 * @returns
 */
async function findComponentTargetPath(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<string | undefined> {
  const lineNumber = position.line
  const lineText = document.lineAt(lineNumber).text
  const tagNameRegex = /<([A-Za-z0-9-]+)[>\s\n].*/
  const tagNameMatch = lineText.match(tagNameRegex)
  if (!tagNameMatch) {
    return
  }
  const word = document.getText(document.getWordRangeAtPosition(position))
  const fileFullText = document.getText()
  if (tagNameMatch && !NATIVE_TAGS.includes(word)) {
    const componentName = kebabToPascal(word)
    const pathString =
      findImportPathString(fileFullText, componentName) ||
      findImportPathString(fileFullText, capitalize(componentName))
    if (!pathString) {
      return
    }
    let targetPath = isAliasPath(pathString)
      ? await resolveAliasPath(pathString)
      : path.resolve(document.fileName, '..', pathString)
    if (!targetPath) {
      return
    }
    if (!targetPath.match(/\.vue$/)) {
      targetPath = targetPath + '.vue'
    }
    if (!fs.existsSync(targetPath)) {
      vscode.window.showErrorMessage(`File not found: ${targetPath}`)
      return
    }

    return targetPath
  }
}

export { findComponentTargetPath, getFileRange, openTargetPathDocument }
