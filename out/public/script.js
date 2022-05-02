async function getHash (nickname) {
  const res = await fetch('/api/gethash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nickname })
  })
  const hash = await res.text()
  return hash
}

async function getRooms () {
  const res = await fetch('/api/getrooms')
  const rooms = await res.json()
  return rooms
}

async function startRoomsUpdateLoop () {
  while ('state' in globalThis && globalThis.state === 'lobby') {
    const res = await fetch('/api/getroomschange')
    const rooms = await res.json()
    renderRooms(rooms)
  }
}

async function initRooms (nickname) {
  globalThis.state = 'lobby'
  if (!('hash' in globalThis) && nickname) {
    globalThis.hash = await getHash(nickname)
  }
  const rooms = await getRooms()
  console.log(rooms)
  renderRooms(rooms)
}

function renderRooms (rooms) {
  const tbody = document.querySelector('tbody') // ????????
  tbody.innerHTML = rooms.map((room) => `<tr>
<td>${room.id}</td>
<td>${room.name}</td>
<td>${room.numPlayers}/${room.maxPlayers}</td>
<td><a href="#room" onclick="renderRoom(${room.id})">-></a></td>
</tr>`).join('\n') + '<tr><td><input type="text"></td><td><a href="#room">+</a></td></tr>'
// TODO: create new room row
}

async function joinRoom (roomId) {
  const { hash } = globalThis
  const res = await fetch('/api/joinroom', {
    method: 'POST',
    body: JSON.stringify({ hash, roomId })
  })
  const room = await res.json()
  return room
}

async function renderRoom (roomId) {
  const room = joinRoom(roomId)
}
