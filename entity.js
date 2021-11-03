const { Parse } = require('./test/parse')
// 实体组抽象类
class EntityGroup extends Parse.Object {
	constructor(...args) {
		super(...args)
	}
	static get Permissions() {
		return ['read', 'write']
	}

	static get withGrant() {
		return false
	}

	// 把实体添加到当前实体组的fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async addEntity(fieldName, entity) {
		if (typeof entity !== 'object' || !fieldName) {
			console.log('typeof error:entity need a object or fieldName Must be entered')
			return
		}
		try {
			const relation = this.organization.relation(fieldName)
			relation.add(entity)
			await this.organization.save()

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
		} catch (error) {
			const role = new Parse.Query(Parse.Role)
			role.containedIn('name',[`Organization__${org_id}__read__Inventory`,`Organization__${org_id}__write__Inventory`])
			const role_list = role.find()
			for (let index = 0; index < role_list.length; index++) {
				await array[index].destroy()
			}
		}
	}

	// 把实体从当前实体组的fieldName数组字段里删除
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async removeEntity(fieldName, entity) {
		const relation = this.organization.relation(fieldName)
		relation.remove(entity)
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
		try {
			const current_user = Parse.User.current()
			const org_id = this.organization.id
			const roleACL = new Parse.ACL()
			roleACL.setRoleReadAccess(`Organization__${org_id}__grant`, true)
			roleACL.setRoleWriteAccess(`Organization__${org_id}__grant`, true)
			const role_A = new Parse.Role(`Organization__${org_id}__read__Project`, roleACL)
			const role_B = new Parse.Role(`Organization__${org_id}__write__Project`, roleACL)
			role_A.getUsers().add(current_user)
			role_B.getUsers().add(current_user)
			await role_A.save()
			await role_B.save()
	
			const roleACL_Project = new Parse.ACL()
			roleACL_Project.setRoleReadAccess(`Organization__${org_id}__read__Project`, true)
			roleACL_Project.setRoleWriteAccess(`Organization__${org_id}__write__Project`, true)
			entityGroup.setACL(roleACL_Project)
			await entityGroup.save()
	
			const relation = this.organization.relation(fieldName)
			relation.add(entityGroup)
			await this.organization.save()
	
		} catch (error) {
			const role = new Parse.Query(Parse.Role)
			role.containedIn('name',[`Organization__${org_id}__read__Project`,`Organization__${org_id}__write__Project`])
			const role_list = role.find()
			for (let index = 0; index < role_list.length; index++) {
				await array[index].destroy()
			}
		}
	}

	// 把实体组从当前实体组fieldName数组字段里删除，并设置好权限规则
	// 实体组下的资源也会被删除
	// fieldName：String，字段名
	// entityGroup：EntityGroup，实体组
	async removeEntityGroup(fieldName, entityGroup) {
		const entityGroup_detail = entityGroup.attributes
		const key_list = Object.keys(entityGroup_detail)
		for (let index = 0; index < key_list.length; index++) {
			if (entityGroup_detail[key_list[index]] instanceof Parse.Relation) {
				const relation = entityGroup.relation(key_list[index])
				const  realtion_result =await relation.query().find()
				for (let index = 0; index < realtion_result.length; index++) {
					relation.remove(realtion_result[index])
					await entityGroup.save()
					await realtion_result[index].destroy()
				}
			}
		}

		// const query = new Parse.Query(Parse.Role)
		// query.containedIn('name', [`Organization.${org_id}.read.Project`,`Organization.${org_id}.write.Project`,
		// 	`Project.${entityGroup.id}.read.Device`, `Project.${entityGroup.id}.write.Device`])
		// const role_list = await query.find({ useMasterKey: true })
		// for (let index = 0; index < role_list.length; index++) {
		// 	await array[index].destroy()
		// }

		await entityGroup.destroy()
		const org = this.organization
		const relation = org.relation(fieldName)
		relation.remove(entityGroup)
		await org.save()
	}

	// 向实体组添加成员，创建对应的角色权限，并添加此成员到角色里
	// user: Parse.User，要添加的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async addMembers(user, permissions = EntityGroup.Permissions, withGrant = EntityGroup.withGrant) {
		const org_id = this.organization.id
		const relation = this.organization.relation('members')
		relation.add(user)
		await this.organization.save()

		const roleACL = new Parse.ACL()
		for (let index = 0; index < permissions.length; index++) {
			if (permissions[index] === 'read') {
				const read_Role = new Parse.Role(`Organization__${org_id}__read__user`, roleACL)
				read_Role.getUsers().add(user)
				await read_Role.save()
			}
			if (permissions[index] === 'write') {
				const write_Role = new Parse.Role(`Organization__${org_id}__write__user`, roleACL)
				write_Role.getUsers().add(user)
				await write_Role.save()
			}
		}

		if (withGrant) {
			const withGrant_roleACL = this.organization.getACL()
			withGrant_roleACL.setReadAccess(user, true)
			withGrant_roleACL.setWriteAccess(user, true)
			this.organization.setACL(withGrant_roleACL)
			await this.organization.save()
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

		const org_id = org.id
		const user_role_query = new Parse.Query(Parse.Role)
		user_role_query.containedIn('name', [`Organization__${org_id}__write__user`, `Organization__${org_id}__read__user`])
		const user_role_list = await user_role_query.find()
		console.log('LLLLLLLLLLLL',user_role_list)

		for (let index = 0; index < user_role_list.length; index++) {
			const role_relation = user_role_list[index].relation('users')
			role_relation.remove(user)			
			const role_acl = user_role_list[index].getACL()
			role_acl.setReadAccess(user, false)
			role_acl.setWriteAccess(user, false)
			user_role_list[index].setACL(role_acl)
			await user_role_list[index].save()
		}
		// await user.destroy()
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async setMemberPermission(user, permissions = EntityGroup.Permissions, withGrant = EntityGroup.withGrant) {
		const org_id = this.organization.id
		const role_obj = new Parse.Query(Parse.Role)

		for (let index = 0; index < permissions.length; index++) {
			if (permissions[index]==='read') {
				role_obj.containedIn('name',[`Organization.${org_id}.read.Organization`])
				const [result] = await role_obj.find()
				result.getUsers().add(user)
				result.save()
			}
			
			if (permissions[index]==='writer') {
				role_obj.containedIn('name',[`Organization.${org_id}.writer.Organization`])
				const [result] = await role_obj.find()
				result.getUsers().add(user)
				result.save()
			}
		}

		if (withGrant) {
			role_obj.containedIn('name',[`Organization.${org_id}.grant`])
			const [result] = await role_obj.find()
			result.getUsers().add(user)
			result.save()
		}
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
