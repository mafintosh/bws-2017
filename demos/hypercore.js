var hypercore = require('hypercore')
var ram = require('random-access-memory')
var signalhub = require('signalhub')
var swarm = require('webrtc-swarm')

var feed = hypercore(ram, window.location.toString().split('#')[1])

document.body.innerHTML = `
  <input><br><br>
  <textarea></textarea><br><br>
  <button>send</button><br><br>
`

feed.on('ready', function () {
  var hub = signalhub(feed.key.toString('hex'), 'https://signalhub.mafintosh.com')
  var sw = swarm(hub)

  sw.on('peer', function (peer) {
    console.log('new peer')
    peer.pipe(feed.replicate({encrypt: false})).pipe(peer)
  })

  window.location = '#' + feed.key.toString('hex')
  document.querySelector('input').value = feed.key.toString('hex')
})

feed.createReadStream({live: true}).on('data', function (data) {
  var div = document.createElement('div')
  div.innerHTML = data.toString()
  document.querySelector('body').appendChild(div)
})

document.querySelector('button').onclick = function () {
  feed.append(document.querySelector('textarea').value)
}
