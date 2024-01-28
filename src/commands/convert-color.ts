import * as vscode from 'vscode'
import { log, kebabToPascal, capitalize } from '../utils/common'

export default async () => {
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
    convertedText = lineText.replace(rgbRegex, (_, r, g, b) => {
      console.log('🚀 ~ convertedText=lineText.replace ~ r, g, b:', r, g, b)
      const hexR = parseInt(r).toString(16).padStart(2, '0')
      const hexG = parseInt(g).toString(16).padStart(2, '0')
      const hexB = parseInt(b).toString(16).padStart(2, '0')
      return `#${hexR}${hexG}${hexB}`
    })
  } else if (hexRegex.test(lineText)) {
    convertedText = lineText.replace(hexRegex, match => {
      let hex = match.replace('#', '')
      // three digits to six digits
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map(char => char + char)
          .join('')
      }
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `rgb(${r}, ${g}, ${b})`
    })
  } else {
    log('no color found')
    return
  }

  // 更新编辑器中当前行的文本
  editor.edit(editBuilder => {
    const range = activeDocument.lineAt(lineNumber).range
    editBuilder.replace(range, convertedText)
  })
}
