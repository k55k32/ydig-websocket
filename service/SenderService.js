exports.send = (ws, data, type) => {
  const message = {data, type, mid: new Date().getTime()}
  ws.send(JSON.stringify(message))
}

exports.sendToUser = (userClient, data, type) => {
  if (userClient.isOnline) {
    exports.send(userClient.ws, data, type)
  }
}

exports.sendToUsers = (userClients, data, type) => {
  userClients.forEach(client => {
    exports.sendToUser(client, data, type)
  })
}
