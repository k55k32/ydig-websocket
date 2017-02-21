const events = {}

global.$on = (type, fn) => {
  if (typeof fn === 'function') {
    const allFunction = events[type] || []
    allFunction.push(fn)
    events[type] = allFunction
  }
}

global.$emit = (type, data) => {
  const allFunction = events[type] || []
  allFunction.forEach(fn => fn(data))
}
