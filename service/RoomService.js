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
  const { userClient, currentUsers, roomMap, currentRoom, sendToSameRoom } = ctx
  if (currentRoom && currentRoom.status === 1) {
    Object.values(currentUsers).forEach(u => {
      if (userClient.id === u.id) {
        delete currentUsers[u.id]
      }
    })
    sendToSameRoom({id: userClient.id}, 'userLeave')
  }
}

global.$on('userLeave', userLeave)

global.$on('UserReLine', ({userClient, roomUser}) => {
  const users = roomUser[userClient.currentRoomId] || {}
  users[userClient.id] = userClient
  roomUser[userClient.currentRoomId] = users
})

export default {
  create ({ data, userClient, roomMap, roomUser, send }) {
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
  enter ({ data, userClient, roomMap, roomUser, send, sendToSameRoom }) {
    const room = roomMap[data.id]
    if (!room) {
      return send({message: '房间已关闭'}, 'roomClose')
    }
    const roomUsers = roomUser[room.id] || []
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
      room.joined = Object.keys(roomUsers).length
      userClient.currentRoomId = room.id
      send(room)
      sendToSameRoom(getUserArray(roomUsers), 'userEnter')
    }
  },
  leave: userLeave
}
