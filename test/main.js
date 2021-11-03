const entity = require('../entity')
const { Parse } = require('./parse')


class organization extends entity.EntityGroup {
	constructor() {
		super()
		this.organization = null
		this.name = this.constructor.name
	}

	addEntity(entity) {
		return super.addEntity('projets', entity)
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


// async function test() {
// 	// const org = new organization()
// 	const [User] =await new Parse.Query(Parse.User).find()
// 	console.log('))))))77777)2))))))))))',User)
// 	const [organization] =await new Parse.Query('organization').find()

// 	const withGrant_roleACL = organization.getACL()
// 	console.log('))))))77777)2))))))))))',withGrant_roleACL)

// 	withGrant_roleACL.setReadAccess(User, true)
// 	withGrant_roleACL.setWriteAccess(User, true)
// 	organization.setACL(withGrant_roleACL)
// 	await organization.save()

// }
// test()
// 1、
// async function test_addEntity() {
// 	const org = new organization()
// 	const inv_obj = new Parse.Object('inventory')
// 	inv_obj.set('sn', '测试000')
// 	await inv_obj.save()

// 	const organization_query = new Parse.Query('organization')
// 	const organization_list = await organization_query.find({ useMasterKey: true })
// 	org.organization = organization_list[0]
// 	org.addEntity(inv_obj)
// }
// test_addEntity()
// 2、
// async function test_addEntityGroup() {
// 	const org = new organization()
// 	const Project_obj = new Parse.Object('Project')
// 	Project_obj.set('Project_name', '测试000')
// 	Project_obj.set('Project_address', '测试000')
// 	await Project_obj.save()

// 	const organization_query = new Parse.Query('organization')
// 	const organization_list = await organization_query.find({ useMasterKey: true })
// 	org.organization = organization_list[0]
// 	org.addProject(Project_obj)
// }
// test_addEntityGroup()

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

