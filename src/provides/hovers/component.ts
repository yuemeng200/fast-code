import * as vscode from 'vscode'
import { findComponentTargetPath } from '../../utils/file'
import fs from 'fs'
// import { parse as vueParse } from '@vue/compiler-sfc'

import { parse as babelParse } from '@babel/parser'
import traverse from '@babel/traverse'
import babelGenerate from '@babel/generator'

const provide: vscode.HoverProvider = {
  async provideHover(document, position, token) {
    // 获取当前鼠标悬停位置的单词范围
    const range = document.getWordRangeAtPosition(position)
    if (!range) {
      return undefined
    }

    const targetPath = await findComponentTargetPath(document, position)
    if (!targetPath) {
      return
    }
    // 读取目标文件内容
    const targetFileContent = fs.readFileSync(targetPath, 'utf-8')
    // const { descriptor } = vueParse(targetFileContent)
    // if (!descriptor.script) {
    //   return
    // }
    // // 获取props
    // const scriptContent = descriptor.script.content

    const scriptContent = targetFileContent.match(
      /<script>([\s\S]+)<\/script>/
    )?.[1]

    if (!scriptContent) {
      return
    }
    console.log('🚀 ~ provideHover ~ scriptContent:', scriptContent)

    const ast = babelParse(scriptContent, {
      sourceType: 'module',
    })
    const componentProps = {} as Record<string, Object>
    traverse(ast, {
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type !== 'ObjectExpression') {
          return
        }
        const properties = path.node.declaration.properties
        for (let i = 0; i < properties.length; i++) {
          const prop = properties[i]
          if (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'props'
          ) {
            // props option
            const propsNode = prop.value
            if (propsNode.type === 'ObjectExpression') {
              for (let j = 0; j < propsNode.properties.length; j++) {
                // prop
                const propNode = propsNode.properties[j]
                if (
                  propNode.type === 'ObjectProperty' &&
                  propNode.key.type === 'Identifier' &&
                  propNode.value.type === 'ObjectExpression'
                ) {
                  const propName =
                    propNode.key.type === 'Identifier' ? propNode.key.name : ''
                  const propInfo = propNode.value.properties.reduce(
                    (info, prop) => {
                      if (prop.type === 'ObjectProperty') {
                        info[
                          prop.key.type === 'Identifier' ? prop.key.name : ''
                        ] = babelGenerate(prop.value).code
                      }
                      return info
                    },
                    {} as Record<string, string>
                  )
                  componentProps[propName] = propInfo
                }
              }
            }
          }
        }
      },
    })

    const hoverText = new vscode.MarkdownString()
    hoverText.appendMarkdown(`**Props Preview**\n\n`)
    for (const propName in componentProps) {
      const propInfo = componentProps[propName] as Record<string, string>
      hoverText.appendMarkdown(`\`${propName}\`\n`)
      Object.keys(propInfo).forEach(key => {
        hoverText.appendMarkdown(`- ${key}: ${propInfo[key]}\n`)
      })
      hoverText.appendMarkdown('\n')
    }

    return new vscode.Hover(hoverText, range)
  },
}

export default function componentDefinitionProvider() {
  return vscode.languages.registerHoverProvider('vue', provide)
}
