/* Lovingly yanked from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date
 * Handy, as XMPP likes its dates in ISO format
 */
module.exports = function ISODateString(d){
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
}
