import * as vscode from 'vscode'
import { findComponentTargetPath, openTargetPathDocument } from '../utils/find-target-path'

const handler = async () => {
  let editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }
  const activeDocument = editor.document
  const position = editor.selection.active
  const targetPath = await findComponentTargetPath(activeDocument, position)
  if (!targetPath) {
    return
  }
  openTargetPathDocument(targetPath)
}

export default {
  name: 'fast-code.enterComponentDefination',
  handler,
}