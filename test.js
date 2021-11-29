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
	// 但是这个sessionToken是有时效性的,出现 Error: Invalid session token重新运行login()再次获取即可
	const currentUser = await Parse.User.become('r:02ba813687c3383328740a452cf17416')
	// 创建数据的时候要把ACL改为当前用户，代码未写完

	const organization = new Organization()
	organization.set('organization_name', 'organization01')
	const organizationResult = await organization.save()
	return organizationResult
}

async function createProject() {
	const pro = new Project()
	pro.set('project_name', 'project01')
	const proResult = await pro.save()
	return proResult
}

async function createInventory() {
	const inv = new Inventory()
	inv.set('inventory_name', 'inventory01')
	const invResult = await inv.save()
	return invResult
}

async function createDevice() {
	const dev = new Device()
	dev.set('device_name', 'device01')
	const idevResult = await dev.save()
	return idevResult
}

describe('test function', () => {
	it('signUpUser result should instanceOf Parse.User', async () => {
		const result = await signUpUser()
		result.should.be.an.instanceOf(Parse.User)
	})

	it('login result should instanceOf Parse.User', async () => {
		const result = await login()
		result.should.be.an.instanceOf(Parse.User)
	})

	it('createOrganization result should instanceOf Organization', async () => {
		const result = await createOrganization()
		result.should.be.an.instanceOf(Organization)
	})

	it('createProject result should instanceOf Project', async () => {
		const result = await createProject()
		result.should.be.an.instanceOf(Organization)
	})

	it('createInventory result should instanceOf Inventory', async () => {
		const result = await createInventory()
		result.should.be.an.instanceOf(Inventory)
	})

	it('createDevice result should instanceOf Device', async () => {
		const result = await createDevice()
		result.should.be.an.instanceOf(Device)
	})
})
