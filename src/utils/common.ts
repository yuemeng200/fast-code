import * as vscode from 'vscode'
import { readFile } from 'fs/promises'
import { Location, Position, Range, Uri } from 'vscode'

export function log(text: any) {
  // FIX
  const activeDebugConsole = vscode.debug.activeDebugConsole
  vscode.window.showInformationMessage(JSON.stringify(text))
}

export function tip(text: any) {
  vscode.window.showInformationMessage(JSON.stringify(text))
}

export function kebabToPascal(componentName: string) {
  return componentName.replace(/-(\w)/g, function (_, letter) {
    return letter.toUpperCase()
  })
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}


export async function getFileRange(filePath: string) {
  const textContent = await readFile(filePath, 'utf8')
  const lines = textContent.split(/\r?\n/)
  const lastLine = lines.at(-1)
  return new Range(
    new Position(0, 0),
    new Position(
      Math.max(0, lines.length - 1),
      lastLine === undefined ? 0 : Math.max(0, lastLine.length - 1)
    )
  )
}