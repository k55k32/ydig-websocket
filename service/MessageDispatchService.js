import RoomService from './RoomService'
import UserService from './UserService'
export default {
  login: UserService.login,
  changename: UserService.changeName,
  createRoom: RoomService.create,
  enterRoom: RoomService.enter,
  leaveRoom: RoomService.leave,
  roomList: RoomService.list,
  enterIndex: RoomService.changeSub,
  leaveIndex: RoomService.changeUnSub,
  default ({ message }) {
    console.log('unknow message', message)
  }
}
