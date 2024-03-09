import * as vscode from 'vscode'
import convert from 'color-convert'

const handler = async () => {
  let editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('No active text editor')
    return
  }

  const activeDocument = editor.document
  const lineNumber = editor.selection.active.line
  const lineText = activeDocument.lineAt(lineNumber).text
  const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
  const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}/

  let convertedText: string
  if (rgbRegex.test(lineText)) {
    convertedText = lineText.replace(
      rgbRegex,
      (_, r, g, b) => `#${convert.rgb.hex([r, g, b])}`
    )
  } else if (hexRegex.test(lineText)) {
    convertedText = lineText.replace(
      hexRegex,
      match => `rgb(${convert.hex.rgb(match)})`
    )
  } else {
    return
  }

  editor.edit(editBuilder => {
    const range = activeDocument.lineAt(lineNumber).range
    editBuilder.replace(range, convertedText)
  })
}

export default {
  name: 'fast-code.convertColor',
  handler: handler,
}
