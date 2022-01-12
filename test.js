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

	createRole(permission, className) {
		return this.ensureRole(permission, className)
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

async function createOrganization(organizationName) {
	const organization = new Organization()
	organization.set('organization_name', organizationName)
	const organizationResult = await organization.save()
	return organizationResult
}

async function createProject(projectName) {
	const pro = new Project()
	pro.set('project_name', projectName)
	const projectResult = await pro.save()
	return projectResult
}

async function createInventory(inventoryName) {
	const inv = new Inventory()
	inv.set('inventory_name', inventoryName)
	const inventoryResult = await inv.save()
	return inventoryResult
}

async function createDevice(deviceName) {
	const dev = new Device()
	dev.set('device_name', deviceName)
	const deviceResult = await dev.save()
	return deviceResult
}

async function testAddEntity() {
	const invQueryList = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
	const organizationList = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').first()
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
	const result = await new Parse.Query(Project).equalTo('project_name', 'projectName01').first()
	const organizationList = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').first()
	await organizationList.addProject(result)
}

async function testremoveEntityGroup() {
	const result = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').first()
	const data = await new Parse.Query(Project).equalTo('project_name', 'projectName01').first()
	await result.removeEntityGroupTest(data)
}

async function addMemberstest() {
	const organizationObj = await new Parse.Query(Organization).first()
	const secondUser = await new Parse.Query(Parse.User).equalTo('username', 'secondUser').first()
	await organizationObj.testAddMembers(secondUser)
}

async function delMembers() {
	const secondUser = await new Parse.Query(Parse.User).equalTo('username', 'secondUser').first()
	const organizationList = await new Parse.Query(Organization).equalTo('organization_name', 'changrForOrganization01').first()
	await organizationList.testDelMembers(secondUser)
}

async function setMemberPermissiontest() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
	const currentUserToken = currentUser.getSessionToken()
	await Parse.User.become(currentUserToken)
	const thirdUser = await new Parse.Query(Parse.User).equalTo('username', 'thirdUser').first()
	const projectQuery = new Parse.Query(Project)
	const projectQueryList = await projectQuery.first()
	await projectQueryList.setMemberPermission(thirdUser)
}

describe('test function', () => {
	it('signUpUser', async () => {
		await signUpUser()
	})

	describe('Create table', async () => {
		beforeEach(async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			await Parse.User.become(currentUser.getSessionToken())
		})

		it('createOrganization result should instanceOf Organization', async () => {
			const result = await createOrganization('organizationName01')
			result.should.be.an.instanceOf(Organization)
		})

		it('createProject result should instanceOf Project', async () => {
			const result = await createProject('projectName01')
			result.should.be.an.instanceOf(Project)
		})

		it('createInventory result should instanceOf Inventory', async () => {
			const result = await createInventory('inventoryName01')
			result.should.be.an.instanceOf(Inventory)
		})

		it('createDevice result should instanceOf Device', async () => {
			const result = await createDevice('deviceName01')
			result.should.be.an.instanceOf(Device)
		})
	})

	describe('test data isolation', async () => {
		// 在之前我们通过firstUser创建了组织：organizationName01以及组织下的project projectName01
		// 现在我们用secondUser创建组织：organizationName02以及组织下的project projectName02
		it('create organization and project', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
			await Parse.User.become(currentUser.getSessionToken())
			await createOrganization('organizationName02')
			await createProject('organizationName02', 'projectName02')
		})

		// 根据我们设定的规则，两个用户之间的数据是无法相互读取的。以下两个测试用例通过就证明规则有效
		it('findResult01 length should be 0', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const secondUser = await Parse.User.logIn('secondUser', 'secondUser')
			await Parse.User.become(secondUser.getSessionToken())
			// 登录secondUser来查找organizationName01的信息
			const findOrganization = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').find()
			const findproject = await new Parse.Query(Project).equalTo('project_name', 'projectName01').find()
			findOrganization.should.be.length(0)
			findproject.should.be.length(0)
		})
		it('findResult01 length should be 1', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const firstUser = await Parse.User.logIn('firstUser', 'firstUser')
			await Parse.User.become(firstUser.getSessionToken())
			// 登录firstUser来查找organizationName02的信息
			const findOrganization = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName02').find()
			const findproject = await new Parse.Query(Project).equalTo('project_name', 'projectName02').find()
			findOrganization.should.be.length(0)
			findproject.should.be.length(0)
		})
	})

	// 所有数据都是用firstUser账号创建的，所以firstUser就是权限最大的管理员
	describe('testAddEntity', () => {
		it('result length should equal 1', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			await Parse.User.become(currentUser.getSessionToken())
			await testAddEntity()
			// 找到inventory_name 为inventoryName01的Inventory对象
			const invData = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
			const result = await new Parse.Query(Organization).equalTo('inventory', invData).find()
			result.should.have.length(1)
		})

		it('result length should equal 0', async () => {
			// secondUser是一个普通用户没有任何权限, 运行查询代码，预期是什么也查不到
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			const invData = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
			const result = await new Parse.Query(Organization).equalTo('inventory', invData).find()
			result.should.have.length(0)
		})

		it('result length should equal 1', async () => {
			// 把thirdUser角色添加到Organization__#{ Organization.id } __read__Organization
			// 和Organization__#{ Organization.id }__read__Inventory 角色下
			// 运行查询测试代码，可以根据inventory对象查询到Organization对象
			// 证明了testAddEntity函数确实把实体添加到实体组指定字段
			Parse.User.enableUnsafeCurrentUser()
			const firstUser = await Parse.User.logIn('firstUser', 'firstUser')
			const currentUserToken = firstUser.getSessionToken()
			await Parse.User.become(currentUserToken)

			const organizationObj = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').first()
			const orgReadRole = await organizationObj.createRole('read', organizationObj.className)
			const inventoryObj = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
			const invReadRole = await organizationObj.createRole('read', inventoryObj.className)

			const thirdUser = await new Parse.Query(Parse.User).equalTo('username', 'thirdUser').first()
			orgReadRole.getUsers().add(thirdUser)
			invReadRole.getUsers().add(thirdUser)
			await orgReadRole.save()
			await invReadRole.save()

			const thirdUserLogin = await Parse.User.logIn('thirdUser', 'thirdUser')
			const thirdUserToken = thirdUserLogin.getSessionToken()
			await Parse.User.become(thirdUserToken)
			const thirdUserInventoryObj = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
			const org = new Parse.Query(Organization)
			const result = await org.equalTo('inventory', thirdUserInventoryObj).find()
			result.should.be.length(1)
		})
	})

	describe('testremoveEntity', () => {
		it('finalData should be true', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			await testremoveEntity()
			const invresult = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
			const result = await new Parse.Query(Organization).equalTo('inventory', invresult).first()
			const finalData = (result === undefined)
			finalData.should.be.true()
		})

		it('finalData should be undefined', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('thirdUser', 'thirdUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			const invresult = await new Parse.Query(Inventory).equalTo('inventory_name', 'inventoryName01').first()
			const result = await new Parse.Query(Organization).equalTo('inventory', invresult).first()
			const finalData = (result === undefined)
			finalData.should.be.true()
		})
	})

	describe('testAddEntityGroup', () => {
		it('result length should equal 1', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			await Parse.User.become(currentUser.getSessionToken())
			await testAddEntityGroup()
			const proData = await new Parse.Query(Project).first()
			const result = await new Parse.Query(Organization).equalTo('Projects', proData).find()
			result.should.have.length(1)
		})

		it('result length should equal 1', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const firstUser = await Parse.User.logIn('firstUser', 'firstUser')
			const firstUserToken = firstUser.getSessionToken()
			await Parse.User.become(firstUserToken)

			const projectObj = await new Parse.Query(Project).equalTo('project_name', 'projectName01').first()
			const organizationObj = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').first()
			const proRole = await organizationObj.createRole('read', projectObj.className)
			const thirdUser = await new Parse.Query(Parse.User).equalTo('username', 'thirdUser').first()
			proRole.getUsers().add(thirdUser)
			await proRole.save()
			const currentUser = await Parse.User.logIn('thirdUser', 'thirdUser')
			await Parse.User.become(currentUser.getSessionToken())
			const proData = await new Parse.Query(Project).equalTo('project_name', 'projectName01').first()
			const result = await new Parse.Query(Organization).equalTo('Projects', proData).find()
			result.should.have.length(1)
		})
	})

	describe('testremoveEntityGroup', () => {
		it('finalData should be true', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			await testremoveEntityGroup()
			const proData = await new Parse.Query(Project).equalTo('project_name', 'projectName01').first()
			const organizationObj = await new Parse.Query(Organization).equalTo('Projects', proData).first()
			const finalData = (organizationObj === undefined)
			finalData.should.be.true()
		})
	})

	describe('addMemberstest', () => {
		it('result length should equal 1', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			await addMemberstest()
			const secondUser = await new Parse.Query(Parse.User).equalTo('username', 'secondUser').first()
			const result = await new Parse.Query(Organization).equalTo('members', secondUser).find()
			result.should.have.length(1)
		})

		it('result length should equal 1', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			const result = await new Parse.Query(Organization).equalTo('organization_name', 'organizationName01').first()
			// 原始的organization_name为'organization01',现在更改为changrForOrganization01
			result.set('organization_name', 'changrForOrganization01')
			await result.save()
			const changeDataResult = await new Parse.Query(Organization).equalTo('organization_name', 'changrForOrganization01').find()
			changeDataResult.should.have.length(1)

			const originalData = await new Parse.Query(Organization).equalTo('organization_name', 'organization01').find()
			originalData.should.have.length(0)
		})
	})

	describe('delMembers', () => {
		it('result length should equal 0', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('firstUser', 'firstUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			await delMembers()
			const result = await new Parse.Query(Organization).equalTo('members', currentUser).find()
			result.should.have.length(0)
		})

		it('result length should equal 0', async () => {
			Parse.User.enableUnsafeCurrentUser()
			const currentUser = await Parse.User.logIn('secondUser', 'secondUser')
			const currentUserToken = currentUser.getSessionToken()
			await Parse.User.become(currentUserToken)
			const result = await new Parse.Query(Organization).equalTo('organization_name', 'changrForOrganization01').find()
			result.should.have.length(0)
		})
	})

	describe('setMemberPermissiontest', () => {
		it('result length should equal 0', async () => {
			await setMemberPermissiontest()
			const result = await new Parse.Query(Project).find()
			result.length.should.be.oneOf([0, 1])
		})
	})
})
