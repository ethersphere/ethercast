import { Bee } from '@ethersphere/bee-js'
import { Arrays, System } from 'cafe-utility'
import { Wallet } from 'ethers'
import { readFile, readdir, unlink } from 'fs/promises'
import { createPlaylist } from './playlist'
import { state } from './state'

export async function startUploader() {
    const bee = new Bee(Arrays.requireStringArgument(process.argv, 'bee'))
    const stamp = Arrays.requireStringArgument(process.argv, 'stamp')
    const feedStamp = Arrays.requireStringArgument(process.argv, 'feedStamp')

    const processedSegments: Record<string, string> = {}

    const wallet = Wallet.createRandom()

    const feed = bee.makeFeedWriter('sequence', '00'.repeat(32), wallet.privateKey)
    console.log('Creating root chunk')
    const rootChunk = await bee.createFeedManifest(feedStamp, 'sequence', '00'.repeat(32), wallet.address)
    console.log('Root chunk created with Swarm hash', rootChunk.reference)
    state.feed = rootChunk.reference

    System.forever(async () => {
        const files = await readdir('./media/live')
        for (const file of files) {
            if (!file.startsWith('index') || !file.endsWith('.ts')) {
                continue
            }
            if (processedSegments[file]) {
                continue
            }
            console.log('Interested in file =>', file)
            const path = `./media/live/${file}`
            const data = await readFile(path)
            console.log('Found a segment to be uploaded', path, 'with length', data.length)
            const uploadedSegment = await bee.uploadFile(stamp, data, 'segment.ts', {
                contentType: 'video/mp2t',
                deferred: true
            })
            processedSegments[file] = uploadedSegment.reference
            await unlink(path)
            console.log('Creating playlist with', Object.values(processedSegments).length, 'segments')
            const playlist = createPlaylist(Object.values(processedSegments))
            const uploadedPlaylist = await bee.uploadFile(stamp, playlist, 'index.m3u8', {
                contentType: 'application/x-mpegURL',
                deferred: true
            })
            console.log('About to update feed with the new playlist')
            const feedUploadResults = await feed.upload(feedStamp, uploadedPlaylist.reference, { deferred: true })
            console.log('Uploaded segment =>', `http://localhost:1633/bzz/${uploadedSegment.reference}/`)
            console.log('Uploaded playlist =>', `http://localhost:1633/bzz/${uploadedPlaylist.reference}/`)
            console.log('Uploaded feed =>', `http://localhost:1633/bzz/${feedUploadResults}/`)
        }
    }, 1000)
}
