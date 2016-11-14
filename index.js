import ws from 'ws'
import dispatch from './controller/DispatchController'
const wsServer = ws.Server({ port: 9001 })

wsServer.on('connection', ws => {
  dispatch(ws)
})


console.log('websocket start:', wsServer.options.port)
