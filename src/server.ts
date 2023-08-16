import { Arrays } from 'cafe-utility'
import Koa from 'koa'
import open from 'open'
import { state } from './state'

export function startHttpServer() {
    const app = new Koa()
    app.use(context => {
        if (!state.feed && process.argv.includes('--rtmp')) {
            context.body = 'Feed not ready yet, refresh the page in a few seconds'
            return
        }
        const address = context.query.feed || state.feed
        context.body = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Swarm Stream</title>
        <link href="https://vjs.zencdn.net/8.3.0/video-js.css" rel="stylesheet" />
    </head>
    <body>
        <video id="my-video" class="video-js" controls preload="auto" width="640" height="264" data-setup="{}">
            <source src="http://localhost:1633/bzz/${address}/" type="application/x-mpegURL" />
            <p class="vjs-no-js">
                To view this video please enable JavaScript, and consider upgrading to a web browser that
                <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
            </p>
        </video>
        <script src="https://vjs.zencdn.net/8.3.0/video.min.js"></script>
    </body>
</html>`
    })
    app.listen(13337, () => {
        console.log('Stream player at http://localhost:13337')
        const address = Arrays.getArgument(process.argv, 'watch')
        if (address) {
            open(`http://localhost:13337/?feed=${address}`)
        }
    })
}
