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

&nbsp;

### 1、创建继承于EntityGroup的organization、Project、inventory、device 子类并注册

```
class organization extends entity.EntityGroup {
	constructor() {
		return super('organization')
	}

	testAddEntity(entityData) {
		return super.addEntity('inventory', entityData)
	}

	removeEntityTest(entitydata) {
		return super.removeEntity('inventory', entitydata)
	}

	testAddEntityGroup(project) {
		return super.addEntityGroup('projects', project)
	}

	removeEntityGroupTest(entityGroup) {
		return super.removeEntityGroup('projects', entityGroup)
	}

	testAddMembers(user) {
		return super.addMembers(user)
	}

	testDelMembers(user) {
		return super.delMembers(user)
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
```
<!-- 首先分别创建organization、Inventory、Device、Project 四个表，
并建立相关的relation关系,set方法里的字段可以随意填写,测试过程中可能会涉及到权限问题，所以查询语句均传入master key-->

async function createTable() {
	const device = new Device()
	device.set('sn', 'BD897879T')
	await device.save()

	const project = new Project()
	const devicesRelation = organization.relation('devices')
	devicesRelation.add(device)
	await project.save()

	const inventory = new Inventory()
	inventory.set('device_id', '87842342342hjh324jh23')
	await inventory.save()

	const organization = new organization()
	const projectsRelation = organization.relation('projects')
	projectsRelation.add(project)

	const inventoryRelation = organization.relation('inventorys')
	inventoryRelation.add(inventory)
	await organization.save()
}

createTable()

1、
async function testFunctionAddEntity() {
	<!-- 创建一个inventory实体对象
	并创建实体对象与实体组organization的relation关系到organization的inventory字段-->

	const invObj = new Parse.Object('inventory')
	invObj.set('sn', '测试000')
	await invObj.save()

	const organization_query = new Parse.Query(organization)
	const [organization_list] = await organization_query.find()
	organization_list.testAddEntity(invObj)
}
2、
<!-- 从organization的inventory字段中移除与某个inventory对象的relation关系-->
async function testremoveEntity() {
	const org = new Parse.Query(organization)
	const [result] = await org.find({ useMasterKey: true })
	const pro = new Parse.Query(inventory)
	const [data] = await pro.find({ useMasterKey: true })
	result.removeEntityTest(data)
}
3、
async function testFunctionAddEntityGroup() {
	<!-- 获取一个Project项目组的对象，再建立Project与organization的relation关系-->
	const Project_query = new Parse.Query(Project)
	const [result] = await Project_query.find()
	const organization_query = new Parse.Query(organization)
	const [organization_list] = await organization_query.find()
	organization_list.testAddEntityGroup(result)
}
4、
<!-- 获取一个Project项目组的对象，再从organization的Projects字段移除该对象与organization的relation关系-->
async function testremoveEntityGroup() {
	const org = new Parse.Query(organization)
	const [result] = await org.find({ useMasterKey: true })
	const pro = new Parse.Query(Project)
	const [data] = await pro.find({ useMasterKey: true })
	result.removeEntityGroupTest(data)
}
5、
<!-- 添加用户到项目组到organization -->
async function addMemberstest() {
	const userQuery = new Parse.Query(Parse.User)
	const [userList] = await userQuery.find({ useMasterKey: true })
	const organizationQuery = new Parse.Query(organization)
	const [organizationList] = await organizationQuery.find({ useMasterKey: true })
	organizationList.testAddMembers(userList)
}

6、
<!-- 从项目组organization中删除user对象 -->
async function delMembers() {
	const userQuery = new Parse.Query(Parse.User)
	const [user] = await userQuery.find()
	const organizationQuery = new Parse.Query(organization)
	const [organizationData] = await organizationQuery.find()
	organizationData.testDelMembers(user)
}
```

