
function toNextPlayer (ctx) {
  const { sendToSameRoom } = ctx
  sendToSameRoom({}, 'thisOver')
  setTimeout(_ => {
    sendToSameRoom({}, 'changeGamer')
  }, 5000)
}

function timeCountDown (ctx) {
  const { currentGame, sendToSameRoom } = ctx
  const time = currentGame.playInfo.time
  if (time > 0) {
    currentGame.playInfo.time--
    sendToSameRoom(currentGame.playInfo.time, 'timeout')
    currentGame.timer = setTimeout(_ => {
      timeCountDown(ctx)
    }, 1000)
  } else {
    clearTimeout(currentGame.timer)
    toNextPlayer(ctx)
  }
}

function startGame (ctx) {
  ctx.currentGame.start = true
  timeCountDown(ctx)
}

export default {
  msg ({data, userClient, sendToSameRoom}) {
    const username = userClient.username
    const msg = data
    sendToSameRoom({
      msg: `${username} 说: ${msg}`,
      type: 'normal'
    }, 'receiveMsg')
  },
  begin ({userClient, currentRoom, sendToSameRoom, userArray, gameMap}) {
    if (userArray.length > 1 && userClient.id === userArray[0].id) { // 判断人数是否大于2人，并且当前人是否是房主
      currentRoom.status = 2
      userArray.forEach(u => u.inGame = true)
      gameMap[currentRoom.id] = {
        users: userArray,
        playTimes: currentRoom.playTimes,
        gameTime: currentRoom.gameTime,
        userScore: {},
        playInfo: {
          key: '测试词',
          player: userArray[0].id,
          time: currentRoom.gameTime
        }
      }
      sendToSameRoom({id: currentRoom.id}, 'gameBegin')
    }
  },
  getData (ctx) {
    const {userClient, currentRoom, currentGame, send, data, sendError} = ctx
    if (userClient.currentRoomId === data.id) {
      const {users, playInfo} = currentGame
      const {player, key, time} = playInfo
      const gameData = {
        users: users.map(u => {
          return {id: u.id, username: u.username}
        }),
        player: player,
        time: time,
        imageData: playInfo.imageData
      }
      if (player === userClient.id) {
        gameData.key = key
      } else {
        gameData.key = key.length + "个字"
      }
      if (!currentGame.start) {
        startGame(ctx)
      }
      send(gameData)
    } else {
      sendError({msg: '进入游戏失败'})
    }
  },
  drawAction ({sendToSameRoom, data, currentGame, userClient}) {
    if (userClient.id === currentGame.playInfo.player) {
      sendToSameRoom(data, 'drawAction')
    }
  },
  drawImage ({sendToSameRoom, data, currentGame, userClient}) {
    const { playInfo } = currentGame
    if (userClient.id === playInfo.player) {
      playInfo.imageData = data
      sendToSameRoom(data, 'drawImage')
    }
  }
}
