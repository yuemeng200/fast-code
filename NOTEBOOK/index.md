# NOTE

## Question

- 如何通过 Event 的方式监听按键被按下，而不是注册快捷键的方式
- 如何获取鼠标 hover 内容
- 如何获取当前是否是 debug 模式
- 无法跳到.ts 文件，tsconfig 配置原因

### go defination

触发条件是 `hover + Command`, 但我真正想要的是 `Comand + hover(高亮) + confirm`

## Reference

[发布流程](https://juejin.cn/post/7066422674389467144?searchId=2024012816024949A2669EC903E13AC836#heading-7)
[manage extensions](https://marketplace.visualstudio.com/manage/publishers/amonduul?auth_redirect=True)

[extension samples](https://github.com/microsoft/vscode-extension-samples/tree/main)
[VS Code API](https://code.visualstudio.com/api/references/vscode-api)
