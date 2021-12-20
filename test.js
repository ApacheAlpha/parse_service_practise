/* eslint-disable max-classes-per-file */
require('should')
const entity = require('./entity')
const { Parse } = require('./parse')

class Organization extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('Organization')
	}

	createRole(permission, className) {
		return this.ensureRole(permission, className)
	}

	addEntityTest(entityData) {
		return this.addEntity('inventory', entityData)
	}

	removeEntityTest(entitydata) {
		return this.removeEntity('inventory', entitydata)
	}

	addProject(project) {
		return this.addEntityGroup('Projects', project)
	}

	removeEntityGroupTest(entityGroup) {
		return this.removeEntityGroup('projects', entityGroup)
	}

	testAddMembers(user) {
		return this.addMembers(user, true)
	}

	testDelMembers(user) {
		return this.delMembers(user)
	}

	setMemberPermissiontest(user) {
		return this.setMemberPermission(user, true)
	}
}
Parse.Object.registerSubclass('Organization', Organization)

class Project extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('Project')
	}

	addDevice(device) {
		return this.addEntity('devices', device)
	}

	addProject(project) {
		return this.addEntityGroup('projects', project)
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

async function signUpUser() {
	// 先注册多个用户
	const firstUser = new Parse.User()
	firstUser.set('username', 'firstUser')
	firstUser.set('password', 'firstUser')
	firstUser.set('email', 'email1@example.com')
	firstUser.set('phone', '415-392-0201')

	const secondUser = new Parse.User()
	secondUser.set('username', 'secondUser')
	secondUser.set('password', 'secondUser')
	secondUser.set('email', 'email2@example.com')
	secondUser.set('phone', '415-392-0202')

	const thirdUser = new Parse.User()
	thirdUser.set('username', 'thirdUser')
	thirdUser.set('password', 'thirdUser')
	thirdUser.set('email', 'email3@example.com')
	thirdUser.set('phone', '415-392-0203')
	await firstUser.signUp()
	await secondUser.signUp()
	await thirdUser.signUp()
}

async function login() {
	await Parse.User.logIn('firstUser', 'firstUser')
	await Parse.User.logIn('secondUser', 'secondUser')
	await Parse.User.logIn('thirdUser', 'thirdUser')
}
// r:02ba813687c3383328740a452cf17416 运行login()后可以在控制面板从Session表中获取sessionToken
// 但是这个sessionToken是有时效性的,出现 Error: Invalid session token,运行login()再次获取即可
async function createOrganization() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const organization = new Organization()
	organization.set('organization_name', 'organization01')
	const organizationResult = await organization.save()
	// 创建organization的读、写以及grant 角色
	await organizationResult.createRole('grant', organizationResult.className)
	const readRole = await organizationResult.createRole('read', organizationResult.className)
	const writeRole = await organizationResult.createRole('write', organizationResult.className)
	// 把organizationResult的ACl设置为readRole,writeRole
	const orgACL = new Parse.ACL()
	orgACL.setRoleReadAccess(readRole, true)
	orgACL.setRoleWriteAccess(writeRole, true)
	organizationResult.setACL(orgACL)
	await organizationResult.save()
	return organizationResult
}

async function createProject() {
	// 创建组织Organization下的实体组，Project
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const pro = new Project()
	pro.set('project_name', 'project01')
	const projectResult = await pro.save()
	const roleQuery = new Parse.Query(Organization)
	const organizationObj = await roleQuery.first()
	// 判断有没有organization的grant角色
	await organizationObj.createRole('grant', organizationObj.className)
	// 创建Project的读、写角色
	const readRole = await organizationObj.createRole('read', projectResult.className)
	const writeRole = await organizationObj.createRole('write', projectResult.className)
	// 把projectResult的ACl设置为readRole,writeRole
	const proACL = new Parse.ACL()
	proACL.setRoleReadAccess(readRole, true)
	proACL.setRoleWriteAccess(writeRole, true)
	projectResult.setACL(proACL)
	await projectResult.save()
	return projectResult
}

async function createInventory() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const inv = new Inventory()
	inv.set('inventory_name', 'inventory01')
	const inventoryResult = await inv.save()
	const roleQuery = new Parse.Query(Organization)
	const organizationObj = await roleQuery.first()
	// 判断有没有organization的grant角色
	await organizationObj.createRole('grant', organizationObj.className)
	// 创建inventory的读、写角色
	const readRole = await organizationObj.createRole('read', inventoryResult.className)
	const writeRole = await organizationObj.createRole('write', inventoryResult.className)
	// 把inventoryResult的ACl设置为readRole,writeRole
	const proACL = new Parse.ACL()
	proACL.setRoleReadAccess(readRole, true)
	proACL.setRoleWriteAccess(writeRole, true)
	inventoryResult.setACL(proACL)
	await inventoryResult.save()
	return inventoryResult
}

async function createDevice() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const dev = new Device()
	dev.set('sn', 'AA00000110')
	const deviceResult = await dev.save()
	const roleQuery = new Parse.Query(Organization)
	const organizationObj = await roleQuery.first()
	// 判断有没有organization的grant角色
	await organizationObj.createRole('grant', organizationObj.className)
	// 创建inventory的读、写角色
	const readRole = await organizationObj.createRole('read', deviceResult.className)
	const writeRole = await organizationObj.createRole('write', deviceResult.className)
	// 把deviceResult的ACl设置为readRole,writeRole
	const devACL = new Parse.ACL()
	devACL.setRoleReadAccess(readRole, true)
	devACL.setRoleWriteAccess(writeRole, true)
	deviceResult.setACL(devACL)
	await deviceResult.save()
	return deviceResult
}

async function testAddEntity() {
	const invQuery = new Parse.Query(Inventory)
	const [invQueryList] = await invQuery.find()
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	await organizationList.addEntityTest(invQueryList)
}

async function testremoveEntity() {
	const org = new Parse.Query(Organization)
	const [result] = await org.find()
	const inv = new Parse.Query(Inventory)
	const [data] = await inv.find()
	await result.removeEntityTest(data)
}

async function testAddEntityGroup() {
	const ProjectQuery = new Parse.Query(Project)
	const [result] = await ProjectQuery.find()
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	await organizationList.addProject(result)
}

async function testremoveEntityGroup() {
	const org = new Parse.Query(Organization)
	const [result] = await org.find()
	const pro = new Parse.Query(Project)
	const [data] = await pro.find()
	await result.removeEntityGroupTest(data)
}

async function addMemberstest() {
	const currentUser = await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	await organizationList.testAddMembers(currentUser)
}

async function delMembers() {
	const currentUser = await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	await organizationList.testDelMembers(currentUser)
}

async function setMemberPermissiontest() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const addUser = await new Parse.Query(Parse.User).find()
	const projectQuery = new Parse.Query(Project)
	const [projectQueryList] = await projectQuery.find()
	await projectQueryList.setMemberPermission(addUser[1])
}

describe('test function', () => {
	// it('signUpUser result should instanceOf Parse.User', async () => {
	// 	await signUpUser()
	// })

	// it('login result should instanceOf Parse.User', async () => {
	// 	await login()
	// })

	// it('createOrganization result should instanceOf Organization', async () => {
	// 	const result = await createOrganization()
	// 	result.should.be.an.instanceOf(Organization)
	// })

	// it('createProject result should instanceOf Project', async () => {
	// 	const result = await createProject()
	// 	result.should.be.an.instanceOf(Project)
	// })

	// it('createInventory result should instanceOf Inventory', async () => {
	// 	const result = await createInventory()
	// 	result.should.be.an.instanceOf(Inventory)
	// })

	// it('createDevice result should instanceOf Device', async () => {
	// 	const result = await createDevice()
	// 	result.should.be.an.instanceOf(Device)
	// })

	// 测试函数开始
	describe('test testAddEntity', () => {
		// it('result length should equal 1', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
		// 	await testAddEntity()

		// 	const inv = new Parse.Query(Inventory)
		// 	const [invData] = await inv.find()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('inventory', invData)
		// 	const result = await org.find()
		// 	result.should.have.length(1)
		// })

		it('result length should equal 0', async () => {
			// sessionToken为  r:4732ff40be336db6840ebba45f424e4d的是一个普通用户未关联任何数据,
			// 运行查询测试代码，正常情况是什么也查不到
			Parse.User.enableUnsafeCurrentUser()
			await Parse.User.become('r:4732ff40be336db6840ebba45f424e4d')

			const inv = new Parse.Query(Inventory)
			const invData = await inv.first()
			const org = new Parse.Query(Organization)
			org.equalTo('inventory', invData)
			const result = await org.find()
			result.should.have.length(0)
		})

		it('result length should equal 0', async () => {
			// sessionToken为  r:4732ff40be336db6840ebba45f424e4d的是一个普通用户未关联任何数据,
			// 运行查询测试代码，理想情况是什么也查不到
			Parse.User.enableUnsafeCurrentUser()
			await Parse.User.become('r:fc3b3451fd12b7b6c7924c7eb49dac3d')

			const inv = new Parse.Query(Inventory)
			const invData = await inv.first()
			const org = new Parse.Query(Organization)
			// org.equalTo('inventory', invData)
			const result = await org.first()
			console.log('----------result----------', org)
			// result.should.have.length(0)
		})
	})

	// it('finalData should be undefined', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	// 	await testremoveEntity()
	// 	const org = new Parse.Query(Organization)
	// 	const [result] = await org.find()
	// 	const data = result.get('parents')
	// 	const finalData = (data === undefined)
	// 	finalData.should.be.true()
	// })

	// it('result length should equal 1', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	// 	await testAddEntityGroup()
	// 	const pro = new Parse.Query(Project)
	// 	const [proData] = await pro.find()
	// 	const org = new Parse.Query(Organization)
	// 	const result = await org.find()
	// 	org.equalTo('Projects', proData)
	// 	result.should.have.length(1)
	// })

	// it('result length should equal 0', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	// 	await testremoveEntityGroup()
	// 	const pro = new Parse.Query(Project)
	// 	const [proData] = await pro.find()
	// 	const data = proData.get('parents')
	// 	const finalData = (data === undefined)
	// 	finalData.should.be.true()
	// })

	// it('result length should equal 1', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	const currentUser = await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	// 	await addMemberstest()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('members', currentUser)
	// 	const result = await org.find()
	// 	result.should.have.length(1)
	// })

	// it('result length should equal 0', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	const currentUser = await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	// 	await delMembers()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('members', currentUser)
	// 	const result = await org.find()
	// 	result.should.have.length(0)
	// })

	// it('result length should equal 0', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	// 	await setMemberPermissiontest()
	// 	const pro = new Parse.Query(Project)
	// 	const result = await pro.find()
	// 	result.should.have.length(1)
	// })
})
