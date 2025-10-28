async function getHash (name) {
  const res = await fetch('/api/gethash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  })
  const { hash } = await res.json()
  globalThis.hash = hash
  return hash
}

async function getRooms () {
  const { hash } = globalThis
  const res = await fetch('/api/getrooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ hash })
  })
  const { last, rooms } = await res.json()
  globalThis.last = last
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
        body: JSON.stringify({ hash, last: globalThis.last }),
        signal: globalThis.controller.signal
      })
      const json = await res.json()
      if ('next' in json) continue
      const { rooms, last } = json
      globalThis.last = last
      renderRooms(rooms)
    } catch (e) {
      console.log(e)
      await wait(1000)
    }
  }
}

async function initRooms (nickname) {
  globalThis.state = 'lobby'
  if (!('hash' in globalThis)) {
    globalThis.hash = await getHash(nickname)
  }
  globalThis.nickname = nickname
  Array.from(document.querySelectorAll('.nickname')).forEach((n) => { n.innerHTML = nickname })
  const rooms = await getRooms()
  renderRooms(rooms)
  startRoomsUpdateLoop()
}

function renderRooms (rooms) {
  const tbody = document.querySelector('tbody')
  tbody.innerHTML = rooms.map((room) => `<tr>
<td>${room.id}</td>
<td>${room.name}</td>
<td>${room.numPlayers}/${room.maxPlayers}</td>
<td><a href="#room" onclick="initRoom(${room.id})">
<img src="data:image/svg+xml,%3Csvg width='48' height='21' viewBox='0 0 48 21' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10.5L46 10.5M46 10.5L31.6721 20M46 10.5L31.6721 1' stroke='black' stroke-width='2'/%3E%3C/svg%3E">
</a></td>
</tr>`).join('\n') + `<tr><td>#</td><td><input id="new-room-name" type="text"></td><td><input id="new-room-max-players" type="number"></td><td><a href="#room" onclick="createRoom(document.getElementById('new-room-name').value, document.getElementById('new-room-max-players').value)">+</a></td></tr>`
}

async function joinRoom (id) {
  const { hash } = globalThis
  const res = await fetch('/api/joinroom', {
    method: 'POST',
    body: JSON.stringify({ hash, id })
  })
  const { last, room } = await res.json()
  globalThis.last = last
  globalThis.state = 'room'
  return room
}

async function leaveRoom () {
  const { hash } = globalThis
  const res = await fetch('/api/leaveroom', {
    method: 'POST',
    body: JSON.stringify({ hash })
  })
  const { last, rooms } = await res.json()
  globalThis.last = last
  globalThis.state = 'rooms'
  return rooms
}

async function uninitRoom () {
  globalThis.state = 'lobby'
  globalThis.controller.abort()
  const rooms = await leaveRoom()
  renderRooms(rooms)
  startRoomsUpdateLoop()
}

async function initRoom (id) {
  globalThis.controller.abort()
  const room = await joinRoom(id)
  if (room.state === 'match' && room.players.find((player) => player.name === globalThis.nickname).moved === false) globalThis.movingState = 'moving'
  renderRoom(room)
  startRoomUpdateLoop(id)
}

async function startRoomUpdateLoop (id) {
  globalThis.controller = new AbortController()
  while ('state' in globalThis && globalThis.state === 'room') {
    try {
      const res = await fetch('/api/getroomchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, last: globalThis.last }),
        // body: JSON.stringify({ hash: globalThis.hash, last: globalThis.last }),
        signal: globalThis.controller.signal
      })
      const json = await res.json()
      if ('next' in json) continue
      const { last, room } = json
      globalThis.last = last
      console.log(room.state, globalThis.nickname)
      if (room.state === 'match' && room.players.find((player) => player.name === globalThis.nickname).moved === false) globalThis.movingState = 'moving'
      renderRoom(room)
    } catch (e) {
      console.log(e)
      await wait(1000)
    }
  }
}

const icons = {
  rock: "data:image/svg+xml,%3Csvg width='46' height='46' viewBox='0 0 46 46' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='23' cy='23' r='22' stroke='black' stroke-width='2'/%3E%3C/svg%3E",
  scissors: "data:image/svg+xml,%3Csvg width='49' height='49' viewBox='0 0 49 49' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='1.70711' y1='1.29289' x2='47.7071' y2='47.2929' stroke='black' stroke-width='2'/%3E%3Cline y1='-1' x2='65.0538' y2='-1' transform='matrix(-0.707107 0.707107 0.707107 0.707107 48 3)' stroke='black' stroke-width='2'/%3E%3C/svg%3E",
  paper: "data:image/svg+xml,%3Csvg width='45' height='46' viewBox='0 0 45 46' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='1' y='1' width='43' height='44' stroke='black' stroke-width='2'/%3E%3C/svg%3E"
}

function renderRoom (room) {
  const button = (shape) => `<button onclick="move('${shape}')"><img src="${icons[shape]}"></button>`
  const prime = (className, ...els) => `<div class="${className}">${els.join('')}</div>`
  const controls = () => prime('buttons', button('rock'), button('paper'), button('scissors'))
  const message = (msg, timer) => {
    if (!timer) return prime('message', msg)
    const t = (timer) => {
      const el = document.getElementById('timer')
      if (el) el.innerHTML = timer
      if (timer > 1) setTimeout(t, 1000, timer - 1)
    }
    setTimeout(t, 1000, timer - 1)
    return prime('message', `<div>${msg}</div><div id="timer">${timer}</div>`)
  }
  const player = (player, i, a) => `<div class="player" style="top: ${getCoordinates(i / a.length).y}%; left: ${getCoordinates(i / a.length).x}%;">${player.name}</div>`
  let table = room.players.map(player).join('\n')
  if (room.state === 'match' && globalThis.movingState === 'moving') table += controls()
  else if (room.state === 'match' && globalThis.movingState === 'waiting') table += message('Waiting for others to move')
  else if (room.state === 'break') table += message(room.state, 10)
  else if (room.state === 'waiting') table += message('Waiting for other players to join')
  else if (room.state === 'result') table += message(`${room.result} won!`, 10)
  document.getElementById('table').innerHTML = table
}

async function createRoom (name, maxPlayers) {
  const { hash } = globalThis
  const res = await fetch('/api/addroom', {
    method: 'POST',
    body: JSON.stringify({ hash, name, maxPlayers })
  })
  const room = await res.json()
  initRoom(room.id)
}

function getCoordinates (k) {
  const angle = k * 2 * Math.PI
  const x = (Math.sin(angle) + 1) * 50
  const y = (Math.cos(angle) + 1) * 50
  return { x, y }
}

async function move (shape) {
  const { hash } = globalThis
  try {
    globalThis.movingState = 'waiting'
    const res = await fetch('/api/move', {
      method: 'POST',
      body: JSON.stringify({ hash, shape })
    })
    const j = await res.json()
  } catch (e) {
    globalThis.movingState = 'moving'
  }
}

async function wait (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

