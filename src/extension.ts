import * as vscode from 'vscode'
import { showInformationMessage, getConfigurationValue } from './utils/common'

import enterComponentDefinationCommand from './services/component/commands/enter-command'
import convertColorCommand from './services/tools/commands/convert-color'
import registerComponentCommand from './services/component/commands/register-command'

import componentDefinitionProvider from './services/component/definition'
import componentPropsHoverProvider from './services/component/hover'
import componentCompletionProvider from './services/component/completion'

export function activate(context: vscode.ExtensionContext) {
  showInformationMessage('🚀 fast code start')

  // Register commands
  const commands = [
    enterComponentDefinationCommand,
    convertColorCommand,
    registerComponentCommand,
  ]
  commands.forEach(({ name, handler }) => {
    context.subscriptions.push(vscode.commands.registerCommand(name, handler))
  })

  // Register providers
  const provides = [
    componentDefinitionProvider(),
    componentPropsHoverProvider(),
    componentCompletionProvider(),
  ]

  context.subscriptions.push(...provides)
}

export function deactivate() {}
