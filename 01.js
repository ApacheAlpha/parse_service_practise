const should = require('should')
const { Parse } = require('./parse')

// describe('Array', () => {
// 	describe('#indexOf()', () => {
// 		it('should return -1 when the value is not present', () => {
// 			[1, 2, 3].indexOf(5).should.equal(-1);
// 			[1, 2, 3].indexOf(0).should.equal(-1)
// 		})
// 	})
// })

async function signUpUser() {
	// Parse.User.enableUnsafeCurrentUser()
	// // Parse.User.become('')
	const user = new Parse.User()
	user.set('username', 'user2')
	user.set('password', 'user2')
	user.set('email', 'email@example.com')
	user.set('phone', '415-392-0202')
	const result = await user.signUp()
	return result
}

// describe('test', () => {
// 	it('should instanceOf Parse.User', async () => {
// 		const result = await signUpUser()
// 		result.should.be.an.instanceOf(Parse.User)
// 	})
// })

async function login() {
	const loginResult = await Parse.User.logIn('user2', 'user2')
	return loginResult
}
// login()

async function main() {
	Parse.User.enableUnsafeCurrentUser()
	// r:02ba813687c3383328740a452cf17416 运行login()后可以在控制面板从Session表中获取sessionToken
	const JJJ = await Parse.User.become('r:d90e5f916208aaaeadaf7ffcdc1b10fgf')
	console.log('LLLLLLLLLLLLLLLL', JJJ)
}
main()
