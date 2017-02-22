import fs from 'fs'
import path from 'path'

function getRandomArray(array) {
  if (array) {
    return array.sort(_ => {
      return (parseInt(Math.random() * 1000) % 2) ? 1 : -1
    })
  }
  return array
}

const projectRoot = path.resolve(__dirname, '../')
const wordData = fs.readFileSync(projectRoot + '/word.txt','utf-8')
const nickNameData = fs.readFileSync(projectRoot + '/nickname.txt', 'utf-8')
const allWord = wordData.split('\n')
const allNameArray = nickNameData.split('\n')
let keyIndex = 0
let nameIndex = 0

let allKeys = allWord.map(w => {
  return w.split(':')
})

let allNames = getRandomArray(allNameArray)
allKeys = getRandomArray(allKeys)


console.log('projectRoot:', projectRoot)
console.log('allGameKeyLength: ', allKeys.length)
console.log('allNameLength: ', allNames.length)
export default {
  getNextKey () {
    let keyWord = allKeys[keyIndex++]
    if (!keyWord) {
      allKeys = getRandomArray(allKeys)
      keyIndex = 0
      keyWord = allKeys[gameKey++]
    }
    return keyWord
  },
  getNextName () {
    let keyWord = allNames[nameIndex++]
    if (!keyWord) {
      allNames = getRandomArray(allNames)
      nameIndex = 0
      keyWord = allNames[nameIndex++]
    }
    return keyWord
  }
}
