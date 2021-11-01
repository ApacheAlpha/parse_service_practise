const Parse = require('parse/node')

Parse.initialize('test', 'test', 'test')
Parse.serverURL = 'http://172.16.2.4:1337/parse'
// Parse.serverURL = 'http://192.168.1.2:1337/parse'

module.exports = {
	Parse
}

