import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const source = path.join(root, 'public', 'pwa-source.svg')
const outputDir = path.join(root, 'public', 'icons')

await mkdir(outputDir, { recursive: true })

const tasks = [
    { filename: 'pwa-192.png', size: 192, padding: 0 },
    { filename: 'pwa-512.png', size: 512, padding: 0 },
    { filename: 'pwa-maskable-192.png', size: 192, padding: 0.12 },
    { filename: 'pwa-maskable-512.png', size: 512, padding: 0.12 },
    { filename: '../apple-touch-icon.png', size: 180, padding: 0 },
]

await Promise.all(
    tasks.map(async ({ filename, size, padding }) => {
        const inset = Math.round(size * padding)
        const effectiveSize = size - inset * 2

        await sharp(source)
            .resize({
                width: effectiveSize,
                height: effectiveSize,
                fit: 'contain',
                background: '#0a0a0a',
            })
            .extend({
                top: inset,
                bottom: inset,
                left: inset,
                right: inset,
                background: '#0a0a0a',
            })
            .png()
            .toFile(path.join(outputDir, filename))
    }),
)

console.log('PWA assets generated successfully.')