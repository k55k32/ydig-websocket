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
  console.log('new connect coming')
  new ConnectController(ws, globalMap)
})

console.log('websocket start:', wsServer.options.port)
