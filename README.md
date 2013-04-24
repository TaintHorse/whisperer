# What is this?

It's an IRC-like interface for XMPP Multi-User-Conferences (eg: chat rooms),
back-ended by the lovely, [node-xmpp](https://npmjs.org/package/node-xmpp).

It roughly implements XMPP's [IRC command mapping](http://xmpp.org/extensions/xep-0045.html#impl-client-irc)

## Usage

``` javascript
var Whisperer = require('whisperer')
  , client = new Whisperer({
      jid: 'bob@example.jabber.server.com'
      password: 'your password here'
    })

client.join({ jid: 'example@conference.jabber.org', nick: 'example' })
client.on('message', function(message) {
  console.log(message.from + ': ' + message.body)
})
```

## Methods

### Whisperer
Constructor. Accepts on object with the following keys

* __jid__: Your full XMPP username (user@server.com/optionalresource)
* __password__: Your password

### `join`
Joins a MUC. Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __nick__: The nickname you want to use in this room
* __password__: (optional) The room's password 
* __lastSeen__: (optional) JS Parse-able date for the last time you logged in.
Instructs the chat server to send by any message history it has since that time

### `message`
Sends a message to either a specific user, or the whole MUC.
Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __message__: The message you want to send
* __nick__: (optional) A user's nick to send a private message to

### `part`
Leaves a MUC. Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __message__: (optional) An optional parting message

### `part`
Changes your nickname in the room. Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __nick__: Your new nickname in this room

### `topic`
Changes the topic for the room. Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __topic__: The new topic of the room

### `invite`
Invites a user to the room. Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __user__: The full JID of the user you're inviting
* __message__: A brief message to the user

### Events

### `online`
Emitted when the client connects. No payload

### `error`
Emitted when the client encounters an error; example payload
``` json
{
  "from": "example@bconference.jabber.org",
  "to": "example@jabber.org",
  "type": "error",
  "error": {
    "code": "404",
    "type": "cancel",
    "message": "item-not-found"
  }
}
```

### `message`
Emitted when a user in the room sends a message, or the room plays back the
message history when you log in (look at the timestamp!)

Example payload:
``` json
{
  "from": "example@conference.jabber.org",
  "to": "example@jabber.org",
  "type": "groupchat",
  "body": "Whattup!?",
  "delay": {
    "stamp": "2013-04-24T03: 32: 41Z",
    "from": "example@conference.jabber.org"
  }
}
```

### `presence`
Emitted when the a user enters or exits the room, or changes their metadata
(nickname, permissions, etc..)

Example payload:
``` json
{
  "from": "example@conference.jabber.org/user",
  "to": "example@jabber.org",
  "item": {
    "affiliation": "owner",
    "role": "moderator"
  },
  "status": {
    "code": "201"
  }
}
```
