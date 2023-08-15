import { Arrays } from 'cafe-utility'
import NodeMediaServer from 'node-media-server'

export function startRtmpServer() {
    const server = new NodeMediaServer({
        rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60
        },
        http: {
            port: 8000,
            allow_origin: '*',
            mediaroot: './media'
        },
        trans: {
            ffmpeg: Arrays.requireStringArgument(process.argv, 'ffmpeg'),
            tasks: [
                {
                    app: 'live',
                    hls: true,
                    hlsFlags: '[hls_time=1:hls_list_size=0]',
                    dash: true,
                    dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
                }
            ]
        }
    })

    server.run()
}
