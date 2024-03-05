import * as vscode from 'vscode'
import { showInformationMessage, getConfigurationValue } from './utils/common'

import enterComponentDefinationCommand from './services/compotents/command'
import convertColorCommand from './services/tools/commands/convert-color'

import componentDefinitionProvider from './services/compotents/definition'
import componentPropsHoverProvider from './services/compotents/hover'
import componentCompletionProvider from './services/compotents/completion'

export function activate(context: vscode.ExtensionContext) {
  showInformationMessage('🚀 fast code start')

  const commands = [enterComponentDefinationCommand, convertColorCommand]
  commands.forEach(({ name, handler }) => {
    context.subscriptions.push(vscode.commands.registerCommand(name, handler))
  })

  const provides = [
    componentDefinitionProvider(),
    componentPropsHoverProvider(),
  ]

  if (getConfigurationValue<Boolean>('componentAutoRegistration', false)) {
    provides.push(componentCompletionProvider())
  }

  context.subscriptions.push(...provides)

  // 监听配置变化
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
