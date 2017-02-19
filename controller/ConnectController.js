import uuid from 'node-uuid'
import MessageDispatchService from '../service/MessageDispatchService'
import SenderService from '../service/SenderService'

export default class ConnectController {
  constructor (ws, globalMap) {
    this.token = uuid.v4()
    this.id = uuid.v4()
    this.username = ''
    this.currentRoomId = null
    this.isOnline = true
    this.ws = ws
    const userClient = this
    ws.on('message', (message) => {
      try{
        const messageData = JSON.parse(message)
        const processFunction = MessageDispatchService[messageData.type] || MessageDispatchService['default']
        processFunction(buildContext(messageData, globalMap, userClient))
      } catch (e) {
        console.error('parse message error', message, e)
      }
    })

    ws.on('close', _ => {
      this.isOnline = false
      global.$emit('userLeave', buildContext({type: 'userLeave'}, globalMap, userClient))
    })

    ws.on('error', _ => {
      console.log('ws error')
    })
    function buildContext (messageData, globalMap, userClient) {
      return {
        type: messageData.type,
        data: messageData.data,
        userClient: userClient,
        ...globalMap,
        currentRoom: globalMap.roomMap[userClient.currentRoomId],
        currentUsers: globalMap.roomUser[userClient.currentRoomId],
        send (data, type = messageData.type) {
          SenderService.sendToUser(userClient, data, type, type === messageData.type ? messageData.id : null)
        },
        sendToSameRoom (data, type = messageData.type) {
          const currentRoomId = userClient.currentRoomId
          const users = globalMap.roomUser[currentRoomId]
          SenderService.sendToUsers(users, data, type, type === messageData.type ? messageData.id : null)
        }
      }
    }
  }
}
