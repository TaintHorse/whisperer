var XMPP    = require("node-xmpp")
  , util    = require("util")
  , events  = require("events")
  , _       = require('underscore')
  , isodate = require("./lib/isodate")
  , parser  = require("./lib/parser")


function Client(opts, cb) {
  var self = this
    , jid = opts.jid
    , pass = opts.password

  this.user = jid
  this.rooms = {}

  this.client = new XMPP.Client({jid: jid, password: pass})

  this.client.on('online', function() { self.emit('online') })

  this.client.on('stanza', function(stanza) {
    if (stanza.type === 'error') {
      self.emit('error', parser.error(stanza))
    } else {
      if (typeof parser[stanza.name] === 'function') {
        self.emit(stanza.name, parser[stanza.name](stanza))
      } else {
        self.emit(stanza.name, parser(stanza))
      }
    }
  })

  if (typeof cb === 'function') {
    this.client.once('online', cb.bind(null, self))
  }
}

util.inherits(Client, events.EventEmitter);

Client.prototype.send = function(stanza) {
  var cleaned = stanza.root().toString()
  this.emit('sending', cleaned)
  this.client.send(cleaned)
}

Client.prototype.error = function(message) {
  var error = message
  if (typeof message === 'string') { error = new Error(message) }
  this.emit('error', error)
}

Client.prototype.join = function(opts) {
  var jid = opts.jid
    , nick = opts.nick
    , pass = opts.password
    , lastSeen = opts.lastSeen

  if (!jid || !nick) {
    return this.error('`join` requires a `nick` and `jid`')
  }

  var stanza = new XMPP.Presence({ from: this.user, to: jid+'/'+nick })
                        .c('x', {xmlns: 'http://jabber.org/protocol/muc' })

  if (lastSeen) { stanza.c('history', {since: isodate(new Date(lastSeen))}).up() }
  if (pass)     { stanza.c('password').t(pass).up()                              }

  this.rooms[jid] = nick
  this.send(stanza)
}

Client.prototype.message = function(opts) {
  var jid = opts.jid
    , nick = opts.nick
    , message = opts.message
    , stanza

  if (nick) { // Private message
    stanza = new XMPP.Message({to: jid+'/'+nick, type: 'chat'})
  } else { // Room message
    stanza = new XMPP.Message({from: this.user, to: jid, type: 'groupchat'})
  }

  this.send(stanza.c('body').t(message))
}

Client.prototype.part = function(opts) {
  var jid = opts.jid
    , status = opts.message
    , nick = this.rooms[jid]
    , stanza = new XMPP.Presence({ to: jid+'/'+nick, type: 'unavailable' })

  if (!jid) { return this.error("Need to tell us which `jid` you're leaving") }

  if (status) { stanza.c('status').t(status) }

  delete this.rooms[jid]
  this.send(stanza)
}

Client.prototype.nick = function(opts) {
  var jid = opts.jid
    , nick = opts.nick

  if (!jid || !nick) { return this.error('Need a `jid` and `nick` to update') }

  this.rooms[jid] = nick
  this.send(new XMPP.Presence({to: jid+'/'+nick}))
}

Client.prototype.topic = function(opts) {
  var jid = opts.jid
    , topic = opts.topic

  if (!jid || !topic) { return this.error("Need a `jid` and `topic` to update") }

  this.send(new XMPP.Message({ to: jid, type: 'groupchat', topic: topic }))
}

Client.prototype.invite = function(opts) {
  var jid = opts.jid
    , user = opts.user
    , reason = opts.message
    , stanza = new XMPP.Message({from: this.user, to: jid })

  stanza
    .c('x', {xmlns: 'http://jabber.org/protocol/muc#user'})
      .c('invite', {to: user})

  if (reason) { stanza.c('reason').t(reason) }

  this.send(stanza)
}

Client.prototype.ban = function() {
  return this.error('Not implemented')
  /*
    /ban <roomnick> [comment]	bans user with that roomnick from this room (client translates roomnick to bare JID)	
    <iq id='someid'
        to='room@service'
        type='set'>
      <query xmlns='http://jabber.org/protocol/muc#admin'>
        <item affiliation='outcast'
              jid='bare-jid-of-user'>
          <reason>comment</reason>
        </item>
      </query>
    </iq>
  */
}

Client.prototype.kick = function() {
  return this.error('Not implemented')
  /*
    /kick <roomnick> [comment]	kicks user with that roomnick from this room	
    <iq id='someid'
        to='room@service'
        type='set'>
      <query xmlns='http://jabber.org/protocol/muc#admin'>
        <item nick='roomnick' role='none'>
          <reason>comment</reason>
        </item>
      </query>
    </iq>
  */
}

module.exports = Client
