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
    roomUser[room.id] = [userClient]
    userClient.currentRoomId = room.id
    send(room)
  },
  enter ({ data, userClient, roomMap, roomUser, send, sendToSameRoom }) {
    const room = roomMap[data.id]
    if (!room) {
      return send({}, 'roomClose')
    }
    const roomUsers = roomUser[room.id]
    const isReLink = roomUsers.indexOf(userClient)
    if (room.joined >= room.playNumber) {
      return send({message: '房间人数已满，不可加入'}, 'roomFull')
    } else if (room.status === 2 && !isReLink) {
      return send({message: '该房间游戏已开始，不可加入'}, 'roomBegin')
    } else if (isReLink){
      sendToSameRoom({id: userClient.id, username: userClient.username}, 'userBack')
    } else {
      roomUsers.push(userClient)
      room.joined++
      send({...room, users: roomUsers.map(u => {
        return {
          username: u.username,
          id: u.id
        }
      })})
      sendToSameRoom({id: userClient.id, username: userClient.username}, 'userEnter')
    }
  },
  leave ({ userClient, currentUsers, currentRoom, sendToSameRoom }) {
    const index = currentUsers.indexOf(userClient)
    currentUsers.splice(index, 1)
    currentRoom.joined--
    userClient.currentRoomId = null
    sendToSameRoom({id: userClient.id}, 'userLeave')
  }
}
