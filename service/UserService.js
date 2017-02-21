export default {
  login (ctx) {
    const { data, userClient, userMap, roomUser, send } = ctx
    const user = data
    const loginUser = () => {
      const sessionUser = userClient
      const token = sessionUser.token
      const id = sessionUser.id
      userMap[token] = sessionUser
      send({
        id: userClient.id,
        token: sessionUser.token,
        inGame: sessionUser.inGame,
        currentRoomId: sessionUser.currentRoomId,
        username: sessionUser.username
      })
      console.log('all users', Object.keys(userMap))
    }
    if (user.token) {
      const offLineUser = userMap[user.token]
      if (offLineUser) {
        userClient.username = offLineUser.username
        userClient.token = offLineUser.token
        userClient.id = offLineUser.id
        userClient.inGame = offLineUser.inGame
        userClient.currentRoomId = offLineUser.currentRoomId
      } else {
        userClient.username = user.username
        userClient.token = user.token
      }
      loginUser()
    } else {
      const token = userClient.token
      userClient.username = '玩家' + token.charCodeAt(0) + token.charCodeAt(1) + token.charCodeAt(2)
      loginUser()
    }
  },

  changeName ({data, userClient}) {
    userClient.username = data.username
  }
}
