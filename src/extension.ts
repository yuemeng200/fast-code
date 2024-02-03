import * as vscode from 'vscode'
import enterComponentDefination from './commands/enter-component-defination'
import convertColor from './commands/convert-color'

import vueDefinitionProvider from './definitions/vue2'
import { log } from './utils/common'

export function activate(context: vscode.ExtensionContext) {
  log('🚀 fast code start')
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

  const provides = [vueDefinitionProvider()]
  context.subscriptions.push(...provides)
}

export function deactivate() {}
