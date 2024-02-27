import * as vscode from 'vscode'
import * as fs from 'fs-extra'
import path from 'path'
import { log, kebabToPascal, capitalize, getFileRange } from '../utils/common'
import { findComponentTargetPath } from '../utils/file'
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
