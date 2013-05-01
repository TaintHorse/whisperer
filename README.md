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


client.on('online', function() {
  client.join({ jid: 'example@conference.jabber.org', nick: 'example' })
  client.message({to: my@friend.com, message: 'oh hai!'})
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
* __id__: (optional) ID for identifying message receipts

### `part`
Leaves a MUC. Accepts on object with the following keys

* __jid__: The address of the MUC (roomname@server.com)
* __message__: (optional) An optional parting message

### `nick`
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

### `info`
Fetches info about a resource (entity, JID, client, etc..)

* __resource__: The URL you want to get information about
* __id__: (optional) ID to used to identify the result stanza

### `items`
Fetches a resource's (entity, JID, client, etc..) items

* __resource__: The URL you want to get items from
* __id__: (optional) ID to used to identify the result stanza


## Events

### `online`
Emitted when the client connects. No payload

### `error`
Emitted when the client encounters an error; example payload

``` xml
<message from="doesntexist@missing.server"
         to="example@jabber.org/db383b0d6a7c43d9"
         type="error"
         xmlns:stream="http://etherx.jabber.org/streams"
>
  <body>whattup peeps!?</body>
  <error code="404" type="cancel">
    <remote-server-not-found xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>
  </error>
</message>
```

### `message`
Emitted when a user in the room sends a message, or the room plays back the
message history when you log in (look at the timestamp!)

Example payload:
``` json
<message from="example@conference.jabber.org/person"
        to="example@jabber.org/c394ea7448e172c0"
        type="groupchat"
        xmlns:stream="http://etherx.jabber.org/streams"
>
  <body>whattup peeps!?</body>
</message>
```

### `presence`
Emitted when the a user enters or exits the room, or changes their metadata
(nickname, permissions, etc..)

Example payload:
``` xml
<presence from="example@conference.jabber.org/person"
          to="person@jabber.org/c394ea7448e172c0"
          type="unavailable"
          xmlns:stream="http://etherx.jabber.org/streams"
>
  <x xmlns="http://jabber.org/protocol/muc#user">
    <item affiliation="owner" role="none"/>
    <status code="110"/>
  </x>
</presence>
```

### `info`
Emitted when a request for info returns.

Example payload:
``` xml
<iq from="example@conference.jabber.org"
    to="example@jabber.org/c394ea7448e172c0"
    type="result"
    xmlns:stream="http://etherx.jabber.org/streams"
>
  <query xmlns="http://jabber.org/protocol/disco#info">
    <identity category="conference" name="tainthorseredux" type="text"/>
    <feature var="http://jabber.org/protocol/muc"/>
    <feature var="http://jabber.org/protocol/muc#unique"/>
    <feature var="muc_temporary"/>
    <feature var="muc_open"/>
    <feature var="muc_anonymous"/>
  </query>
</iq>
```

### `items`
Emitted when a request for items returns.

Example payload:
``` xml
<iq from="example@conference.jabber.org"
    to="example@jabber.org/c394ea7448e172c0"
    type="result"
    xmlns:stream="http://etherx.jabber.org/streams"
>
  <query xmlns="http://jabber.org/protocol/disco#items">
    <item jid="example@conference.jabber.org/person"/>
  </query>
</iq>
```
