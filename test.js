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

// r:02ba813687c3383328740a452cf17416 运行login()后可以在控制面板从Session表中获取sessionToken
// 但是这个sessionToken是有时效性的,出现 Error: Invalid session token,运行login()再次获取即可
async function createOrganization() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
	const currentUserToken = currentUser.getSessionToken()
	await Parse.User.become(currentUserToken)
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
	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
	const currentUserToken = currentUser.getSessionToken()
	await Parse.User.become(currentUserToken)
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
	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
	const currentUserToken = currentUser.getSessionToken()
	await Parse.User.become(currentUserToken)
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
	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
	const currentUserToken = currentUser.getSessionToken()
	await Parse.User.become(currentUserToken)
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
	const invQueryList = await invQuery.first()
	const organizationQuery = new Parse.Query(Organization)
	const organizationList = await organizationQuery.first()
	await organizationList.addEntityTest(invQueryList)
}

async function testremoveEntity() {
	const org = new Parse.Query(Organization)
	const result = await org.first()
	const inv = new Parse.Query(Inventory)
	const data = await inv.first()
	await result.removeEntityTest(data)
}

async function testAddEntityGroup() {
	const ProjectQuery = new Parse.Query(Project)
	const result = await ProjectQuery.first()
	const organizationQuery = new Parse.Query(Organization)
	const organizationList = await organizationQuery.first()
	await organizationList.addProject(result)
}

async function testremoveEntityGroup() {
	const org = new Parse.Query(Organization)
	const result = await org.first()
	const pro = new Parse.Query(Project)
	const data = await pro.first()
	await result.removeEntityGroupTest(data)
}

async function addMemberstest() {
	const organizationObj = await new Parse.Query(Organization).first()
	const secondUser = await new Parse.Query(Parse.User).equalTo('username', 'secondUser').first()
	await organizationObj.testAddMembers(secondUser)
}

async function delMembers() {
	const secondUser = await new Parse.Query(Parse.User).equalTo('username', 'secondUser').first()
	const organizationQuery = new Parse.Query(Organization)
	const organizationList = await organizationQuery.first()
	await organizationList.testDelMembers(secondUser)
}

async function setMemberPermissiontest() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:ff46a4657b09d1da9696bb473feb6140')
	const addUser = await new Parse.Query(Parse.User).find()
	const projectQuery = new Parse.Query(Project)
	const projectQueryList = await projectQuery.first()
	await projectQueryList.setMemberPermission(addUser[1])
}

describe('test function', () => {
	// it('signUpUser result should instanceOf Parse.User', async () => {
	// 	await signUpUser()
	// })

	// it('createOrganization result should instanceOf Organization', async () => {
	// 	const result = await createOrganization()
	// 	result.should.be.an.instanceOf(Organization)
	// })

	// it('createProject result should instanceOf Project', async () => {
	// 	const result = await createProject()
	// 	// result.should.be.an.instanceOf(Project)
	// })

	// it('createInventory result should instanceOf Inventory', async () => {
	// 	const result = await createInventory()
	// 	// result.should.be.an.instanceOf(Inventory)
	// })

	// it('createDevice result should instanceOf Device', async () => {
	// 	const result = await createDevice()
	// 	// result.should.be.an.instanceOf(Device)
	// })

	// 测试函数开始
	describe('testAddEntity', () => {
		// 所有数据都是用firstUser账号创建的，所以firstUser就是权限最大的管理员
		// it('result length should equal 1', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	await testAddEntity()

		// 	const inv = new Parse.Query(Inventory)
		// 	const invData = await inv.first()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('inventory', invData)
		// 	const result = await org.find()
		// 	result.should.have.length(1)
		// })

		// it('result length should equal 0', async () => {
		// 	// secondUser是一个普通用户没有任何权限, 运行查询代码，预期是什么也查不到
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	const inv = new Parse.Query(Inventory)
		// 	const invData = await inv.first()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('inventory', invData)
		// 	const result = await org.find()
		// 	result.should.have.length(0)
		// })

		it('key should be true', async () => {
			// 把thirdUser角色添加到Organization__#{Organization.id}__read__Organization
			// 和Organization__#{ Organization.id}__read__Inventory 角色下
			// 运行查询测试代码，可以查询到inventory字段中存储的对象，
			// 证明了testAddEntity函数确实实现了把实体添加到实体组指定字段的功能
			// Parse.User.enableUnsafeCurrentUser()
			// const firstUser = await Parse.User.logIn('firstUser', 'firstUser')
			// const currentUserToken = firstUser.getSessionToken()
			// await Parse.User.become(currentUserToken)

			// const roleQuery = new Parse.Query(Organization)
			// const organizationObj = await roleQuery.first()
			// const orgReadRole = await organizationObj.createRole('read', organizationObj.className)
			// const invQuery = new Parse.Query(Inventory)
			// const inventoryObj = await invQuery.first()
			// const invReadRole = await organizationObj.createRole('read', inventoryObj.className)

			// const userQuery = new Parse.Query(Parse.User)
			// const thirdUser = await userQuery.equalTo('username', 'thirdUser').first()

			// orgReadRole.getUsers().add(thirdUser)
			// orgReadRole.save()
			// invReadRole.getUsers().add(thirdUser)
			// invReadRole.save()

			// const thirdUserLogin = await Parse.User.logIn('thirdUser', 'thirdUser')
			// const thirdUserToken = thirdUserLogin.getSessionToken()
			// await Parse.User.become(thirdUserToken)

			// const thirdUserInvQuery = new Parse.Query(Inventory)
			// const thirdUserInventoryObj = await thirdUserInvQuery.first()

			// const org = new Parse.Query(Organization)
			// const result = await org.equalTo('inventory', thirdUserInventoryObj).find()
			// result.should.be.length(1)
		})
	})

	describe('testremoveEntity', () => {
		// it('finalData should be undefined', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	await testremoveEntity()
		// 	const inv = new Parse.Query(Inventory)
		// 	const invresult = await inv.first()
		// 	const org = new Parse.Query(Organization)
		// 	const result = await org.equalTo('inventory', invresult).first()
		// 	const finalData = (result === undefined)
		// 	finalData.should.be.true()
		// })
	})

	describe('testAddEntityGroup', () => {
		// it('result length should equal 1', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)

		// 	await testAddEntityGroup()
		// 	const pro = new Parse.Query(Project)
		// 	const proData = await pro.first()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('Projects', proData)
		// 	const result = await org.find()
		// 	result.should.have.length(1)
		// })

		// it('result length should equal 1', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const firstUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const firstUserToken = firstUser.getSessionToken()
		// 	await Parse.User.become(firstUserToken)

		// 	const proQuery = new Parse.Query(Project)
		// 	const projectObj = await proQuery.first()
		// 	const roleQuery = new Parse.Query(Organization)
		// 	const organizationObj = await roleQuery.first()
		// 	const proRole = await organizationObj.createRole('read', projectObj.className)
		// 	const userQuery = new Parse.Query(Parse.User)
		// 	const thirdUser = await userQuery.equalTo('username', 'thirdUser').first()
		// 	proRole.getUsers().add(thirdUser)
		// 	proRole.save()

		// 	const currentUser = await Parse.User.logIn('thirdUser', 'thirdUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)

		// 	const pro = new Parse.Query(Project)
		// 	const proData = await pro.first()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('Projects', proData)
		// 	const result = await org.find()
		// 	result.should.have.length(1)
		// })
	})

	describe('testremoveEntityGroup', () => {
		// it('result length should equal 0', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	await testremoveEntityGroup()

		// 	const pro = new Parse.Query(Project)
		// 	const proData = await pro.first()

		// 	const roleQuery = new Parse.Query(Organization)
		// 	roleQuery.equalTo('Projects', proData)
		// 	const data = await roleQuery.first()
		// 	const finalData = (data === undefined)
		// 	finalData.should.be.true()
		// })
	})

	describe('addMemberstest', () => {
		// it('result length should equal 1', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	await addMemberstest()
		// 	const secondUser = await new Parse.Query(Parse.User).equalTo('username', 'secondUser').first()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('members', secondUser)
		// 	const result = await org.find()
		// 	result.should.have.length(1)
		// })

		// it('result length should equal 1', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	const org = new Parse.Query(Organization)
		// 	const result = await org.first()
		// 	// 原始的organization_name为'organization01',现在更改为changrForOrganization01
		// 	result.set('organization_name', 'changrForOrganization01')
		// 	await result.save()
		// 	const changeDataResult = await org.equalTo('organization_name', 'changrForOrganization01').find()
		// 	changeDataResult.should.have.length(1)
		// })
	})

	describe('delMembers', () => {
		// it('result length should equal 0', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	await delMembers()
		// 	const org = new Parse.Query(Organization)
		// 	org.equalTo('members', currentUser)
		// 	const result = await org.find()
		// 	result.should.have.length(0)
		// })

		// it('result length should equal 0', async () => {
		// 	Parse.User.enableUnsafeCurrentUser()
		// 	const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
		// 	const currentUserToken = currentUser.getSessionToken()
		// 	await Parse.User.become(currentUserToken)
		// 	const org = new Parse.Query(Organization)
		// 	const result = await org.find()
		// 	result.should.have.length(0)
		// })
	})

	describe('setMemberPermissiontest', () => {
		it('result length should equal 0', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			await setMemberPermissiontest()
			const pro = new Parse.Query(Project)
			const result = await pro.find()
			result.should.have.length(1)
		})
	})
})
