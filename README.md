# parse_service_practise.md

[TOC]

## 该parse service SDK本人练习随手所写，请勿直接带入生产或者测试环境一共包含一个实体组抽象类EntityGroup和多个类方法，详细代码在名称为entity的js文件中
&nbsp;
### 实体组和实体的关系图
&nbsp;
![avatar](image\relation.png)
&nbsp;

|方法名 | 参数1 | 参数2 | 参数3 | 参数4 | 方法作用|
|------ |------|------|------|------|------|
|ensurePermissionGrant(roleName) | 实体组的grant角色名称 | 无 | 无 | 无 | 确保最高权限grant存在|
|ensureRole(permission, className) | permission 权限名称 | 稍微 | 稍微 | 稍微 | 确保一般权限存在，存在便返回该权限的Parse.Object|
|addEntity(fieldName, entity) | fieldName 关系字段 | entity 实体对象 | 无 | 无 | 把实体添加到当前实体组的fieldName关系字段里 |
|removeEntity(fieldName, entity) | fieldName 关系字段 | entity 实体对象| 无 | 无 | 把实体从当前实体组的fieldName关系字段里移除|
|addEntityGroup(fieldName, entityGroup) | fieldName 关系字段 | entityGroup 实体组对象| 无 | 无  | 把实体组添加到当前实体组fieldName关系字段里|
|removeEntityGroup(fieldName, entityGroup) | fieldName 关系字段 | entityGroup 实体组对象| 无 | 无  | 把实体组从当前实体组fieldName关系字段里移除|
|addMembers(user, withGrant = false) | user 用户对象 | withGrant 决定是否授予用户最高grant权限| 无 | 无  | 把实体组从当前实体组fieldName关系字段里移除|
|delMembers(user) | user 要被删除的用户 | 无 | 无 | 无 | 删除实体组成员，并在对应的角色权限中删除此成员|
|setMemberPermission(user, permissions, withGrant = false) | user 被改变的用户 | permissions 用户权限 | withGrant 决定是否授予用户最高grant权限 | 无 | 改变某实体组成员的权限|

&nbsp;

### 1、创建继承于EntityGroup的organization、Project、inventory、device 子类并注册

```
class organization extends entity.EntityGroup {
	constructor() {
		return super('organization')
	}

	addEntity(entityData) {
		return super.addEntity('inventory', entityData)
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

	// removeEntityGroup(entityGroup) {
	// 	return super.removeEntityGroup('projects', entityGroup)
	// }
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
<!-- 首先分别创建organization、Inventory、Device、Project 四格表，并建立相关的relation关系
,字段可以随意填写-->

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
async function testAddEntity() {
	<!-- 创建一个inventory实体对象并创建实体对象与实体组organization的relation关系到organization的inventory字段-->

	const invObj = new Parse.Object('inventory')
	invObj.set('sn', '测试000')
	await invObj.save()

	const organization_query = new Parse.Query(organization)
	const [organization_list] = await organization_query.find()
	organization_list.addEntity(invObj)
}

2、
async function testAddEntityGroup() {
	<!-- 获取一个Project项目组的对象，再建立Project与organization的relation关系 -->
	const Project_query = new Parse.Query(Project)
	const [result] = await Project_query.find()
	const organization_query = new Parse.Query(organization)
	const [organization_list] = await organization_query.find()
	organization_list.addProject(result)
}




```







