exports.send = (ws, message) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message))
  } else {
    console.log('ws is not open', ws.readyState)
  }
}
exports.sendToUserError = (userClient, data, type, id) => {
  if (userClient.isOnline) {
    exports.send(userClient.ws, {data, type, id, error: true})
  }
}

exports.sendToUser = (userClient, data, type, id) => {
  if (userClient.isOnline) {
    exports.send(userClient.ws, {data, type, id})
  }
}

exports.sendToUsers = (userClients, data, type, id) => {
  Object.values(userClients).forEach(client => {
    exports.sendToUser(client, data, type, id)
  })
}
