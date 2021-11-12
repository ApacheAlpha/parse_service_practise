/* eslint-disable max-classes-per-file */
const entity = require('./entity')
const { Parse } = require('./parse')

class organization extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('organization')
	}

	addEntityTest(entityData) {
		return super.addEntity('inventory', entityData)
	}

	removeEntityTest(entitydata) {
		return super.removeEntity('inventory', entitydata)
	}

	addProject(project) {
		return super.addEntityGroup('Projects', project)
	}

	removeEntityGroupTest(entityGroup) {
		return super.removeEntityGroup('projects', entityGroup)
	}

	testAddMembers(user) {
		return super.addMembers(user, true)
	}

	testDelMembers(user) {
		return super.delMembers(user)
	}

	setMemberPermissiontest(user) {
		return super.setMemberPermission(user, true)
	}
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
// async function testremoveEntity() {
// 	const org = new Parse.Query(organization)
// 	const [result] = await org.find({ useMasterKey: true })
// 	const pro = new Parse.Query(Project)
// 	const [data] = await pro.find({ useMasterKey: true })
// 	result.removeEntityTest(data)
// }
// testremoveEntity()
// 4、
// async function testremoveEntityGroup() {
// 	const org = new Parse.Query(organization)
// 	const [result] = await org.find({ useMasterKey: true })
// 	const pro = new Parse.Query(Project)
// 	const [data] = await pro.find({ useMasterKey: true })
// 	result.removeEntityGroupTest(data)
// }
// testremoveEntityGroup()

// 5、
// async function addMemberstest() {
// 	const userQuery = new Parse.Query(Parse.User)
// 	const [userList] = await userQuery.find({ useMasterKey: true })

// 	// const roleQuery = new Parse.Query(Parse.Role)
// 	// const [roleList] = await roleQuery.find({ useMasterKey: true })
// 	console.log('-----------------', userList)

// 	// const withGrantACL = roleList.getACL()
// 	// withGrantACL.setReadAccess(userList, true)
// 	// withGrantACL.setWriteAccess(userList, true)
// 	// roleList.getUsers().add(userList)
// 	// await roleList.save()

// 	const organizationQuery = new Parse.Query(organization)
// 	const [organizationList] = await organizationQuery.find({ useMasterKey: true })
// 	console.log('-----------organizationList------organizationList------', organizationList)
// 	organizationList.testAddMembers(userList)
// }
// addMemberstest()

// 6、
// async function delMembers() {
// 	const userQuery = new Parse.Query(Parse.User)
// 	const [userList] = await userQuery.find()
// 	console.log('))))))))))))))))))', userList)
// 	const organizationQuery = new Parse.Query(organization)
// 	const [organizationList] = await organizationQuery.find()
// 	organizationList.testDelMembers(userList)
// }
// delMembers()

// 7、
async function setMemberPermissiontest() {
	const userQuery = new Parse.Query(Parse.User)
	const [userList] = await userQuery.find()
	console.log('))))))))))))))))))', userList)
	const organizationQuery = new Parse.Query(organization)
	const [organizationList] = await organizationQuery.find()
	organizationList.setMemberPermissiontest(userList)
}
setMemberPermissiontest()
