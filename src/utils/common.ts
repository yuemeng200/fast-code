import * as vscode from 'vscode'

export function log(text: string) {
  if (process.env.NODE_ENV === 'development') {
    vscode.window.showInformationMessage(text)
  }
}

export function kebabToPascal(componentName: string) {
  return componentName.replace(/-(\w)/g, function (_, letter) {
    return letter.toUpperCase()
  })
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}