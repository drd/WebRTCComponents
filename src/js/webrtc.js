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

	    Array.prototype.slice.call(this.children, 0).forEach(function(child) {
                if (getAttr(child, 'local')) {
                    this.local = child;
                } else if (getAttr(child, 'remote')) {
                    this.remote = child;
                }
	    }.bind(this));

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
        }
    }
});
