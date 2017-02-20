export default {
  login (ctx) {
    const { data, userClient, userMap, roomUser, send } = ctx
    const user = data
    const loginUser = () => {
      const sessionUser = userClient
      const token = sessionUser.token
      userMap[token] = sessionUser
      send({
        id: userClient.id,
        token: sessionUser.token,
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
        userClient.currentRoomId = offLineUser.currentRoomId
      } else {
        userClient.username = user.username
        userClient.token = user.token
      }
      global.$emit('UserReLine', ctx)
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
