const globalMap = {}
const session = {}

export default (ws) => {
  console.log('wb, connection:')

  ws.on('message', (message) => {
    console.log('websocket message:', message)
  })

  ws.on('close', () => {
    console.log('websocket close')
  })

  ws.on('error', () => {
    console.log('websocket error')
  })
}
