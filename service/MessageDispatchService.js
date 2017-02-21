import RoomService from './RoomService'
import UserService from './UserService'
import GameService from './GameService'
export default {
  login: UserService.login,
  changename: UserService.changeName,
  createRoom: RoomService.create,
  enterRoom: RoomService.enter,
  leaveRoom: RoomService.leave,
  roomList: RoomService.list,
  enterIndex: RoomService.changeSub,
  leaveIndex: RoomService.changeUnSub,
  chatMsg: GameService.msg,
  beginGame: GameService.begin,
  gameData: GameService.getData,
  drawAction: GameService.drawAction,
  drawImage: GameService.drawImage,
  userNumber: UserService.userNumber,
  default ({ type }) {
    console.log('unknow message', type)
  }
}
