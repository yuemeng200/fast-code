# Solution

## debug 时如何指定工作目录

使用 `添加文件夹` 而不是打开文件夹。

> TODO: 可配置 debug directory

## 无法 publish

https://stackoverflow.com/questions/59798905/vsce-publish-fails-vs-code-extension-using-pnpm-yarn

## debug 模式下 refresh 无法自动触发 activite

配置：

```json
"activationEvents": [
  "onStartupFinished"
]
```
