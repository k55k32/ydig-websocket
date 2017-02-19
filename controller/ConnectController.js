import uuid from 'node-uuid'
import MessageService from '../service/MessageService'
import SenderService from '../service/SenderService'
export default class ConnectController {
  constructor (ws, globalMap) {
    this.token = uuid.v4()
    this.id = uuid.v4()
    this.username = ''
    this.currentRoomId = null
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
          ...globalMap,
          currentRoom: globalMap.roomMap[userClient.id],
          currentUsers: globalMap.roomUser[userClient.currentRoomId],
          send (data, type = messageData.type) {
            SenderService.sendToUser(userClient, data, type)
          },
          sendToSameRoom (data, type = messageData.type) {
            const currentRoomId = userClient.currentRoomId
            const users = globalMap.roomUser[currentRoomId]
            SenderService.sendToUsers(users, data, type)
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
