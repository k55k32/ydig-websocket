import ws from 'ws'
import DispatchController from './controller/DispatchController'
const wsServer = ws.Server({ port: 9001 })
const globelMap = {}
const sessionMap = {}

wsServer.on('connection', ws => {
  let dispatch = new DispatchController(ws, globelMap, sessionMap)
})

console.log('websocket start:', wsServer.options.port)
