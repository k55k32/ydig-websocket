import RoomService from './RoomService'
import UserService from './UserService'
export default {
  login (ctx) {
    UserService.login(ctx)
  },
  changename (ctx) {
    UserService.changeName(ctx)
  },
  createRoom (ctx) {
    RoomService.create(ctx)
  },
  enterRoom: RoomService.enter,
  default ({ message }) {
    console.log('unknow message', message)
  }
}
