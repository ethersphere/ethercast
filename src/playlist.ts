export function createPlaylist(segments: string[]) {
    const playlist = [
        '#EXTM3U',
        '#EXT-X-PLAYLIST-TYPE:EVENT',
        '#EXT-X-VERSION:3',
        '#EXT-X-TARGETDURATION:10',
        '#EXT-X-MEDIA-SEQUENCE:0',
        ...segments.map((segment, index) => `#EXTINF:10.0,\nhttp://localhost:1633/bzz/${segment}/`)
    ].join('\n')
    return playlist
}
