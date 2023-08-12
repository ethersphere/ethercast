export function createPlaylist(segments: string[]) {
    const playlist = [
        '#EXTM3U',
        '#EXT-X-VERSION:3',
        '#EXT-X-TARGETDURATION:10',
        '#EXT-X-MEDIA-SEQUENCE:0',
        ...segments.map((segment, index) => `#EXTINF:10.0,\n${segment}`),
        '#EXT-X-ENDLIST'
    ].join('\n')
    return playlist
}
