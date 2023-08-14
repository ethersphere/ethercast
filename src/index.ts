import { startRtmpServer } from './rtmp'
import { startHttpServer } from './server'
import { startUploader } from './uploader'

startHttpServer()
startRtmpServer()
startUploader()
