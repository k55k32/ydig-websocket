global.roomId = null
function getRoomId() {
  const date = new Date()
  if (!global.roomId) {
    const start = parseInt('' + date.getDate() + date.getHours() + date.getMinutes())
    global.roomId = start
  } else {
    global.roomId += 2
  }
  return global.roomId
}
function getUserArray(currentUsers) {
  return Object.values(currentUsers).map(u => {
    return {
      username: u.username,
      id: u.id
    }
  })
}
function userLeave (ctx) {
  const { userClient, currentUsers, roomMap, userMap, currentRoom, sendToSameRoom } = ctx
  if (currentRoom && currentRoom.status === 1) {
    Object.values(currentUsers).forEach(u => {
      if (userClient.id === u.id) {
        delete currentUsers[u.id]
      }
    })
    currentRoom.joined = Object.values(currentUsers).length
    sendToSameRoom({id: userClient.id}, 'userLeave')
    console.log('leave room', currentRoom)
    global.$emit('room-changed', {userMap, roomChangeData: currentRoom})
  }
}

global.$on('userLeave', userLeave)

global.$on('UserReLine', ({currentRoom, userClient, roomUser}) => {
  if (currentRoom && currentRoom.status === 2) {
    const users = roomUser[userClient.currentRoomId] || {}
    users[userClient.id] = userClient
    roomUser[userClient.currentRoomId] = users
    send({id: currentRoom.id}, 'returnRoom')
    sendToSameRoom({id: userClient.id}, 'backToGame')
  }
})

function sendToSub(userMap, room, type) {
  if (room.type === '1') {
    Object.values(userMap).forEach(user => {
      if (user.changeSub) {
        user.send(room, type)
      }
    })
  }
}

global.$on('room-changed', ({userMap, roomChangeData}) => {
  sendToSub(userMap, {id: roomChangeData.id, type: roomChangeData.type, joined: roomChangeData.joined, status: roomChangeData.status}, 'roomChanged')
})

global.$on('room-created', ({userMap, roomChangeData}) => {
  sendToSub(userMap, roomChangeData, 'roomCreated')
})

export default {
  changeUnSub ({userClient}) {
    userClient.changeSub = false
  },
  changeSub ({userClient}) {
    userClient.changeSub = true
  },
  list ({send, roomMap, roomUser}) {
    const rooms = Object.values(roomMap).filter(room => {
      room.joined = Object.values(roomUser[room.id]).length
      return room.joined > 0 && room.status == 1 && room.type === '1'
    }).sort((a, b) => {
      if (a.joined > b.joined) {
        return 1
      } else if (a.createTime > b.createTime) {
        return 1
      } else {
        return 0
      }
    })
    send(rooms)
  },
  create ({ data, userClient, roomMap, roomUser, userMap, send }) {
    const room = {
      id: getRoomId(),
      name: data.name,
      createTime: new Date().getTime(),
      playNumber: 8,
      playTimes: 3,
      joined: 1,
      type: data.type,
      status: 1,
      gameTime: 60
    }
    roomMap[room.id] = room
    roomUser[room.id] = {}
    send(room)
  },
  enter ({ data, userClient, roomMap, roomUser, send, sendToSameRoom, userMap }) {
    const room = roomMap[data.id]
    if (!room) {
      return send({message: '房间不存在'}, 'roomClose')
    }
    const roomUsers = roomUser[room.id] || {}
    roomUser[room.id] = roomUsers
    const isReLink = roomUsers[userClient.id]
    if (room.joined >= room.playNumber) {
      return send({message: '房间人数已满，不可加入'}, 'roomFull')
    } else if (room.status === 2) {
      if (isReLink) {
        return sendToSameRoom({id: userClient.id, username: userClient.username}, 'userBack')
      } else {
        return send({message: '该房间游戏已开始，不可加入'}, 'roomBegin')
      }
    } else {
      roomUsers[userClient.id] = userClient
      room.joined = Object.values(roomUsers).length
      userClient.currentRoomId = room.id
      send(room)
      sendToSameRoom(getUserArray(roomUsers), 'userEnter')
      if (room.joined === 1) {
        global.$emit('room-created', {userMap, roomChangeData: room})
      } else {
        global.$emit('room-changed', {userMap, roomChangeData: room})
      }
    }
  },
  leave: userLeave
}
