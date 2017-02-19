import uuid from 'node-uuid'
import MessageService from '../service/MessageService'
import SenderService from '../service/SenderService'
export default class ConnectController {
  constructor (ws, globalMap) {
    this.token = uuid.v4()
    this.username = ''
    this.ws = ws
    this.isOnline = true
    const userClient = this
    ws.on('message', (message) => {
      try{
        const messageData = JSON.parse(message)
        const processFunction = MessageService[messageData.type] || MessageService['default']
        processFunction({
          message: message,
          type: messageData.type,
          data: messageData.data,
          userClient: userClient,
          userMap: globalMap.userMap,
          send (data) {
            SenderService.sendToUser(userClient, data, messageData.type)
          }
        })
      } catch (e) {
        console.error('parse message error', message, e)
      }
    })

    ws.on('close', _ => {
      console.log('ws close')
      this.isOnline = false
    })

    ws.on('error', _ => {
      console.log('ws error')
    })
  }
}
