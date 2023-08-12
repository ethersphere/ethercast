import { Bee } from '@ethersphere/bee-js'
import { Arrays, System } from 'cafe-utility'
import { readFile, readdir, unlink } from 'fs/promises'
import { createPlaylist } from './playlist'

export async function startUploader() {
    const bee = new Bee(Arrays.requireStringArgument(process.argv, 'bee'))
    const stamp = Arrays.requireStringArgument(process.argv, 'stamp')

    const processedSegments: Record<string, string> = {}

    const feed = bee.makeFeedWriter('sequence', '00'.repeat(32))

    System.forever(async () => {
        const files = await readdir('./media/live')
        for (const file of files) {
            if (!file.startsWith('index') || !file.endsWith('.ts')) {
                continue
            }
            if (processedSegments[file]) {
                continue
            }
            const path = `./media/live/${file}`
            const data = await readFile(path)
            const uploadedSegment = await bee.uploadData(stamp, data, { deferred: true })
            processedSegments[file] = uploadedSegment.reference
            await unlink(path)
            const playlist = createPlaylist(Object.values(processedSegments))
            const uploadedPlaylist = await bee.uploadFile(stamp, playlist, 'index.m3u8', {
                contentType: 'application/vnd.apple.mpegurl'
            })
            const feedUploadResults = await feed.upload(stamp, uploadedPlaylist.reference)
            console.log('Uploaded segment =>', uploadedSegment.reference)
            console.log('Uploaded playlist =>', uploadedPlaylist.reference)
            console.log('Uploaded feed =>', feedUploadResults)
        }
    }, 1000)
}
