const a = '#000'.replace(rgbRegex, (_, r, g, b) => {
  console.log("🚀 ~ convertedText=lineText.replace ~ r, g, b:", r, g, b)
  const hexR = parseInt(r).toString(16).padStart(2, '0')
  const hexG = parseInt(g).toString(16).padStart(2, '0')
  const hexB = parseInt(b).toString(16).padStart(2, '0')
  return `#${hexR}${hexG}${hexB}`
})

console.log(a);