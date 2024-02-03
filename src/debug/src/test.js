const lineText = `import CptHeader from '_lib/components/cpt-header.vue'`

const match = lineText.match(/import[\s\S]*?from\s*?'(([^.\dA-Za-z\/][\dA-Za-z]*)\/.*)'/)
console.log(match);
