function getAttr(el, attr) {
    return el.attributes.getNamedItem(attr);
}

xtag.register('webrtc-context', {
    lifecycle: {
        created: function() {
            console.log('webrtc-context created');
            var tpl = document.getElementById('webrtc').content;
            this.appendChild(tpl.cloneNode(true));
        },
        inserted: function() {
            this.room = getAttr(this, 'room').textContent;
            this.roomName = this.querySelectorAll('h1')[0];
            this.peers = {};

	    Array.prototype.slice.call(this.children, 0).forEach(function(child) {
                if (getAttr(child, 'local')) {
                    this.local = child;
                } else if (getAttr(child, 'remote')) {
                    this.remote = child;
                }
	    }.bind(this));

            this.videos = [this.local];
            this.context = new SimpleWebRTC({
                localVideoEl: this.local,
                remoteVideosEl: this.remote,
                autoRequestMedia: !!getAttr(this, 'auto-request')
            });

            this.context.on('readyToCall', function() {
                this.context.joinRoom(this.room, function() {
                    this.roomName.textContent = this.room;
                }.bind(this));
            }.bind(this));

            this.context.on('speaking', function(peer) {
                if (!peer) {
                    var video = this.local;
                } else {
                    var video = this.peers[peer.id].videoEl;
                }
                this.videos.forEach(function(v) {
                    v.classList.remove('speaking');
                });
                video.classList.add('speaking');
            }.bind(this));

            this.context.on('stoppedSpeaking', function(peer) {
                if (!peer) {
                    var video = this.local;
                } else {
                    var video = this.peers[peer.id].videoEl;
                }
                video.classList.remove('speaking');
            }.bind(this));

            this.context.on('videoAdded', function(video, peer) {
                this.peers[peer.id] = peer;
                video.peerId = peer.id;
                this.videos.push(video);
                console.log('videoAdded', peer);
            }.bind(this));

            this.context.on('videoRemoved', function(video, peer) {
                delete this.peers[peer.id];
                this.videos.forEach(function(v, i) {
                    if (v.peerId == peer.id) {
                        this.videos.splice(i, 1);
                    }
                }.bind(this));
                console.log('videoRemoved', peer)
            }.bind(this));
        }
    }
});
