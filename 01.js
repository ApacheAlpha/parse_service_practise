/* eslint-disable no-await-in-loop */
const { Parse } = require('./parse')

async function recursivelyDelete(realtionResult) {
	const relationObj = realtionResult.attributes
	const keyList = Object.keys(relationObj)
	for (let i = 0; i < keyList.length; i += 1) {
		if (relationObj[keyList[i]] instanceof Parse.Relation) {
			const newRelation = realtionResult.relation(keyList[i])
			const newRealtionResult = await newRelation.query().find()
			for (let j = 0; j < newRealtionResult.length; j += 1) {
				await recursivelyDelete(newRealtionResult[j])
			}
			await realtionResult.destroy()
			return
		}
	}
	await realtionResult.destroy()
}

async function main() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')

	// const inv = new Parse.Query('Inventory')
	// const [result] = await inv.find()
	// await recursivelyDelete(result)

	const pro = new Parse.Query('Project')
	const [result] = await pro.find()
	result.unset('parents')
	await result.save()
	console.log('))))))))1))))))))))')
	// console.log(')))))))2)))))))))', result.attributes)

	// const dev = new Parse.Query('Device')
	// const [data] = await dev.find()
	// console.log(')))))))))2)))))))))', data)
	// // await recursivelyDelete(result)

	// result.set('parents', data)
	// await result.save()

	// const inv = new Parse.Query('UUUu')
	// const [result] = await inv.find()
	// console.log(':::::::::::::::::', await result.destroy())
}
main()
