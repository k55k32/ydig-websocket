exports.send = (ws, data, type, id) => {
  const message = {data, type, id}
  ws.send(JSON.stringify(message))
}

exports.sendToUser = (userClient, data, type, id) => {
  if (userClient.isOnline) {
    exports.send(userClient.ws, data, type, id)
  }
}

exports.sendToUsers = (userClients, data, type, id) => {
  Object.values(userClients).forEach(client => {
    exports.sendToUser(client, data, type, id)
  })
}
