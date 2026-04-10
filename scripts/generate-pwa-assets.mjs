import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const source = path.join(root, 'public', 'logo-kinetic.png')
const outputDir = path.join(root, 'public', 'icons')
const background = '#0a0a0a'

await mkdir(outputDir, { recursive: true })

const tasks = [
    { filename: 'pwa-192.png', size: 192, padding: 0.09 },
    { filename: 'pwa-512.png', size: 512, padding: 0.09 },
    { filename: 'pwa-maskable-192.png', size: 192, padding: 0.18 },
    { filename: 'pwa-maskable-512.png', size: 512, padding: 0.18 },
    { filename: '../apple-touch-icon.png', size: 180, padding: 0.11 },
    { filename: '../favicon.png', size: 64, padding: 0.08 },
]

const logo = sharp(source).trim()

await Promise.all(
    tasks.map(async ({ filename, size, padding }) => {
        const inset = Math.round(size * padding)
        const effectiveSize = size - inset * 2

        await logo
            .clone()
            .resize({
                width: effectiveSize,
                height: effectiveSize,
                fit: 'contain',
                background,
            })
            .flatten({ background })
            .extend({
                top: inset,
                bottom: inset,
                left: inset,
                right: inset,
                background,
            })
            .png()
            .toFile(path.join(outputDir, filename))
    }),
)

console.log('PWA assets generated successfully.')