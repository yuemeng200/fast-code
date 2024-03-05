import * as vscode from 'vscode'

/**
 *  Convert rgb to hex
 * @param r
 * @param g
 * @param b
 * @returns
 */
function rgbToHex(r: number, g: number, b: number): string {
  const rHex = r.toString(16)
  const gHex = g.toString(16)
  const bHex = b.toString(16)
  return rHex.length === 1 && gHex.length === 1 && bHex.length === 1
    ? `#${rHex}${gHex}${bHex}`
    : `#${rHex.padStart(2, '0')}${gHex.padStart(2, '0')}${bHex.padStart(
        2,
        '0'
      )}`
}

/**
 *  Convert hex to rgb
 * @param str
 * @returns
 */
function hexToRgb(str: string): string {
  let hex = str.replace('#', '')
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
}

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
    convertedText = lineText.replace(rgbRegex, (_, r, g, b) =>
      rgbToHex(+r, +g, +b)
    )
  } else if (hexRegex.test(lineText)) {
    convertedText = lineText.replace(hexRegex, match => hexToRgb(match))
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
