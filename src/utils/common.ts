import * as vscode from 'vscode'

export function showInformationMessage(text: any) {
  vscode.window.showInformationMessage(JSON.stringify(text))
}

/**
 * Convert kebab-case to PascalCase
 * @param statement
 * @returns
 */
export function kebabToPascal(statement: string) {
  return statement.replace(/-(\w)/g, function (_, letter) {
    return letter.toUpperCase()
  })
}

/**
 * Capitalize the first letter of a string
 * @param str
 * @returns
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
