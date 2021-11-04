const entity = require('./entity')
const { Parse } = require('./parse')

class organization extends entity.EntityGroup {
	constructor() {
		return super('organization')
	}

	addEntity(entityData) {
		return super.addEntity('projets', entityData)
	}

	addProject(project) {
		return super.addEntityGroup('projects', project)
	}

	removeEntityGroup(entityGroup) {
		return super.removeEntityGroup('projects', entityGroup)
	}

	addMembers(user) {
		return super.addMembers(user)
	}

	delMembers(user) {
		return super.delMembers(user)
	}

	// 	removeEntityGroup(entityGroup) {
	// 		return super.removeEntityGroup('projects', entityGroup)
	// 	}

	// }

	// class Project extends Parse.EntityGroup {
	// 	addDevice(device) {
	// 	  return super.addEntity('devices', device)
	// 	}
}
Parse.Object.registerSubclass('organization', organization)

class Project extends entity.EntityGroup {
	addDevice(device) {
		return super.addEntity('devices', device)
	}

	addProject(project) {
		return super.addEntityGroup('projects', project)
	}
}
Parse.Object.registerSubclass('Project', Project)

async function test() {
	// const new_grant_role = 'ruiwueriwueroiweuor'
	// const roleACL = new Parse.ACL()
	// roleACL.setRoleReadAccess(new_grant_role, true)
	// roleACL.setRoleWriteAccess(new_grant_role, true)
	// const role = new Parse.Role(new_grant_role, roleACL)
	// await role.save()

	// const roleQuery = new Parse.Query(Parse.Role)
	// const [objectRole] = await roleQuery.equalTo('name', new_grant_role).find()
	// console.log('LLLLLLLLLLLLLLL', objectRole)
	// role.setACL(grant_role)
	// await role.save()

	const [organization_one] = await new Parse.Query(organization).find()
	const relation = organization_one.relation('projects')
	const realtionResult = await relation.query().find()
	console.log('realtionResult', realtionResult)
	for (let index = 0; index < realtionResult.length; index += 1) {
		const relationObj = realtionResult[index].attributes
		console.log('----------++++++++++++++++++++----------', relationObj)
		const key_list = Object.keys(relationObj)
		for (let index = 0; index < key_list.length; index += 1) {
			const element = array[index]
			if (condition) {

			}
		}
	}
	// organization_one.addEntity({})
	// const org = new organization()

// org.saves()
// console.log('--------------------', org)
// org.set('Organization_name', 'qeqweqwew')
// await org.save()
}
// test()

async function test_one(realtionResult) {
	const relationObj = realtionResult.attributes
	const key_list = Object.keys(relationObj)
	for (let index = 0; index < key_list.length; index += 1) {
		if (relationObj[key_list[index]] instanceof Parse.Relation) {
			const newRelation = realtionResult.relation(key_list[index])
			const newRealtionResult = await newRelation.query().find()
			for (let index = 0; index < newRealtionResult.length; index += 1) {
				await test_one(newRealtionResult[index])
				await realtionResult.destroy()
			}
		}
	}
	// console.log('realtionResult', realtionResult)
	// for (let index = 0; index < realtionResult.length; index += 1) {
	// 	const relationObj = realtionResult[index].attributes
	// 	// console.log('----------++++++++++++++++++++----------', relationObj)
	// 	// const key_list = Object.keys(relationObj)
	// 	// for (let index = 0; index < key_list.length; index += 1) {
	// 	// 	const element = array[index]
	// 	// 	if (condition) {

	// 	// 	}
	// 	// }
	// }
}

async function main() {
	const [organization_one] = await new Parse.Query(organization).find()
	const relation = organization_one.relation('projects')
	const realtionResult = await relation.query().find()
	for (let index = 0; index < realtionResult.length; index += 1) {
		await test_one(realtionResult[index])
	}
}
main()
// test_one()
// 1、
// async function test_AddEntity() {
// 	const org = new organization()
// 	const invObj = new Parse.Object('inventory')
// 	invObj.set('sn', '测试000')
// 	await invObj.save()
// 	org.addEntity(invObj)

// 	// const organizationQuery = new Parse.Query(organization)
// 	// const [organizationList] = await organizationQuery.find({ useMasterKey: true })
// }
// test_AddEntity()
// 2、
// async function testAddEntityGroup() {
// 	const pro = new Project()
// 	pro.set('Project_name', '测试000')
// 	pro.set('Project_address', '测试000')
// 	await pro.save()
// 	pro.addProject(pro)
// }
// testAddEntityGroup()

// 3、
// async function removeEntityGroup() {
// 	const org = new organization()
// 	const organization_query = new Parse.Query('Project')
// 	const [organization_list] = await organization_query.find({ useMasterKey: true })
// 	org.organization = organization_list
// 	org.removeEntityGroup(organization_list)
// }
// removeEntityGroup()

// 4、
// async function addMembers() {
// 	const org = new organization()
// 	const user_query = new Parse.Query(Parse.User)
// 	const user_list = await user_query.find()
// 	const organization_query = new Parse.Query('organization')
// 	const [organization_list] = await organization_query.find()
// 	org.organization = organization_list
// 	org.addMembers(user_list[0])
// }
// addMembers()

// 5、
// async function delMembers() {
// 	const org = new organization()
// 	const user_query = new Parse.Query(Parse.User)
// 	const user_list = await user_query.find()
// 	const organization_query = new Parse.Query('organization')
// 	const [organization_list] = await organization_query.find()
// 	org.organization = organization_list

// 	console.log('::::::::::::::',user_list[0])

// 	org.delMembers(user_list[0])
// }
// delMembers()
