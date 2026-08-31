import sharp from 'sharp'

const input = 'public/iphones/iphone-17e-black.png'
const reference = 'public/iphones/iphone-17e-white.png'

const refMeta = await sharp(reference).metadata()
const trimmed = await sharp(input).trim().png().toBuffer()
const trimmedMeta = await sharp(trimmed).metadata()

const canvasW = refMeta.width
const canvasH = refMeta.height

const scale = Math.min(
  (canvasW * 0.82) / trimmedMeta.width,
  (canvasH * 0.82) / trimmedMeta.height
)

const resizedW = Math.round(trimmedMeta.width * scale)
const resizedH = Math.round(trimmedMeta.height * scale)

const left = Math.round((canvasW - resizedW) / 2)
const top = Math.round((canvasH - resizedH) / 2)

const resized = await sharp(trimmed)
  .resize(resizedW, resizedH, { fit: 'contain' })
  .png()
  .toBuffer()

await sharp({
  create: {
    width: canvasW,
    height: canvasH,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }
})
  .composite([{ input: resized, left, top }])
  .png()
  .toFile(input)

console.log('OK:', input)