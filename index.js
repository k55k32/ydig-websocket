import ws from 'ws'
import GlobalEmitService from './service/GlobalEmitService'
import ConnectController from './controller/ConnectController'
import fs from 'fs'
const wsServer = ws.Server({ port: 9001 })
const globalMap = {
  userMap: {},
  roomMap: {},
  roomUser: {},
  gameMap: {}
}

const fileData = fs.readFileSync('./word.txt','utf-8')
const allWord = fileData.split('\n')

function deleteExpireUser () {
  const allUsers = Object.values(globalMap.userMap)
  const nowTime = new Date().getTime()
  allUsers.forEach(u => {
    if (!u.isOnline) {
      const timeNotTouch = nowTime - u.lastLoginTime
      if (timeNotTouch > 1000 * 60 * 60 * 2) {
        console.log('user not touch ', timeNotTouch)
        u.inGame = false
        u.currentRoomId = ''
        delete globalMap.userMap[u.token]
        console.log('delete user from userMap: ', u.username)
      }
    }
  })
}

setInterval(_ => {
  deleteExpireUser()
}, 100000)

global.allKeys = allWord.map(w => {
  return w.split(':')
})

global.randomAllKeys = () => {
  global.allKeys = global.allKeys.sort(_ => {
    const randomInt = parseInt(Math.random() * 1000) % 3
    if (randomInt === 2) {
      return -1
    } else if (randomInt === 1) {
      return 1
    } else {
      return 0
    }
  })
}

global.randomAllKeys()



console.log('allGameKeys: ', allWord.length)

wsServer.on('connection', ws => {
  new ConnectController(ws, globalMap)
})

console.log('websocket start:', wsServer.options.port)
