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
            WebRTCContext(this);

            this.room = getAttr(this, 'room').textContent;
            this.roomName = this.querySelector('.room');
            this.peers = {};

            this.local = this.querySelector('[local]');
            this.remote = this.querySelector('[remote]');

            this.videos = [this.local];
            this.context = new SimpleWebRTC({
                url: 'http://localhost:8888',
                debug: !true,
                localVideoEl: this.local,
                remoteVideosEl: this.remote,
                autoRequestMedia: !!getAttr(this, 'auto-request')
            });

            this.initChildren();

            this.setupJoinLeave.apply(this);
            this.setupSpeaking.apply(this);
        }
    }
});


xtag.register('webrtc-counter', {
    lifecycle: {
        created: function() {
            this.dataset['webrtc'] = true;
        },
        inserted: function() {
            this.innerHTML = '<span class="counter">';
            this.counter = this.querySelector('span');
        }
    },
    methods: {
        init: function(context) {
            this.context = context;
            this.count = context.videos.length;
            this.counter.innerText = this.count;
            context.context.on('video*', function() {
                this.counter.innerText = this.context.videos.length;
            }.bind(this));
        }
    }
});


function WebRTCContext(obj) {
    var proto = {
        initChildren: function() {
            var children = Array.prototype.slice.apply(
                this.querySelectorAll('[data-webrtc=true]'));

            children.forEach(function(child) {
                if (child.init) {
                    child.init(this);
                }
            }.bind(this));
        },

        setupSpeaking: function() {
            if (!getAttr(this, 'speaking', true)) {
                return;
            }

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
        },

        setupJoinLeave: function() {
            this.context.on('readyToCall', function(sessionId) {
                this.sessionId = sessionId;
                this.context.joinRoom(this.room, function() {
                    this.roomName.textContent = this.room;
                }.bind(this));
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
    };

    Object.getOwnPropertyNames(proto).forEach(function(name) {
        obj[name] = proto[name];
    });
};
