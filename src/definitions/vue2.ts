import * as vscode from 'vscode'
import * as fs from 'fs-extra'
import path from 'path'
import { log, kebabToPascal, capitalize } from '../utils/common'

// 从文本中查找组件 import 的相对路径
function findImportRelativePath(fileFullText: string, componentName: string) {
  // fix regex to support the uppercase componentName both
  const regex = `import\\s+(?:${componentName}|${capitalize(
    componentName
  )})\\s+from\\s+['"](.*)['"]`
  const match = fileFullText.match(regex)
  if (match) {
    return match[1]
  }
  return ''
}

async function openRelativePath(
  relativePath: string,
  document: vscode.TextDocument = vscode.window.activeTextEditor
    ?.document as vscode.TextDocument
) {
  let targetPath = vscode.workspace.rootPath + '/' + relativePath
  // if no exitname
  const dirname = path.dirname(targetPath)
  const extname = path.extname(targetPath)
  if (!fs.existsSync(targetPath) && !extname) {
    for (let file of fs.readdirSync(dirname)) {
      if (file.split('.')[0] == (targetPath.split('/').pop() as string)) {
        targetPath = targetPath + path.extname(file)
        break
      }
    }
  }
  if (!fs.existsSync(targetPath)) {
    return
  }
  const targetDocument = await vscode.workspace.openTextDocument(targetPath)
  await vscode.window.showTextDocument(targetDocument)
}

const provide: vscode.DefinitionProvider = {
  async provideDefinition(document, position, token) {
    const lineNumber = position.line
    const lineText = document.lineAt(lineNumber).text
    const tagNameRegex = /<([A-Za-z0-9-]+)[^>]*>/
    const tagNameMatch = lineText.match(tagNameRegex)
    const word = document.getText(document.getWordRangeAtPosition(position))
    const fileFullText = document.getText()
    // componnet tag
    if (tagNameMatch) {
      const componentName = kebabToPascal(word)
      const relativePath = findImportRelativePath(fileFullText, componentName)
      if (relativePath) {
        openRelativePath(relativePath)
      } else {
      }
      return null
    }

    // import alias
    const importAliasMatch = lineText.match(
      /import[\s\S]*?from\s*?'(([^.\dA-Za-z\/][\dA-Za-z]*)\/.*)'/
    )
    if (importAliasMatch && importAliasMatch[1] && importAliasMatch[2]) {
      const rawPath = importAliasMatch[1]
      const alias = importAliasMatch[2] as keyof typeof strategy
      // TEST
      const strategy = {
        '@': 'src',
        _lib: 'src/common',
        _com: 'src/components',
        _style: 'src/assets/style',
        _api: 'src/api',
      }
      if (!strategy[alias]) {
        return null
      }
      // relativePath is relative the root path

      const relativePath = rawPath.replace(alias, strategy[alias])
      if (relativePath) {
        openRelativePath(relativePath)
      }
    }
    return null
  },
}

export default function vueDefinitionProvider() {
  return vscode.languages.registerDefinitionProvider('vue', provide)
}
