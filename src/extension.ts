import * as vscode from 'vscode'
import enterComponentDefination from './commands/enter-component-defination'
import convertColor from './commands/convert-color'

export function activate(context: vscode.ExtensionContext) {
  const commands = [
    {
      name: 'fast-code.enterComponentDefination',
      command: enterComponentDefination,
    },
    {
      name: 'fast-code.convertColor',
      command: convertColor,
    },
  ]
  commands.forEach(({ name, command }) => {
    context.subscriptions.push(vscode.commands.registerCommand(name, command))
  })
}

export function deactivate() {}
