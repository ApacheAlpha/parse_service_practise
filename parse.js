const Parse = require('parse/node')

Parse.initialize('test','test','test')
Parse.serverURL = 'http://172.16.2.4:1337/parse'

module.exports = {
	Parse
}

