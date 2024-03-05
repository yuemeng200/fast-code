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
  ]

  if (getConfigurationValue<Boolean>('componentAutoRegistration', false)) {
    provides.push(componentCompletionProvider())
  }

  context.subscriptions.push(...provides)

  // Watch configuration change
  vscode.workspace.onDidChangeConfiguration(event => {
    const reloadKeys = ['fast-code.componentAutoRegistration']
    if (reloadKeys.some(key => event.affectsConfiguration(key))) {
      vscode.window.showInformationMessage(
        'Fast-code configuration changed. Reloading extension...'
      )
      vscode.commands.executeCommand('workbench.action.reloadWindow')
    }
  })
}

export function deactivate() {}
