import * as vscode from 'vscode'

export function log(text: any) {
  // FIX
  const activeDebugConsole = vscode.debug.activeDebugConsole
  
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
