/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { Parse } = require('./parse')
// 不能有重复代码 不能有重复逻辑 只查询一条数据的SQL逻辑简化 递归尽量简化 测试用例要全面,最好多个用户一起测试
async function recursivelyDelete(realtionResult) {
	const relationObj = realtionResult.attributes
	const keyList = Object.keys(relationObj)
	for (let i = 0; i < keyList.length; i += 1) {
		if (relationObj[keyList[i]] instanceof Parse.Relation) {
			const newRelation = realtionResult.relation(keyList[i])
			const newRealtionResult = await newRelation.query().find()
			for (let j = 0; j < newRealtionResult.length; j += 1) {
				await recursivelyDelete(newRealtionResult[j])
			}
			await realtionResult.destroy()
			return
		}
	}
	await realtionResult.destroy()
}

async function recursivelyFind(realtionResult) {
	const relationObj = realtionResult.get('parents')
	if (!relationObj) {
		return realtionResult
	}
	const queryResult = await new Parse.Query(relationObj.className).equalTo('id', relationObj.className.id).first()
	if (queryResult && queryResult.get('parents')) {
		const result = await recursivelyFind(queryResult.get('parents'))
		if (result) {
			return result
		}
	} else {
		return queryResult
	}
	return null
}
// 创建角色名称的规则 实体组名称__实体组id__权限名称__实体名
function createNewRoleName(entityGroupClassName, entityGroupId, permission, entityClassName) {
	if (entityClassName) {
		return [entityGroupClassName, entityGroupId, permission, entityClassName].join('__')
	}
	return [entityGroupClassName, entityGroupId, permission].join('__')
}
// 实体组抽象类
class EntityGroup extends Parse.Object {
	static get Permissions() {
		return ['read', 'write']
	}

	async ensurePermissionGrant() {
		// ensurePermissionGrant 只用来验证grant权限是否存在，不存在则自动创建,创建的时候把当前用户添加到grant角色
		const roleQuery = new Parse.Query(Parse.Role)
		const grantRole = createNewRoleName(this.className, this.id, 'grant')
		const grantRoleResult = await roleQuery.equalTo('name', grantRole).first()

		if (!grantRoleResult) {
			const currentUser = Parse.User.current()
			const roleACL = new Parse.ACL()
			roleACL.setRoleReadAccess(grantRole, true)
			roleACL.setRoleWriteAccess(grantRole, true)
			// 创建grant规则的用户拥有可以读写grant角色的权限，同时把用户加到grant角色下
			roleACL.setReadAccess(currentUser, true)
			roleACL.setWriteAccess(currentUser, true)
			const roleGrant = new Parse.Role(grantRole, roleACL)
			roleGrant.getUsers().add(currentUser)
			await roleGrant.save()
			return roleGrant
		}
		return grantRoleResult
	}

	async ensureRole(permission, className) {
		// 返回我们需要的权限对象，不存在则创建后再返回
		const roleQuery = new Parse.Query(Parse.Role)
		let roleName
		if (permission === 'grant') {
			roleName = createNewRoleName(className, this.id, permission)
		} else {
			roleName = createNewRoleName(this.className, this.id, permission, className)
		}
		await this.ensurePermissionGrant()
		const Role = await roleQuery.equalTo('name', roleName).first()
		// 当传入的permission 是read或者write时且roleName不存在的时候就自动创建再返回该角色名对象,同时把当前用户的信息添加到该角色
		if (!Role) {
			const currentUser = Parse.User.current()
			const grantRoleName = createNewRoleName(this.className, this.id, 'grant')
			const roleACL = new Parse.ACL()
			// 对当前roleName角色设置ACl权限为grantRoleName
			roleACL.setRoleReadAccess(grantRoleName, true)
			roleACL.setRoleWriteAccess(grantRoleName, true)
			const role = new Parse.Role(roleName, roleACL)
			role.getUsers().add(currentUser)
			await role.save()
			return role
		}
		return Role
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
		// 建立实体与实体组的关系
		const relation = this.relation(fieldName)
		relation.add(entity)
		await this.save()
		// 记录实体的父实体组
		entity.set('parents', this)
		await entity.save()
	}

	// 把实体从当前实体组的fieldName数组字段里删除
	// fieldName：String，字段名 entity：Parse.Object，实体
	async removeEntity(fieldName, entity) {
		if (!(entity instanceof Parse.Object)) {
			throw new Error('entity must be Parse.Object type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}
		const relation = this.relation(fieldName)
		relation.remove(entity)
		// 清空父实体信息
		entity.unset('parents')
		await entity.save()
		await this.save()
	}

	// 把实体组添加到当前实体组fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名 entityGroup：EntityGroup，实体组
	async addEntityGroup(fieldName, entityGroup) {
		if (!(entityGroup instanceof EntityGroup)) {
			throw new Error('entityGroup must be EntityGroup type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}
		// 建立实体与实体组的关系
		const relation = this.relation(fieldName)
		relation.add(entityGroup)
		await this.save()
		// 在这里把entityGroup对象和this的父子关系添加到entityGroup对象的parents字段
		entityGroup.set('parents', this)
		await entityGroup.save()
	}

	// 把实体组从当前实体组fieldName数组字段里删除，并设置好权限规则 实体组下的资源也会被删除
	// fieldName：String，字段名 entityGroup：EntityGroup，实体组
	async removeEntityGroup(fieldName, entityGroup) {
		if (!(entityGroup instanceof EntityGroup)) {
			throw new Error('entityGroup must be EntityGroup type')
		}
		if (typeof fieldName !== 'string') {
			throw new Error('fieldName must be String type')
		}
		// 清空父实体信息
		entityGroup.unset('parents')
		await entityGroup.save()
		await recursivelyDelete(entityGroup)
	}

	async changeGrantRole(roleObj, user) {
		const grantRoleName = createNewRoleName(this.className, this.id, 'grant')
		const withGrantResult = await roleObj.equalTo('name', grantRoleName).first()
		const withGrantACL = withGrantResult.getACL()
		withGrantACL.setReadAccess(user, true)
		withGrantACL.setWriteAccess(user, true)
		withGrantResult.getUsers().add(user)
		await withGrantResult.save()
	}

	// 向实体组添加成员，创建对应的角色权限，并添加此成员到角色里
	// user: Parse.User，要添加的用户 permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async addMembers(user, withGrant = false) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		// 建立当前实体组和user的relation关系
		const relation = this.relation('members')
		relation.add(user)
		await this.save()
		const originalParents = await recursivelyFind(this)
		const readRoleName = createNewRoleName(originalParents.className, originalParents.id, 'read', this.className)
		const writeRoleName = createNewRoleName(originalParents.className, originalParents.id, 'write', this.className)

		const readRoleObj = await new Parse.Query(Parse.Role).equalTo('name', readRoleName).first()
		const writeRoleObj = await new Parse.Query(Parse.Role).equalTo('name', writeRoleName).first()
		readRoleObj.getUsers().add(user)
		writeRoleObj.getUsers().add(user)
		readRoleObj.save()
		writeRoleObj.save()
		if (withGrant) {
			// 如果withGrant为true就把用户添加到grant角色下以及可以读写grant权限
			const roleObj = new Parse.Query(Parse.Role)
			await this.changeGrantRole(roleObj, user)
		}
	}

	// 删除实体组成员，并在对应的角色权限中删除此成员
	// user: Parse.User，要删除的用户 permissions：Array<String>，该用户在当前实体拥有的权限
	async delMembers(user) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		// 解除user与实体组之间的relation关系
		const relation = this.relation('members')
		relation.remove(user)
		await this.save()
		const grantRole = createNewRoleName(this.className, this.id, 'grant')
		const roleArray = EntityGroup.Permissions.map((v) => createNewRoleName(this.className, this.id,
			v, this.className))
		const userRoleList = await new Parse.Query(Parse.Role).containedIn('name', [...roleArray, grantRole]).find()
		for (let index = 0; index < userRoleList.length; index += 1) {
			// 创建某个角色的时候会把当时的用户添加到角色下并把relation关系存在在Role表的users字段中
			userRoleList[index].relation('users').remove(user)
			const roleAcl = userRoleList[index].getACL()
			// 拿到当前角色的ACl，然后判断该ALC中是否包含这个用户id，如果包含就禁止用户读写该角色
			if (roleAcl.permissionsById[user.id]) {
				roleAcl.setReadAccess(user, false)
				roleAcl.setWriteAccess(user, false)
				userRoleList[index].setACL(roleAcl)
			}
			await userRoleList[index].save()
		}
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户  permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async setMemberPermission(user, withGrant = false, permissions = EntityGroup.Permissions) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		const originalParents = await recursivelyFind(this)
		const roleObj = new Parse.Query(Parse.Role)
		const roleList = permissions.map((v) => createNewRoleName(originalParents.className,
			originalParents.id, v, this.className))
		const result = await roleObj.containedIn('name', roleList).find()
		if (permissions.length > 1) {
			for (let index = 0; index < result.length; index += 1) {
				result[index].getUsers().add(user)
				await result[index].save()
			}
		} else if (permissions.indexOf('read')) {
			for (let index = 0; index < result.length; index += 1) {
				const resultattributes = result[index].attributes
				if (resultattributes.name.indexOf('read')) {
					result[index].getUsers().add(user)
					await result[index].save()
				} else {
					result[index].relation().remove(user)
				}
				await result[index].save()
			}
		} else if (permissions.indexOf('write')) {
			for (let index = 0; index < result.length; index += 1) {
				const resultattributes = result[index].attributes
				if (resultattributes.name.indexOf('write')) {
					result[index].getUsers().add(user)
					await result[index].save()
				} else {
					result[index].relation().remove(user)
				}
				await result[index].save()
			}
		}
		if (withGrant) {
			await this.changeGrantRole(roleObj, user)
		}
	}
}

module.exports = {
	// 用户要创建自己的业务实体组，可以通过继承这个类
	EntityGroup,
	createNewRoleName,
}
