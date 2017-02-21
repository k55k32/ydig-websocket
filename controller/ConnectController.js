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
    this.send = (data, type) => {
      SenderService.sendToUser(this, data, type)
    }
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
      const currentUsers = globalMap.roomUser[userClient.currentRoomId];
      const currentRoom = globalMap.roomMap[userClient.currentRoomId]
      const currentGame = globalMap.gameMap[userClient.currentRoomId]
      return {
        type: messageData.type,
        data: messageData.data,
        userClient: userClient,
        ...globalMap,
        currentRoom,
        currentUsers,
        currentGame,
        userArray: currentUsers && Object.values(currentUsers),
        send (data, type = messageData.type) {
          SenderService.sendToUser(userClient, data, type, type === messageData.type ? messageData.id : null)
        },
        sendError (data, type = messageData.type) {
          SenderService.sendToUserError(userClient, data, type, type === messageData.type ? messageData.id : null)
        },
        sendToSameRoom (data, type = messageData.type) {
          const currentRoomId = userClient.currentRoomId
          const users = globalMap.roomUser[currentRoomId]
          Object.keys(users).forEach(k => {
            const sessionUser = globalMap.userMap[users[k].token]
            users[k] = sessionUser
          })
          SenderService.sendToUsers(users, data, type, type === messageData.type ? messageData.id : null)
        }
      }
    }
  }
}
