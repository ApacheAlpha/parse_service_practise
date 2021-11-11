/* eslint-disable max-classes-per-file */
const entity = require('./entity')
const { Parse } = require('./parse')

class organization extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('organization')
	}

	addEntity(entityData) {
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
	// constructor() {
	// 	// eslint-disable-next-line constructor-super
	// 	return super('Project')
	// }
	constructor(...args) {
		// eslint-disable-next-line constructor-super
		return super(...args)
	}

	addDevice(device) {
		return super.addEntity('devices', device)
	}

	addProject(project) {
		return super.addEntityGroup('projects', project)
	}
}
Parse.Object.registerSubclass('Project', Project)

// 1、
// async function test_AddEntity() {
// 	//
// 	const invObj = new Parse.Object('inventory')
// 	invObj.set('sn', '测试000')
// 	await invObj.save()

// 	const organization_query = new Parse.Query(organization)
// 	const [organization_list] = await organization_query.find()
// 	organization_list.addEntity(invObj)
// }
// test_AddEntity()
// 2、
async function testAddEntityGroup() {
	const Project_query = new Parse.Query(Project)
	const [result] = await Project_query.find()

	console.log(')))))))))))))))))', result instanceof Project)

	const organization_query = new Parse.Query(organization)
	const [organization_list] = await organization_query.find()
	console.log(')))))))organization_list))))))))))', organization_list instanceof organization)

	organization_list.addProject(result)

	// const relation = organization_list.relation('project')
	// relation.add(result)
	// await organization_list.save()

	// organization_list.addProject(Project_list)
}
testAddEntityGroup()

// 3、
// async function removeEntityGroup() {
// 	const org = new organization()

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
