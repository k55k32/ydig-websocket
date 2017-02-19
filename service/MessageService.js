export default {
  login ({ data = {}, userClient, userMap, send }) {
    const user = data
    const loginUser = (offLineUser) => {
      const sessionUser = offLineUser || userClient
      const token = sessionUser.token
      userMap[token] = sessionUser
      send({
        token: sessionUser.token,
        username: sessionUser.username || '玩家' + token.charCodeAt(0) + token.charCodeAt(1) + token.charCodeAt(2)
      })
    }
    if (user.token) {
      const offLineUser = userMap[user.token]
      if (offLineUser) {
        offLineUser.isOnline = true
        offLineUser.ws = userClient.ws
        loginUser(offLineUser)
      } else {
        userClient.username = user.username
        userClient.token = user.token
        loginUser(userClient)
      }
    } else {
      loginUser()
    }
  },
  changename ({data, userClient}) {
    userClient.username = data.username
  },
  default ({ message }) {
    console.log('unknow message', message)
  }
}
