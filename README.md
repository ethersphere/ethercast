Video player to watch streams on Swarm feeds and RTMP server middleware for streaming on Swarm

# Watch

## 1. Install ethercast

```
npm install --global ethercast
```

## 2. Tune in on a stream

```
ethercast --watch 844b1bef0fcc3700995700465ef09ebea4a44fc23e3c59ffc84aa87f82f74627
```

## 3. Open browser

[http://localhost:13337](http://localhost:13337)

# Stream

## 1. Install ethercast

```
npm install --global ethercast
```

## 2. Run a Bee node as light node or above

## 3. Install ffmpeg

## 4. Create one or two postage batches for the video and playlist data

```
swarm-cli stamp buy --depth 20 --amount 2b --immutable --label playlist
swarm-cli stamp buy --depth 20 --amount 2b --label video
```

## 5. Run the RTMP middleware

```
ethercast \
    --rtmp
    --bee        http://localhost:1633
    --stamp      YOUR_VIDEO_STAMP_ID
    --feedStamp  YOUR_PLAYLIST_STAMP_ID
    --ffmpeg     PATH_TO_FFMPEG

```

## 6. Stream with OBS

Set target to `rtmp://localhost/live`
