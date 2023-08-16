import { startRtmpServer } from './rtmp'
import { startHttpServer } from './server'
import { startUploader } from './uploader'

startHttpServer()
if (process.argv.includes('--rtmp')) {
    startRtmpServer()
    startUploader()
}
