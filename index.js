import ws from 'ws'
import GlobalEmitService from './service/GlobalEmitService'
import ConnectController from './controller/ConnectController'
const wsServer = ws.Server({ port: 9001 })
const globalMap = {
  userMap: {},
  roomMap: {},
  roomUser: {}
}

wsServer.on('connection', ws => {
  console.log('new connect coming')
  new ConnectController(ws, globalMap)
})

console.log('websocket start:', wsServer.options.port)
