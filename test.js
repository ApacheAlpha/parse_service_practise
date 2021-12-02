/* eslint-disable max-classes-per-file */
const should = require('should')
const entity = require('./entity')
const { Parse } = require('./parse')

class Organization extends entity.EntityGroup {
	constructor() {
		// eslint-disable-next-line constructor-super
		return super('Organization')
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
	// 先注册一个用户
	const user = new Parse.User()
	user.set('username', 'user2')
	user.set('password', 'user2')
	user.set('email', 'email@example.com')
	user.set('phone', '415-392-0202')
	const result = await user.signUp()
	return result
}

async function login() {
	const loginResult = await Parse.User.logIn('user2', 'user2')
	return loginResult
}

async function createOrganization() {
	Parse.User.enableUnsafeCurrentUser()
	// r:02ba813687c3383328740a452cf17416 运行login()后可以在控制面板从Session表中获取sessionToken
	// 但是这个sessionToken是有时效性的,出现 Error: Invalid session token,运行login()再次获取即可
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	const organization = new Organization()
	organization.set('organization_name', 'organization01')
	// 创建一条数据的时候要把这条数据ACL设置为当前用户
	organization.setACL(new Parse.ACL(currentUser))
	const organizationResult = await organization.save()
	return organizationResult
}

async function createProject() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	const pro = new Project()
	pro.set('project_name', 'project01')
	pro.setACL(new Parse.ACL(currentUser))
	const proResult = await pro.save()
	return proResult
}

async function createInventory() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	const inv = new Inventory()
	inv.set('inventory_name', 'inventory01')
	inv.setACL(new Parse.ACL(currentUser))
	const invResult = await inv.save()
	return invResult
}

async function createDevice() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	const dev = new Device()
	dev.set('sn', 'AA00000110')
	dev.setACL(new Parse.ACL(currentUser))
	const idevResult = await dev.save()
	return idevResult
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
	result.removeEntityTest(data)
}

async function testAddEntityGroup() {
	const ProjectQuery = new Parse.Query(Project)
	const [result] = await ProjectQuery.find()
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	organizationList.addProject(result)
}

async function testremoveEntityGroup() {
	const org = new Parse.Query(Organization)
	const [result] = await org.find()
	const pro = new Parse.Query(Project)
	const [data] = await pro.find()
	result.removeEntityGroupTest(data)
}

async function addMemberstest() {
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	organizationList.testAddMembers(currentUser)
}

async function delMembers() {
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	organizationList.testDelMembers(currentUser)
}

async function setMemberPermissiontest() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')

	// const organizationQuery = new Parse.Query(Organization)
	// const [organizationList] = await organizationQuery.find()
	// organizationList.setMemberPermissiontest(currentUser)

	const projectQuery = new Parse.Query(Project)
	const [projectQueryList] = await projectQuery.find()
	projectQueryList.setMemberPermission(currentUser)
}

// async function test() {
// 	Parse.User.enableUnsafeCurrentUser()
// 	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
// 	const invQuery = new Parse.Query(Inventory)
// 	const [invQueryList] = await invQuery.find()
// 	console.log(')))))))))projectQueryList))))))))', invQueryList)
// }

describe('test function', () => {
	// it('signUpUser result should instanceOf Parse.User', async () => {
	// 	const result = await signUpUser()
	// 	result.should.be.an.instanceOf(Parse.User)
	// })

	// it('login result should instanceOf Parse.User', async () => {
	// 	const result = await login()
	// 	result.should.be.an.instanceOf(Parse.User)
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
	// it('createDevice result should instanceOf Device', async () => {
	// 	// await test()
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	// 	await testremoveEntity()
	// })

	// it('result length should equal 1', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	// 	await testAddEntity()

	// 	const inv = new Parse.Query(Inventory)
	// 	const [invData] = await inv.find()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('inventory', invData)
	// 	const result = await org.find()
	// 	result.should.have.length(1)
	// })

	// it('result length should equal 0', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	// 	await testremoveEntity()

	// 	const inv = new Parse.Query(Inventory)
	// 	const [invData] = await inv.find()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('inventory', invData)
	// 	const result = await org.find()
	// 	result.should.have.length(0)
	// })

	// it('result length should equal 1', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
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
	// 	await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	// 	await testremoveEntityGroup()
	// 	const pro = new Parse.Query(Project)
	// 	const [proData] = await pro.find()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('Projects', proData)
	// 	const result = await org.find()
	// 	result.should.have.length(0)
	// })

	// it('result length should equal 1', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	// 	await addMemberstest()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('members', currentUser)
	// 	const result = await org.find()
	// 	result.should.have.length(1)
	// })

	// it('result length should equal 0', async () => {
	// 	Parse.User.enableUnsafeCurrentUser()
	// 	const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
	// 	await delMembers()
	// 	const org = new Parse.Query(Organization)
	// 	org.equalTo('members', currentUser)
	// 	const result = await org.find()
	// 	result.should.have.length(0)
	// })

	it('result length should equal 0', async () => {
		Parse.User.enableUnsafeCurrentUser()
		const currentUser = await Parse.User.become('r:3cd1455c371d3496e0b07854dc97af3d')
		await setMemberPermissiontest()
		// const org = new Parse.Query(Organization)
		// org.equalTo('members', currentUser)
		// const result = await org.find()
		// result.should.have.length(0)
	})
})