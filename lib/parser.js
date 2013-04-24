/* Big ugly function to pivot XML-ish JSON into cleanly formatted JSON.
 *
 * Turns:
 * ```
 * {
*   "name": "message",
*   "attrs": {
*     "from": "tainthorsewhisperer@conference.jabber.org/other, other paul",
*     "to": "paul.sweeney@jabber.org/a60f0df5fb11b6eb",
*     "type": "groupchat",
*     "xmlns:stream": "http://etherx.jabber.org/streams"
*   },
*   "children": [
*     {
*       "name": "body",
*       "attrs": {},
*       "children": [
*         "whattup peeps!?"
*       ]
*     },
*     {
*       "name": "delay",
*       "attrs": {
*         "xmlns": "urn:xmpp:delay",
*         "stamp": "2013-04-24T03:44:07Z",
*         "from": "tainthorsewhisperer@conference.jabber.org"
*       },
*       "children": []
*     }
*   ]
* }
* ```
*
* Into:
* ```
* {
*   "from": "tainthorsewhisperer@conference.jabber.org/other, other paul",
*   "to": "paul.sweeney@jabber.org/a60f0df5fb11b6eb",
*   "type": "groupchat",
*   "body": {
*     "text": "whattup peeps!?"
*   },
*   "delay: {
*     "stamp": "2013-04-24T03:44:07Z",
*     "from": "tainthorsewhisperer@conference.jabber.org"
*   }
* }
* ```
*/

var _ = require('underscore')

function transform(stanza) {
  function handle(to, child) {
    var node = to[child.name] = _(child.attrs).omit(['xmlns', 'xmlns:stream'])

    // Child has a single text node
    if (child.children.length === 1 && typeof child.children[0] === 'string') {
      node.text = child.children[0]
    } else {
      child.children.forEach(handle.bind(null, node))
    }
  }

  var root = _(stanza.attrs).omit(['xmlns', 'xmlns:stream'])
  stanza.children.forEach(handle.bind(null, root))
  return root
}

// Errors contain an exmpty `x` element, and persist the error message as an
// object key, go figure.
transform.error = function(stanza) {
  var parsed = transform(stanza)
    , error = _(stanza.children).findWhere({name: 'error'})
    , message = error.children[0].name

  parsed.error.message = message;
  delete parsed.error[message];
  delete parsed.x
  return parsed
}

// Unwrap the `body.text` nonsense
transform.message = function(stanza) {
  var parsed = transform(stanza)
  parsed.body = parsed.body.text
  return parsed
}

// Copy the various keys off of the `x` element onto the message
transform.presence = function(stanza) {
  var parsed = transform(stanza)
  Object.keys(parsed.x).forEach(function(key) { parsed[key] = parsed.x[key] });
  delete parsed.x
  return parsed
}

module.exports = transform
