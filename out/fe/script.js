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

async function renderRooms (nickname) {
  if (!('hash' in globalThis) && nickname) {
    globalThis.hash = await getHash(nickname)
  }
  const rooms = await getRooms()
  const tbody = document.getElementById('tbody') // ????????
  tbody.innerHTML = rooms.map((room) => `<tr>
<td>${room.id}</td>
<td>${room.name}</td>
<td>${room.players.length}/${room.maxPlayers}</td>
<td><a href="#room" onclick="renderRoom(${room.id})">-></a></td>
</tr>`).join('\n')
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
