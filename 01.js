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

async function recursivelyFind(realtionResult) {
	const relationObj = realtionResult.get('parents')
	if (!relationObj) {
		return realtionResult
	}
	const [queryResult] = await new Parse.Query(relationObj.className).equalTo('id', relationObj.className.id).limit(1).find()
	if (queryResult && queryResult.get('parents')) {
		const result = await recursivelyFind(queryResult.get('parents'))
		if (result) {
			return result
		}
	} else {
		return queryResult
	}
	return null
}

async function main() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')

	// const inv = new Parse.Query('Inventory')
	// const [result] = await inv.find()
	// await recursivelyDelete(result)

	const org = new Parse.Query('Organization')
	const [orgResult] = await org.find()

	const dev = new Parse.Query('Device')
	const [data] = await dev.find()

	const pro = new Parse.Query('Project')
	const [result] = await pro.find()
	// result.set('parents', orgResult)
	// await result.save()

	// console.log(')))))))))))))))',	orgResult.get('parents'))

	// await orgResult.save()

	// data.set('parents', result)
	// await data.save()

	const resultC = await recursivelyFind(orgResult)
	console.log(')))))))))))', resultC)
	// await recursivelyDelete(result)
	// const inv = new Parse.Query('UUUu')
	// const [result] = await inv.find()
	// console.log(':::::::::::::::::', await result.destroy())
}
main()
