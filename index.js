/* eslint-disable max-classes-per-file */
const entity = require('./entity')
const { Parse } = require('./parse')

class organization extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('organization')
	}

	addEntityTEST(entityData) {
		return this.addEntity('inventory', entityData)
	}

	addProject(project) {
		return this.addEntityGroup('Projects', project)
	}

	removeEntityGroup(entityGroup) {
		return this.removeEntityGroup('projects', entityGroup)
	}

	addMembers(user) {
		return this.addMembers(user)
	}

	delMembers(user) {
		return this.delMembers(user)
	}

	// removeEntityGroup(entityGroup) {
	// 	return super.removeEntityGroup('projects', entityGroup)
	// }
}
Parse.Object.registerSubclass('organization', organization)

class Project extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('Project')
	}

	addDevice(device) {
		return super.addEntity('devices', device)
	}

	addProject(project) {
		return super.addEntityGroup('projects', project)
	}
}
Parse.Object.registerSubclass('Project', Project)

class Inventory extends entity.EntityGroup {
	constructor() {
		super('Inventory')
	}
}
Parse.Object.registerSubclass('Inventory', Inventory)

class Device extends entity.EntityGroup {
	constructor() {
		super('Device')
	}
}
Parse.Object.registerSubclass('Device', Device)

// 1、
// async function test_AddEntity() {
// 	const invObj = new Parse.Object('inventory')
// 	invObj.set('sn', '测试000')
// 	await invObj.save()

// 	const organization_query = new Parse.Query(organization)
// 	const [organization_list] = await organization_query.find()
// 	organization_list.addEntityTEST(invObj)
// }
// test_AddEntity()
// 2、
// async function testAddEntityGroup() {
// 	const ProjectQuery = new Parse.Query(Project)
// 	const [result] = await ProjectQuery.find()
// 	const organizationQuery = new Parse.Query(organization)
// 	const [organizationList] = await organizationQuery.find()
// 	organizationList.addProject(result)
// }
// testAddEntityGroup()

// 3、
// async function removeEntityGroup() {
// 	const org = new organization()

// }
// removeEntityGroup()

// 4、
// async function addMembers() {
// 	const org = new organization()
// 	const userQuery = new Parse.Query(Parse.User)
// 	const [userList] = await userQuery.find()

// 	const organizationQuery = new Parse.Query(organization)
// 	const [organizationList] = await organizationQuery.find()
// 	console.log('---------------->>>>>>', organizationList)
// 	org.addMembers(userList)
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

async function main() {
	const YYY = new Parse.Query('inventory')
	const [result] = await YYY.find()
	console.log('LLLLLLLLLLLLLLLLL', result)

	const ACL = await result.getACL()
	console.log('LLLLLLLLLACLLLLLLLLL', ACL)
	console.log('LLLACLLLLLLLACLLACLLLLLLLL', ACL.permissionsById['1jcqMrs20D'])
}
main()
