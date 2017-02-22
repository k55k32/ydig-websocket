import ws from 'ws'
import GlobalEmitService from './service/GlobalEmitService'
import DataService from './service/DataService'
import ConnectController from './controller/ConnectController'
const wsServer = ws.Server({ port: 9001 })
const globalMap = {
  userMap: {},
  roomMap: {},
  roomUser: {},
  gameMap: {}
}

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

wsServer.on('connection', ws => {
  new ConnectController(ws, globalMap)
})

console.log('websocket start:', wsServer.options.port)
