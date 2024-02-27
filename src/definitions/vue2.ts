import * as vscode from 'vscode'
import { findComponentTargetPath, getFileRange } from '../utils/file'
import { Position, TextDocument, CancellationToken, Uri, Definition } from 'vscode'

const provide: vscode.DefinitionProvider = {
  async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<
    Definition | DefinitionLink[] | LocationLink[] | null | undefined
  > {

    const targetPath = await findComponentTargetPath(document, position)
    if (!targetPath) {
      return
    }
    const targetUri = Uri.file(targetPath)
    const targetRange = await getFileRange(targetUri.fsPath) // 设置 peeked editor 显示的文件内容范围
    const definitionLink: DefinitionLink = {
      originSelectionRange: document.getWordRangeAtPosition(position)!,
      targetUri,
      targetRange,
    }
    // FIX 会显示多个definition
    return [definitionLink]
  },
}

export default function vueDefinitionProvider() {
  return vscode.languages.registerDefinitionProvider('vue', provide)
}
