class StrUtilts {

  transWalletAddress(address) {
    let newAddress = address.slice(2, address.length)
    console.log('address', address)
    console.log('newAddress', newAddress)
    newAddress = newAddress.split('').reverse().join('')
    console.log('newAddress', newAddress)
    newAddress = newAddress.toUpperCase()
    console.log('newAddress', newAddress)
    return newAddress
  }

  reTransWalletAddress(address) {

    let newAddress = address.split('').reverse().join('')
    console.log('newAddress', newAddress)
    newAddress = '0x' + newAddress.toLowerCase()
    console.log('newAddress', newAddress)
    return newAddress
  }
}

module.exports = new StrUtilts