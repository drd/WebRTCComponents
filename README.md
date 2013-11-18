# WebRTCComponents

A drop-in Web Component to start a WebRTC ... hangout.

## Usage

```html
<webrtc-context auto-request room=awesomesauce>
```

Note that NavigatorUserMedia doesn't seem to work when running from the filesystem, so running a web server such as `python -m SimpleHTTPServer` rooted to the `src/` directory is necessary.

And that's kind of it. But, if you deploy this in production, you'll need to run your own [signalling server](https://github.com/andyet/signalmaster).

## Support

Anything that [xtags](http://www.x-tags.org/index) and [SimpleWebRTC](https://github.com/HenrikJoreteg/SimpleWebRTC) support. Possibly a small fraction of your audience.

## Thanks

- [Henrik Joretag](https://github.com/HenrikJoretag)
- [Soledad Penadés](https://github.com/sole)
