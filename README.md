# parse_service_practise.md

## 该parse service SDK本人练习随手所写，请勿直接带入生产或测试环境一共包含一个实体组抽象类EntityGroup和多个类方法，详细代码在名称为entity的js文件中
&nbsp;
### 实体组和实体的关系图
&nbsp;
[![IDulZ9.png](https://z3.ax1x.com/2021/11/12/IDulZ9.png)](https://imgtu.com/i/IDulZ9)
&nbsp;

|方法名 | 参数1 | 参数2 | 参数3 | 参数4 | 方法作用|
|------ |------|------|------|------|------|
|ensurePermissionGrant(roleName) | 实体组的grant角色名称 | 无 | 无 | 无 | 确保最高权限grant存在|
|ensureRole(permission, className) | permission 权限名称 | className 当前实体或者实体组类名 | 无 | 无 | 确保一般权限存在，存在便返回该权限的Parse.Object|
|addEntity(fieldName, entity) | fieldName 关系字段 | entity 实体对象 | 无 | 无 | 把实体添加到当前实体组的fieldName关系字段里 |
|removeEntity(fieldName, entity) | fieldName 关系字段 | entity 实体对象| 无 | 无 | 把实体从当前实体组的fieldName关系字段里移除|
|addEntityGroup(fieldName, entityGroup) | fieldName 关系字段 | entityGroup 实体组对象| 无 | 无  | 把实体组添加到当前实体组fieldName关系字段里|
|removeEntityGroup(fieldName, entityGroup) | fieldName 关系字段 | entityGroup 实体组对象| 无 | 无  | 把实体组从当前实体组fieldName关系字段里移除|
|addMembers(user, withGrant = false) | user 用户对象 | withGrant 决定是否授予用户最高grant权限| 无 | 无  | 把实体组从当前实体组fieldName关系字段里移除|
|delMembers(user) | user 要被删除的用户 | 无 | 无 | 无 | 删除实体组成员，并在对应的角色权限中删除此成员|
|setMemberPermission(user, permissions, withGrant = false) | user 被改变的用户 | permissions 用户权限 | withGrant 决定是否授予当前用户最高grant权限 | 无 | 改变某实体组成员的权限|

### 1、创建继承于EntityGroup的organization、Project、inventory、device 子类并注册

```javaScript
const should = require('should')
const entity = require('./entity')
const { Parse } = require('./parse')

class organization extends entity.EntityGroup {
	constructor() {
		return super('organization')
	}

	testAddEntity(entityData) {
		return this.addEntity('inventory', entityData)
	}

	removeEntityTest(entitydata) {
		return this.removeEntity('inventory', entitydata)
	}

	testAddEntityGroup(project) {
		return this.addEntityGroup('projects', project)
	}

	removeEntityGroupTest(entityGroup) {
		return this.removeEntityGroup('projects', entityGroup)
	}

	testAddMembers(user) {
		return this.addMembers(user)
	}

	testDelMembers(user) {
		return this.delMembers(user)
	}
}
Parse.Object.registerSubclass('organization', organization)

class Project extends entity.EntityGroup {
	constructor() {
		super('Project')
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

```

### 2、在organization类基础上进行类方法测试，实例如下
```javaScript
<!-- 首先分别创建organization、Inventory、Device、Project 四个表-->
	// 先注册一个用户
async function signUpUser() {
	const user = new Parse.User()
	user.set('username', 'user2')
	user.set('password', 'user2')
	user.set('email', 'email@example.com')
	user.set('phone', '415-392-0202')
	const result = await user.signUp()
	return result
}
// 注册用户后进行登录
async function login() {
	const loginResult = await Parse.User.logIn('user2', 'user2')
	return loginResult
}

// 创建Organization表并添加数据
async function createOrganization() {
	Parse.User.enableUnsafeCurrentUser()
	// r:02ba813687c3383328740a452cf17416 运行login()后可以在控制面板从Session表中获取sessionToken
	// 但是这个sessionToken是有时效性的,出现 Error: Invalid session token,运行login()再次获取即可
	const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const organization = new Organization()
	organization.set('organization_name', 'organization01')
	// 创建一条数据的时候要把这条数据ACL设置为当前用户，下同
	organization.setACL(new Parse.ACL(currentUser))
	const organizationResult = await organization.save()
	return organizationResult
}

// 创建Project表并添加数据
async function createProject() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const pro = new Project()
	pro.set('project_name', 'project01')
	pro.setACL(new Parse.ACL(currentUser))
	const proResult = await pro.save()
	return proResult
}

// 创建Inventory表并添加数据
async function createInventory() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const inv = new Inventory()
	inv.set('inventory_name', 'inventory01')
	inv.setACL(new Parse.ACL(currentUser))
	const invResult = await inv.save()
	return invResult
}

// 创建Device表并添加数据
async function createDevice() {
	Parse.User.enableUnsafeCurrentUser()
	const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const dev = new Device()
	dev.set('sn', 'AA00000110')
	dev.setACL(new Parse.ACL(currentUser))
	const idevResult = await dev.save()
	return idevResult
}

// 编写测试函数
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
	const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	await organizationList.testAddMembers(currentUser)
}

async function delMembers() {
	const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const organizationQuery = new Parse.Query(Organization)
	const [organizationList] = await organizationQuery.find()
	await organizationList.testDelMembers(currentUser)
}

async function setMemberPermissiontest() {
	Parse.User.enableUnsafeCurrentUser()
	await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
	const addUser = await new Parse.Query(Parse.User).find()
	const projectQuery = new Parse.Query(Project)
	const [projectQueryList] = await projectQuery.find()
	await projectQueryList.setMemberPermission(addUser[1])
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
		result.should.be.an.instanceOf(Project)
	})

	it('createInventory result should instanceOf Inventory', async () => {
		const result = await createInventory()
		result.should.be.an.instanceOf(Inventory)
	})

	it('createDevice result should instanceOf Device', async () => {
		const result = await createDevice()
		result.should.be.an.instanceOf(Device)
	})

	// 测试函数开始
	it('result length should equal 1', async () => {
		Parse.User.enableUnsafeCurrentUser()
		await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
		await testAddEntity()

		const inv = new Parse.Query(Inventory)
		const [invData] = await inv.find()
		const org = new Parse.Query(Organization)
		org.equalTo('inventory', invData)
		const result = await org.find()
		result.should.have.length(1)
	})

	it('finalData should be undefined', async () => {
		Parse.User.enableUnsafeCurrentUser()
		await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
		await testremoveEntity()
		const org = new Parse.Query(Organization)
		const [result] = await org.find()
		const data = result.get('parents')
		const finalData = (data === undefined)
		finalData.should.be.true()
	})

	it('result length should equal 1', async () => {
		Parse.User.enableUnsafeCurrentUser()
		await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
		await testAddEntityGroup()
		const pro = new Parse.Query(Project)
		const [proData] = await pro.find()
		const org = new Parse.Query(Organization)
		const result = await org.find()
		org.equalTo('Projects', proData)
		result.should.have.length(1)
	})

	it('result length should equal 0', async () => {
		Parse.User.enableUnsafeCurrentUser()
		await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
		await testremoveEntityGroup()
		const pro = new Parse.Query(Project)
		const [proData] = await pro.find()
		const data = proData.get('parents')
		const finalData = (data === undefined)
		finalData.should.be.true()
	})

	it('result length should equal 1', async () => {
		Parse.User.enableUnsafeCurrentUser()
		const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
		await addMemberstest()
		const org = new Parse.Query(Organization)
		org.equalTo('members', currentUser)
		const result = await org.find()
		result.should.have.length(1)
	})

	it('result length should equal 0', async () => {
		Parse.User.enableUnsafeCurrentUser()
		const currentUser = await Parse.User.become('r:05d0ff3b1c07565e8a00049a8ade7cc2')
		await delMembers()
		const org = new Parse.Query(Organization)
		org.equalTo('members', currentUser)
		const result = await org.find()
		result.should.have.length(0)
	})

	it('result length should equal 0', async () => {
		Parse.User.enableUnsafeCurrentUser()
		await Parse.User.become('r:300b233e381f232a52a561099737ff5b')
		await setMemberPermissiontest()
		const pro = new Parse.Query(Project)
		const result = await pro.find()
		result.should.have.length(1)
	})
})
```

