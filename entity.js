const {Parse} = require('./parse')
// 实体组抽象类
class EntityGroup extends Parse.Object {
	constructor(){
		super()
		this.name = this.constructor.name
		this.insert_list = []
	}

	// 把实体添加到当前实体组的fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async addEntity(fieldName, entity) {
		if (typeof entity!=='object' || !fieldName ) {
			console.log('typeof error:entity need a object or fieldName Must be entered')
			return
		}

		try {
			const query_data = new Parse.Query(this.name)
			const query_data_list = await query_data.find({useMasterKey:true})
			const result = 	query_data_list[0].get(fieldName)
			if (result.length) {
				result.push(entity)
			}
			query_data_list[0].set(fieldName,result)

			// await query_data_list[0].save()
			const role_query = new Parse.Query(Parse.Role)
			role_query.startsWith('name', 'Organization')
			role_query.endsWith('name','Organization')
			const role_list = await role_query.find({useMasterKey:true})

			for (let index = 0; index < role_list.length; index++) {
				const acl = new Parse.ACL()
				if (role_list[index].attributes.name.indexOf('read')) {
					acl.setReadAccess(role_list[index], true)
					entity.setACL(acl)
					// entity.save()
					return
				}
				acl.setReadAccess(role_list[index], true)
				acl.setWriteAccess(role_list[index], true)
				entity.setACL(acl)
			// entity.save()        
			}
		} catch (error) {
			console.log('addEntity error: ',error)
		}
	}

	// 把实体组添加到当前实体组fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entityGroup：EntityGroup，实体组
	async addEntityGroup(fieldName, entityGroup) {
		if (typeof entityGroup!=='object' || !fieldName || !entityGroup.length ) {
			console.log('typeof error:entity need a ( object or array) or fieldName Must be entered')
			return
		}
		const query_data = new Parse.Query(this.name)
		const query_data_list = await query_data.find({useMasterKey:true})
		const result = 	query_data_list[0].get(fieldName)
		if (result.length) {
			this.insert_list = result.concat(entityGroup)
		}
		query_data_list[0].set(fieldName,this.insert_list)

		const role_query = new Parse.Query(Parse.Role)
		role_query.startsWith('name', 'Organization')
		role_query.endsWith('name','Organization')
		const role_list = await role_query.find({useMasterKey:true})
		console.log('))))))))))((((((((((((((((((((((((',role_list)
		for (let index = 0; index < role_list.length; index++) {
			const acl = new Parse.ACL()
			if (role_list[index].attributes.name.indexOf('read')) {
				acl.setReadAccess(role_list[index], true)
				entityGroup[index].setACL(acl)
				// entity.save()
				return
			}
			acl.setReadAccess(role_list[index], true)
			acl.setWriteAccess(role_list[index], true)
			entityGroup[index].setACL(acl)
			// entity.save()        
		}
    
	}

	// 向实体组添加成员，创建对应的角色权限，并添加此成员到角色里
	// user: Parse.User，要添加的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	async addMembers(user, permissions = ['read', 'write']) {
		const query_data = new Parse.Query(this.name)
		const organization_result = await query_data.find({useMasterKey:true})

		const obj_role_data = new Parse.Query(Parse.Role)
		obj_role_data.startsWith('name','Organization')
		obj_role_data.endsWith('name','Organization')
		const rol_result = await obj_role_data.find({useMasterKey:true})
		const roleACL = new Parse.ACL()

		if (!rol_result.length) {
			const Role_A = new Parse.Role(`Organization-${organization_result[0].id}-read-user`, roleACL)
			const Role_B = new Parse.Role(`Organization-${organization_result[0].id}-write-user`, roleACL)
			roleACL.setPublicWriteAccess(true)   
			Role_A.getUsers().add(user)   
			Role_B.getUsers().add(user)   
			await  Role_A.save()
			await  Role_B.save()

		}else{
			for (let index = 0; index < rol_result.length; index++) {
				rol_result[i].getUsers().add(user)   
				rol_result[i].save()
			}
		}
	}

	// 删除实体组成员，并在对应的角色权限中删除此成员
	// user: Parse.User，要添加的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	async delMembers(user) {
		const query_data = new Parse.Query(this.name)
		const organization_result = await query_data.find({useMasterKey:true})

		console.log(')))))))))))))))))))))))', organization_result[0].attributes)
		organization_result[0].remove('QE93vtSA8E')
		organization_result[0].save()
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	async setMemberPermission(user, permissions = ['read', 'write']) {


    
	}

	// 授予用户改变角色权限的权限
	// 设置当前实体组相关角色权限记录的ACL，使指定用户能更改该记录
	// user: Parse.User，要授予的用户
	async grantMemberChomdPermission(user) {
		const query_data = new Parse.Query(Parse.Role)
		query_data.startsWith('name',this.name)
		const role_list = await  query_data.find({useMasterKey:true})

		for (let index = 0; index < role_list.length; index++) {
			const acl = new Parse.ACL()
			acl.setReadAccess(user, true)
			acl.setWriteAccess(user, true)  
			role_list[index].setACL(acl)
			role_list[index].save()    
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
