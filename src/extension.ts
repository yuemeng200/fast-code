import * as vscode from 'vscode'
import { log } from './utils/common'
import enterComponentDefinationCommand from './commands/enter-component-defination'
import convertColorCommand from './commands/convert-color'

import componentDefinitionProvider from './provides/definitions/component'
import componentPropsHoverProvider from './provides/hovers/component'


export function activate(context: vscode.ExtensionContext) {
  log('🚀 fast code start')

  const commands = [enterComponentDefinationCommand, convertColorCommand]
  commands.forEach(({ name, handler }) => {
    context.subscriptions.push(vscode.commands.registerCommand(name, handler))
  })

  const provides = [componentDefinitionProvider(), componentPropsHoverProvider()]
  context.subscriptions.push(...provides)
}

export function deactivate() {}
