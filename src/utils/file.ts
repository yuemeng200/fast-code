import path from 'path'
import { readFile } from 'fs/promises'
import * as vscode from 'vscode'
import * as fs from 'fs-extra'

import { capitalize, kebabToPascal } from './common'

const NATIVE_TAGS = ['div', 'span', 'table', 'a', 'input']

// INFO 返回 import 语句 的 pathString
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

export async function getFileRange(filePath: string) {
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

// INFO 判断是否是别名路径
function isAliasPath(targetPath: string): boolean {
  return targetPath.startsWith('_')
}

// INFO 打开目标文件
async function openTargetPathDocument(targetPath: string) {
  console.log('🚀 ~ openTargetPathDocument ~ targetPath:', targetPath)
  const targetDocument = await vscode.workspace.openTextDocument(targetPath)
  await vscode.window.showTextDocument(targetDocument)
}

// INFO 返回别名的真实路径
async function resolveAliasPath(aliasPath: string) {
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
      console.log('🚀 alias -> realPath:', realPath)
      if (!fs.existsSync(realPath)) {
        vscode.window.showErrorMessage(`File not found for alias: ${aliasPath}`)
        return
      } else {
        return realPath
      }
    }
  }
  vscode.window.showErrorMessage(`Alias not found: ${aliasPath}`)
  return
}

async function findComponentTargetPath(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const lineNumber = position.line
  const lineText = document.lineAt(lineNumber).text
  const tagNameRegex = /<([A-Za-z0-9-]+)[^>]*>/
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
    const targetPath = isAliasPath(pathString)
      ? await resolveAliasPath(pathString)
      : path.resolve(document.fileName, '..', pathString)
    if (!targetPath) {
      return
    }
    if (!fs.existsSync(targetPath)) {
      vscode.window.showErrorMessage(`File not found: ${targetPath}`)
      return
    }

    return targetPath
  }
}

export {
  findImportPathString,
  isAliasPath,
  NATIVE_TAGS,
  resolveAliasPath,
  openTargetPathDocument,
  findComponentTargetPath,
}
