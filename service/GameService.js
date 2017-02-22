const firstScroe = 3
const sencondScore = 2
const minScore = 1
let gameKey = 0
function getGameKey () {
  let keyWord = global.allKeys[gameKey++]
  if (!keyWord) {
    global.randomAllKeys()
    gameKey = 0
    return global.allKeys[gameKey++]
  }
  return keyWord
}

function findNextUser(ctx) {
  const { sendToSameRoom, currentGame, currentUsers, userArray, userMap } = ctx
  const { playInfo, users, currentTimes, playTimes, userDraw } = currentGame

  const currentPlayer = playInfo.player
  const onLineUsers = getOnlineUser(ctx)
  if (onLineUsers.length === 0 || currentTimes >= playTimes) { // 如果在线人数为 0 或者 当前游戏次数大于等于 总游戏轮数， 游戏结束
    gameOver(ctx)
    return false
  }
  userDraw.push({
    key: playInfo.key[0],
    play: currentPlayer,
    username: currentUsers[currentPlayer].username,
    imageData: playInfo.imageData
  })
  let nextPlayer
  userArray.every((u, index) => {
    if (u.id === currentPlayer) {
      nextPlayer = userArray[index + 1]
      if (!nextPlayer) {  // 如果这个时候没有了，就是当前轮结束了
        currentGame.currentTimes++
        nextPlayer = userArray[0]
      }
      currentGame.playInfo = { // 重新设置当前playInfo
        key: getGameKey(),
        time: currentGame.gameTime,
        player: nextPlayer.id
      }
      if (userMap[nextPlayer.token].isOnline) {
        sendToSameRoom(null, 'changeGamer')
        currentGame.start = false
      } else {
        findNextUser(ctx)
      }
      return false
    }
    return true
  })
}

function toNextPlayer (ctx) {
  const { sendToSameRoom, currentGame, currentUsers } = ctx
  const { playInfo, users, currentTimes, playTimes, userDraw } = currentGame
  clearTimeout(currentGame.timer)
  sendToSameRoom({key: playInfo.key[0]}, 'thisOver')
  setTimeout(_ => {
    findNextUser(ctx)
  }, 5000)
}

function gameOver (ctx) {
  const { sendToSameRoom, currentGame, roomUser, currentRoom, roomMap, userArray } = ctx
  currentGame.isOver = true
  currentRoom.status = 1
  userArray.forEach(u => {
    u.inGame = false
  })
  sendToSameRoom(currentGame.userScore, 'gameOver')
  roomUser[currentRoom.id] = {}
}

function timeCountDown (ctx) {
  const { currentGame, sendToSameRoom } = ctx
  const { playInfo } = currentGame
  const time = playInfo.time
  if (time > 0) {
    playInfo.time--
    if (!playInfo.sendType && currentGame.gameTime / 2 >= playInfo.time) {
      playInfo.sendType = true
      sendToSameRoom(playInfo.key[1], 'typeHints')
    }
    sendToSameRoom(playInfo.time, 'timeout')
    currentGame.timer = setTimeout(_ => {
      timeCountDown(ctx)
    }, 1000)
  } else {
    toNextPlayer(ctx)
  }
}
function isAllFinish (ctx) {
  const {userClient, currentGame, sendToSameRoom} = ctx
  const {userScore, currentTimes, playInfo} = currentGame
  const scoreMap = userScore[playInfo.key[0]]
  const onlineUsers = getOnlineUser(ctx)
  const answerNumber = Object.keys(scoreMap).length
  if (answerNumber >= onlineUsers.length) {
    toNextPlayer(ctx)
  }
  const countScore = {}
  Object.values(userScore).forEach(score => {
    Object.keys(score).forEach(uid => {
      countScore[uid] = score[uid] + (countScore[uid] || 0)
    })
  })
  currentGame.countScore = countScore
  sendToSameRoom(countScore, 'countScore')
}

function getOnlineUser (ctx) {
  const {userMap, userArray} = ctx
  return userArray.filter(u => {
    return userMap[u.token].isOnline
  })
}

function startGame (ctx) {
  ctx.currentGame.start = true
  timeCountDown(ctx)
}

function countScore (ctx) {
  const {userClient, currentGame} = ctx
  const {userScore, currentTimes, playInfo} = currentGame
  const scoreKey = playInfo.key[0]
  let scoreMap = userScore[scoreKey]
  if (!scoreMap) {
    scoreMap = {}
    scoreMap[playInfo.player] = 0
  }
  userScore[scoreKey] = scoreMap
  const currentUserId = userClient.id
  if (scoreMap[currentUserId]) { // 如果已经有分数了，就返回0
    return 0
  }
  const answerNumber = Object.keys(scoreMap).length
  if (answerNumber === 1) { // 如果没有分数Map，那说明该人是第一个答对的 + `firstScroe` 分
    scoreMap[currentUserId] = firstScroe
    // 如果是第一个答对的，游戏时间缩小原来的 一般
    const halfTime = currentGame.gameTime / 2
    if (playInfo.time > halfTime) {
      playInfo.time = halfTime
    }
  } else if (answerNumber === 2) { // 第二个答对的 + `sencondScore` 分
    scoreMap[currentUserId] = sencondScore
  } else {
    scoreMap[currentUserId] = minScore // 第三及以后答对的 + `minScore` 分
  }
  scoreMap[playInfo.player] = Object.keys(scoreMap).length - 1 // 更新房主分数，当前批次，房主分数为答案总数
  isAllFinish(ctx)  // 判断是否已经全部答完
  return scoreMap[currentUserId]
}

function sendAnswer (ctx) {
  const {data, userClient, sendToSameRoom, currentGame} = ctx
  const {playInfo} = currentGame
  const currentKey = playInfo.key[0]
  const {username} = userClient
  let msg
  let type
  if (currentKey === data) {
    msg = `${username} 猜对了答案`
    const score = countScore(ctx)
    if (score > 0) {
      msg += `+${score}分`
    }
    type = 'answer'
  } else {
    msg = `${username} 说: ${data}`
  }
  sendToSameRoom({
    msg: msg,
    type: type
  }, 'receiveMsg')
}

global.$on('userLeave', (ctx) => {
  const {data, userClient, sendToSameRoom, currentGame} = ctx
  if (currentGame && !currentGame.isOver) {
    sendToSameRoom({id: userClient.id}, 'userOffline')
    if (getOnlineUser(ctx).length === 0) {
      gameOver(ctx)
    }
  }
})

export default {
  msg (ctx) {
    const {data, userClient, sendToSameRoom, currentGame} = ctx
    const username = userClient.username
    const msg = data
    if (currentGame) {
      sendAnswer(ctx)
    } else {
      sendToSameRoom({
        msg: `${username} 说: ${msg}`,
        type: 'normal'
      }, 'receiveMsg')
    }

  },
  begin (ctx) {
    const {userClient, currentRoom, sendToSameRoom, userArray, gameMap, userMap} = ctx
    if (userArray.length > 1 && userClient.id === userArray[0].id) { // 判断人数是否大于2人，并且当前人是否是房主
      currentRoom.status = 2
      userArray.forEach(u => u.inGame = true)
      gameMap[currentRoom.id] = {
        users: userArray,
        playTimes: currentRoom.playTimes,
        gameTime: currentRoom.gameTime,
        userScore: {},
        userDraw: [],
        countScore: {},
        currentTimes: 1,
        playInfo: {
          key: getGameKey(),
          player: userArray[0].id,
          time: currentRoom.gameTime
        }
      }
      global.$emit('room-changed', {userMap, roomChangeData: {id: currentRoom.id, type: currentRoom.type, status: currentRoom.status}})
      sendToSameRoom({id: currentRoom.id}, 'gameBegin')
    }
  },
  getData (ctx) {
    const {userClient, currentRoom, currentGame, send, data, sendError, sendToSameRoom} = ctx
    if (!currentGame || currentGame.isOver) {
      return sendError({type: 'gameOver', msg: '游戏已结束'})
    }
    if (userClient.currentRoomId === data.id) {
      const {users, playInfo, countScore} = currentGame
      const {player, key, time} = playInfo
      const gameData = {
        users: users.map(u => {
          return {id: u.id, username: u.username, score: countScore[u.id] || 0}
        }),
        player: player,
        time: time,
        imageData: playInfo.imageData
      }
      if (player === userClient.id) {
        gameData.key = key[0]
      } else {
        gameData.key = key[0].length + "个字"
      }
      if (!currentGame.start) {
        startGame(ctx)
      }
      send(gameData)
      sendToSameRoom({id: userClient.id}, 'userOnline')
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
