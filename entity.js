/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { Parse } = require('./parse')

let mark = 0
async function recursivelyDelete(realtionResult) {
	const relationObj = realtionResult.attributes
	const keyList = Object.keys(relationObj)
	for (let i = 0; i < keyList.length; i += 1) {
		if (relationObj[keyList[i]] instanceof Parse.Relation) {
			const newRelation = realtionResult.relation(keyList[i])
			const newRealtionResult = await newRelation.query().find({ useMasterKey: true })
			for (let j = 0; j < newRealtionResult.length; j += 1) {
				mark = 0
				await recursivelyDelete(newRealtionResult[j])
			}
			await realtionResult.destroy()
		} else {
			mark += 1
			if (keyList.length === mark) {
				await realtionResult.destroy()
				mark = 0
			}
		}
	}
}

async function createNewRoleName(className, id, permission) {
	if (permission === 'grant') {
		return `${className}__${id}__grant`
	}
	return `${className}__${id}__${permission}__${className}`
}

// 实体组抽象类
class EntityGroup extends Parse.Object {
	static get Permissions() {
		return ['read', 'write']
	}

	async ensurePermissionGrant(roleName) {
		const roleQuery = new Parse.Query(Parse.Role)
		const grantRole = await createNewRoleName(this.className, this.id, 'grant')
		const [grantRoleResult] = await roleQuery.equalTo('name', grantRole).limit(1).find()
		if (!grantRoleResult) {
			const roleACL = new Parse.ACL()
			roleACL.setRoleReadAccess(grantRole, true)
			roleACL.setRoleWriteAccess(grantRole, true)
			const roleGrant = new Parse.Role(grantRole, roleACL)
			await roleGrant.save()
			if (grantRole !== roleName) {
				const newRoleName = new Parse.Role(roleName, roleACL)
				await newRoleName.save()
			}
		} else {
			if (roleName === grantRole) {
				return
			}
			const roleACL = new Parse.ACL()
			roleACL.setRoleReadAccess(grantRole, true)
			roleACL.setRoleWriteAccess(grantRole, true)
			const role = new Parse.Role(roleName, roleACL)
			await role.save()
		}
	}

	async ensureRole(permission, className) {
		const roleQuery = new Parse.Query(Parse.Role)
		let roleName
		if (permission === 'grant') {
			roleName = await createNewRoleName(className, this.id, permission)
		} else {
			roleName = await createNewRoleName(className, this.id, permission)
		}
		await this.ensurePermissionGrant(roleName)
		const [objectRole] = await roleQuery.equalTo('name', roleName).limit(1).find()
		return objectRole
	}

	// 把实体添加到当前实体组的fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async addEntity(fieldName, entity) {
		if (!(entity instanceof Parse.Object)) {
			throw new Error('entity must be Parse.Object type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}

		const relation = this.relation(fieldName)
		relation.add(entity)
		await this.save()
		await this.ensureRole('grant', entity.className)

		const readRole = await this.ensureRole('read', entity.className)
		const writeRole = await this.ensureRole('write', entity.className)

		const roleACL = new Parse.ACL()
		roleACL.setRoleWriteAccess(readRole, true)
		roleACL.setRoleReadAccess(writeRole, true)
		entity.setACL(roleACL)
		await entity.save()
	}

	// 把实体从当前实体组的fieldName数组字段里删除
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async removeEntity(fieldName, entity) {
		if (!(entity instanceof Parse.Object)) {
			throw new Error('entity must be Parse.Object type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}
		const relation = this.relation(fieldName)
		relation.remove(entity)
		await this.save()
	}

	// 把实体组添加到当前实体组fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entityGroup：EntityGroup，实体组
	async addEntityGroup(fieldName, entityGroup) {
		if (!(entityGroup instanceof EntityGroup)) {
			throw new Error('entityGroup must be EntityGroup type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}

		const relation = this.relation(fieldName)
		relation.add(entityGroup)
		await this.save()
		await this.ensureRole('grant', entityGroup.className)

		const currentUser = Parse.User.current()
		await this.ensureRole('grant', entityGroup.className)
		const readRole = await this.ensureRole('read', entityGroup.className)
		const writeRole = await this.ensureRole('write', entityGroup.className)
		readRole.getUsers().add(currentUser)
		writeRole.getUsers().add(currentUser)
		await readRole.save()
		await writeRole.save()

		const roleACLProject = new Parse.ACL()
		roleACLProject.setRoleReadAccess(readRole, true)
		roleACLProject.setRoleWriteAccess(writeRole, true)
		entityGroup.setACL(roleACLProject)
		await entityGroup.save()
	}

	// 把实体组从当前实体组fieldName数组字段里删除，并设置好权限规则
	// 实体组下的资源也会被删除
	// fieldName：String，字段名
	// entityGroup：EntityGroup，实体组
	async removeEntityGroup(fieldName, entityGroup) {
		if (!(entityGroup instanceof EntityGroup)) {
			throw new Error('entityGroup must be EntityGroup type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}
		await recursivelyDelete(entityGroup)
	}

	// 向实体组添加成员，创建对应的角色权限，并添加此成员到角色里
	// user: Parse.User，要添加的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async addMembers(user, withGrant = false) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		const relation = this.relation('members')
		relation.add(user)
		await this.save()

		if (withGrant) {
			const grantResult = await this.ensureRole('grant')
			const withGrantRoleACL = new Parse.ACL()
			withGrantRoleACL.setRoleReadAccess(grantResult, true)
			withGrantRoleACL.setRoleWriteAccess(grantResult, true)
			this.setACL(withGrantRoleACL)
			await this.save()
		}
	}

	// 删除实体组成员，并在对应的角色权限中删除此成员
	// user: Parse.User，要删除的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	async delMembers(user) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		const relation = this.relation('members')
		relation.remove(user)
		await this.save()

		const userRoleQuery = new Parse.Query(Parse.Role)
		const grantRole = await createNewRoleName(this.className, this.id, 'grant')
		const roleArray = EntityGroup.Permission.map((v) => `${this.className}__${this.id}__${v}__${this.className}`)
		roleArray.push(grantRole)
		userRoleQuery.containedIn('name', roleArray)
		const userRoleList = await userRoleQuery.find()

		for (let index = 0; index < userRoleList.length; index += 1) {
			const roleRelation = userRoleList[index].relation('users')
			roleRelation.remove(user)
			const roleAcl = userRoleList[index].getACL()
			roleAcl.setReadAccess(user, false)
			roleAcl.setWriteAccess(user, false)
			userRoleList[index].setACL(roleAcl)
			await userRoleList[index].save()
		}
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async setMemberPermission(user, permissions = EntityGroup.Permissions, withGrant = false) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}

		const roleObj = new Parse.Query(Parse.Role)
		const roleList = permissions.map((v) => `${this.className}__${this.id}__${v}__${this.className}`)
		roleObj.containedIn('name', roleList)
		const result = await roleObj.find()
		for (let index = 0; index < result.length; index += 1) {
			result[index].getUsers().add(user)
			await result[index].save()
		}

		if (withGrant) {
			roleObj.containedIn('name', [`${this.Organization}__${this.id}__grant`])
			const [withGrantResult] = await roleObj.find()
			withGrantResult.getUsers().add(user)
			await withGrantResult.save()
		}
	}
}

module.exports = {
	// 用户要创建自己的业务实体组，可以通过继承这个类
	EntityGroup,
}
