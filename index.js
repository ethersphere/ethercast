import { Bee } from '@ethersphere/bee-js'
import { getStamp } from './library'

let playlistAddress = ''
let videoSegmentsCreated = 0
let lastPlaylist = ''

const stamp = await getStamp()
const bee = new Bee('http://localhost:1633')

const uploadedChunks = []

async function uploadChunk(chunk) {
    const hash = await bee.uploadFile(stamp, chunk, 'chunk.webm', { contentType: 'video/webm', deferred: true })
    uploadedChunks.push(hash.reference)
    videoSegmentsCreated++
    document.getElementById('video-segments-created').innerHTML = videoSegmentsCreated
}

async function uploadPlaylist() {
    const text = uploadedChunks.join('\n')
    lastPlaylist = text
    document.getElementById('last-playlist').innerHTML = lastPlaylist
    document.getElementById('last-playlist').scrollTo(0, document.getElementById('last-playlist').scrollHeight)
    const hash = await bee.uploadFile(stamp, text, 'playlist.txt', {
        contentType: 'text/plain',
        deferred: true
    })
    playlistAddress = hash.reference
}

document.querySelector('#stream').addEventListener('click', function () {
    navigator.mediaDevices
        .getUserMedia({
            video: {
                width: {
                    ideal: 320
                },
                height: {
                    ideal: 240
                },
                frameRate: { ideal: 15 }
            },
            audio: false
        })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp9',
                bitsPerSecond: 75000
            })
            mediaRecorder.ondataavailable = async event => {
                if (event.data.size > 0) {
                    await uploadChunk(new Uint8Array(await event.data.arrayBuffer()))
                    await uploadPlaylist()
                }
            }
            mediaRecorder.start(1000)
        })
        .catch(error => {
            console.error('Error:', error)
        })
})
let index = 0

document.querySelector('#play').addEventListener('click', async function () {
    const video = document.querySelector('#videoPlayer')
    video.style.display = 'block'
    const mediaSource = new MediaSource()
    video.src = URL.createObjectURL(mediaSource)
    mediaSource.addEventListener('sourceopen', async function () {
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"')
        setInterval(async () => {
            const segments = await getSegments()
            if (segments[index]) {
                const response = await fetch(`http://localhost:1633/bzz/${segments[index]}`)
                const data = await response.arrayBuffer()
                sourceBuffer.appendBuffer(new Uint8Array(data))
                index++
            }
        }, 500)
    })
})

async function getSegments() {
    const playlist = await bee.downloadFile(playlistAddress)
    const segments = playlist.data.text().split('\n')
    return segments.filter(x => x)
}
