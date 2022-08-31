async function getHash (name) {
  const res = await fetch('/api/gethash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  })
  const { hash } = await res.json()
  console.log('got hash: ', hash)
  globalThis.hash = hash
  return hash
}

async function getRooms () {
  const { hash } = globalThis
  console.log('getting rooms w hash: ', hash)
  const res = await fetch('/api/getrooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ hash })
  })
  const rooms = await res.json()
  return rooms
}

async function startRoomsUpdateLoop () {
  const { hash } = globalThis
  globalThis.controller = new AbortController()
  while ('state' in globalThis && globalThis.state === 'lobby') {
    try {
      const res = await fetch('/api/getroomschange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hash }),
        signal: globalThis.controller.signal
      })
      const rooms = await res.json()
      renderRooms(rooms)
    } catch (e) { console.log(e) }
  }
}

async function initRooms (nickname) {
  globalThis.state = 'lobby'
  if (!('hash' in globalThis)) {
    globalThis.hash = await getHash(nickname)
  }
  const rooms = await getRooms()
  renderRooms(rooms)
  startRoomsUpdateLoop()
}

function renderRooms (rooms) {
  const tbody = document.querySelector('tbody') // ????????
  tbody.innerHTML = rooms.map((room) => `<tr>
<td>${room.id}</td>
<td>${room.name}</td>
<td>${room.numPlayers}/${room.maxPlayers}</td>
<td><a href="#room" onclick="initRoom(${room.id})">-></a></td>
</tr>`).join('\n') + `<tr><td>#</td><td><input id="new-room-name" type="text"></td><td><input id="new-room-max-players" type="number"></td><td><a href="#room" onclick="createRoom(document.getElementById('new-room-name').value, document.getElementById('new-room-max-players').value)">+</a></td></tr>`
}

async function joinRoom (id) {
  const { hash } = globalThis
  console.log('joinRoom hash: ', hash)
  const res = await fetch('/api/joinroom', {
    method: 'POST',
    body: JSON.stringify({ hash, id })
  })
  const room = await res.json()
  return room
}

async function initRoom (id) {
  globalThis.state = 'room'
  globalThis.controller.abort()
  const room = await joinRoom(id)
  renderRoom(room)
  startRoomUpdateLoop(id)
}

async function startRoomUpdateLoop () {
  globalThis.controller = new AbortController()
  while ('state' in globalThis && globalThis.state === 'room') {
    try {
      const res = await fetch('/api/getroomchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hash: globalThis.hash }),
        signal: globalThis.controller.signal
      })
      const rooms = await res.json()
      renderRooms(rooms)
    } catch (e) { console.log(e) }
  }
}

function renderRoom (room) {
  const table = document.getElementById('table')
  table.innerHTML = room.players.map((player, i, a) => `<div class="player" style="top: ${getCoordinates(i / a.length).y}%; left: ${getCoordinates(i / a.length).x}%;">${player.name}</div>`)
    .join('\n') + (/waiting|break/.test(room.state)) ? 'waiting for players...' : `<div class="buttons"><button onclick="move('rock')">o</button><button onclick="move('scissors')>x</button><button onclick="move('paper')>h</button></div>`
}

async function createRoom (name, maxPlayers) {
  const { hash } = globalThis
  const res = await fetch('/api/addroom', {
    method: 'POST',
    body: JSON.stringify({ hash, name, maxPlayers })
  })
  const room = await res.json()
  renderRoom(room.id)
}

function getCoordinates (k) {
  const angle = k * 2 * Math.PI
  const x = (Math.sin(angle) + 1) * 50
  const y = (Math.cos(angle) + 1) * 50
  return { x, y }
}

async function move (shape) {
  const { hash } = globalThis
  const res = await fetch('/api/makeamove', {
    method: 'POST',
    body: JSON.stringify({ hash, shape })
  })
  const j = await res.json()
}
