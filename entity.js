const { Parse } = require('./test/parse')
// 实体组抽象类
class EntityGroup extends Parse.Object {
	constructor(...args) {
		super(...args)
		console.log('))constructor)))', args)
		// this.name = this.constructor.name
		// this.insert_list = []
	}
	static get Permissions() {
		return ['read', 'write']
	}

	// 把实体添加到当前实体组的fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async addEntity(fieldName, entity) {
		if (typeof entity !== 'object' || !fieldName) {
			console.log('typeof error:entity need a object or fieldName Must be entered')
			return
		}
		// const org_id = this.organization.id
		const org_id = '001'

		const query_data = new Parse.Query(Parse.Role)
		query_data.containedIn('name', [`Organization.${org_id}.read`, `Organization.${org_id}.write`, `Organization.${org_id}.grant`])
		const query_data_list = await query_data.find({ useMasterKey: true })

		console.log('::::::::1:::::::::::::', this.organization)
		console.log(':::::::::2::::::::::::', fieldName)
		console.log(':::::::::::3::::::::::', entity)

		const relation = this.organization.relation(fieldName)
		relation.add(entity)
		await this.organization.save()

		const org_id = this.organization.id
		// const query_data = new Parse.Query(Parse.Role)
		// query_data.containedIn('name',[`Organization__${org_id}__read__Inventory`, `Organization__${org_id}__write__Inventory`])
		// const query_data_list = await query_data.find({ useMasterKey: true })

		const roleACL = new Parse.ACL()
		roleACL.setRoleReadAccess(`Organization__${org_id}__grant`, true)
		roleACL.setRoleWriteAccess(`Organization__${org_id}__grant`, true)
		const role_A = new Parse.Role(`Organization__${org_id}__read__Inventory`, roleACL)
		const role_B = new Parse.Role(`Organization__${org_id}__write__Inventory`, roleACL)
		await role_A.save()
		await role_B.save()

		const inventory_roleACL = new Parse.ACL()
		inventory_roleACL.setRoleWriteAccess(`Organization__${org_id}__read__Inventory`, true)
		inventory_roleACL.setRoleReadAccess(`Organization__${org_id}__write__Inventory`, true)
		entity.setACL(inventory_roleACL)
		await entity.save()

		const relation = this.organization.relation(fieldName)
		relation.add(entity)
		await this.organization.save()
	}

	// 把实体从当前实体组的fieldName数组字段里删除
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async removeEntity(fieldName, entity) {
		const relation = this.organization.relation(fieldName)
		relation.remove(entity)
		await this.organization.save()
	}

	// 把实体从当前实体组的fieldName数组字段里删除
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async removeEntity(fieldName, entity) {
		const relation = this.organization.relation(fieldName);
		relation.remove(entity);
		await this.organization.save()
	}

	// 把实体组添加到当前实体组fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entityGroup：EntityGroup，实体组
	async addEntityGroup(fieldName, entityGroup) {
		if (typeof entityGroup !== 'object' || !fieldName) {
			console.log('typeof error:entity need a ( object or array) or fieldName Must be entered')
			return
		}
		const current_user = Parse.User.current()
		const org_id = this.organization.id
		const roleACL = new Parse.ACL()
		roleACL.setRoleReadAccess(`Organization__${org_id}__grant`, true)
		roleACL.setRoleWriteAccess(`Organization__${org_id}__grant`, true)
		const role_A = new Parse.Role(`Organization__${org_id}__read__Project`, roleACL)
		const role_B = new Parse.Role(`Organization__${org_id}__write__Project`, roleACL)
		// role_A.getUsers().add(current_user)
		// role_B.getUsers().add(current_user)

		await role_A.save()
		await role_B.save()

		const roleACL_1 = new Parse.ACL()
		roleACL_1.setRoleReadAccess(`Organization__${org_id}__read__Project`, true)
		roleACL_1.setRoleWriteAccess(`Organization__${org_id}__write__Project`, true)
		entityGroup.setACL(roleACL_1)
		await entityGroup.save()

		const relation = this.organization.relation(fieldName)
		relation.add(entityGroup)
		await this.organization.save()
	}

	// 把实体组从当前实体组fieldName数组字段里删除，并设置好权限规则
	// 实体组下的资源也会被删除
	// fieldName：String，字段名
	// entityGroup：EntityGroup，实体组
	async removeEntityGroup(fieldName, entityGroup) {
		const devices = entityGroup.attributes.devices
		// 从下往上删除 未完成
		const org = this.organization
		const relation = org.relation(fieldName)
		relation.remove(entityGroup)
		org.save()

		const query = new Parse.Query(Parse.Role)
		query.containedIn('name', [`Organization.${org.id}.read.Project`, `Organization.${org.id}.write.Project`, `Project.${org.id}.read.Device`, `Project.${org.id}.write.Device`])
		const role_list = await query.find({ useMasterKey: true })
		for (let index = 0; index < role_list.length; index++) {
			array[index].destroy()
		}

		entityGroup.destroy()
	}

	// 向实体组添加成员，创建对应的角色权限，并添加此成员到角色里
	// user: Parse.User，要添加的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async addMembers(user, permissions = EntityGroup.Permissions, withGrant) {
		const org_id = this.organization.id
		const relation = this.organization.relation('numbers')
		relation.add(user)
		await this.organization.save()

		const roleACL = new Parse.ACL()
		for (let index = 0; index < permissions.length; index++) {
			if (permissions[index] === 'read') {
				const read_Role = new Parse.Role(`Organization.${org_id}.read-user`, roleACL)
				read_Role.getUsers().add(user)
				await read_Role.save()
			}
			if (permissions[index] === 'write') {
				const write_Role = new Parse.Role(`Organization.${org_id}.write-user`, roleACL)
				write_Role.getUsers().add(user)
				await write_Role.save()
			}
		}

		if (withGrant) {
			const withGrant_roleACL = this.organization.getACL()
			withGrant_roleACL.setReadAccess(user.id, true)
			withGrant_roleACL.setWriteAccess(user.id, true)
			withGrant_roleACL.setACL(withGrant_roleACL)
			await withGrant_roleACL.save()
		}
	}

	// 删除实体组成员，并在对应的角色权限中删除此成员
	// user: Parse.User，要添加的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	async delMembers(user) {
		const org = this.organization
		const relation = org.relation('members')
		relation.remove(user)
		await org.save()

		const user_role_query = new Parse.Query(Parse.Role)
		user_role_query.containedIn('name', [`Organization.${org_id}.write-user`, `Organization.${org_id}.read-user`])
		const user_role_list = user_role_query.find({ useMasterKey: true })

		for (let index = 0; index < user_role_list.length; index++) {
			const role_acl = role_list[index].getACL()
			role_acl.setReadAccess(user, false)
			role_acl.setWriteAccess(user, false)
			role_list[index].setACL(role_acl)
			await role_list[index].save()
		}
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async setMemberPermission(user, permissions = EntityGroup.Permissions, withGrant) {

	}


}



// 组织实体组
class Organization extends EntityGroup {
	addProject(project) {
		return super.addEntityGroup('projects', project)
	}
}
Parse.Object.registerSubclass('Organization', Organization)

// 项目实体组
class Project extends EntityGroup {
	addDevice(device) {
		return super.addEntity('devices', device)
	}
}
Parse.Object.registerSubclass('Project', Project)






module.exports = {
	// 用户要创建自己的业务实体组，可以通过继承这个类
	EntityGroup,
	Organization,
	Project,
}
