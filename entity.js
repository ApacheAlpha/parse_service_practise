/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { Parse } = require('./parse')

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
	const [queryResult] = await new Parse.Query(relationObj.className).equalTo('id', relationObj.className.id).limit(1).find()
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
		// ensurePermissionGrant 只用来验证grant权限是否存在，不存在则自动创建,创建的时候把当前用户添加到gramt角色
		const roleQuery = new Parse.Query(Parse.Role)
		const grantRole = createNewRoleName(this.className, this.id, 'grant')
		const [grantRoleResult] = await roleQuery.equalTo('name', grantRole).limit(1).find()

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

		const [Role] = await roleQuery.equalTo('name', roleName).limit(1).find()
		const currentUser = Parse.User.current()

		// 当传入的permission 是read或者write时且roleName不存在的时候就自动创建再返回该角色名对象
		// 同时把当前用户的信息添加到该角色
		if (!Role) {
			const grantRoleName = createNewRoleName(this.className, this.id, 'grant')
			const roleACL = new Parse.ACL()
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

		createNewRoleName(this.className, this.id, 'grant')
		const relation = this.relation(fieldName)
		relation.add(entity)
		await this.save()
		await this.ensureRole('grant', this.className)

		const readRole = await this.ensureRole('read', entity.className)
		const writeRole = await this.ensureRole('write', entity.className)
		// 创建实体组的读写角色
		const entityGroupReadRolw = await this.ensureRole('read', this.className)
		const entityGroupwriteRolw = await this.ensureRole('write', this.className)
		const entityGroupAcl = this.getACL()
		// 把当前实体组对象的ACl设置为实体组的角色
		entityGroupAcl.setRoleReadAccess(entityGroupReadRolw, true)
		entityGroupAcl.setRoleReadAccess(entityGroupwriteRolw, true)
		entityGroupAcl.setRoleWriteAccess(entityGroupwriteRolw, true)
		this.setACL(entityGroupAcl)
		await this.save()

		// 获取当前entity的ACl,并设置ACL权限
		const entityACL = entity.getACL()
		entityACL.setRoleReadAccess(readRole, true)
		entityACL.setRoleWriteAccess(writeRole, true)
		// 可以写前提可以读，所以writeRole角色下加上setRoleReadAccess权限
		entityACL.setRoleReadAccess(writeRole, true)
		entity.setACL(entityACL)
		// 记录这个实体的父实体
		entity.set('parents', this)
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
		// 清空父实体信息
		entity.unset('parents')
		await entity.save()

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
		await this.ensureRole('grant', this.className)

		// 在这里把entityGroup对象和this的父子关系添加到entityGroup对象的parents字段
		entityGroup.set('parents', this)
		// 创建父项目组的角色权限
		const thisentityGroupReadRole = await this.ensureRole('read', this.className)
		const thisentityGroupwriteRole = await this.ensureRole('write', this.className)

		const thisentityGroup = this.getACL()
		thisentityGroup.setRoleReadAccess(thisentityGroupReadRole, true)
		thisentityGroup.setRoleReadAccess(thisentityGroupwriteRole, true)
		thisentityGroup.setRoleWriteAccess(thisentityGroupwriteRole, true)
		this.setACL(thisentityGroup)
		await this.save()

		const readRole = await this.ensureRole('read', entityGroup.className)
		const writeRole = await this.ensureRole('write', entityGroup.className)

		const entityGroupAcl = entityGroup.getACL()
		entityGroupAcl.setRoleReadAccess(readRole, true)
		// 可以写前提可以读，所以writeRole角色下加上setRoleReadAccess权限
		entityGroupAcl.setRoleReadAccess(writeRole, true)
		entityGroupAcl.setRoleWriteAccess(writeRole, true)
		entityGroup.setACL(entityGroupAcl)
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
		// 清空父实体信息
		entityGroup.unset('parents')
		await entityGroup.save()
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
		// 建立当前实体组和user的relation关系
		const relation = this.relation('members')
		relation.add(user)
		await this.save()

		if (withGrant) {
			// 如果withGrant为true就把用户添加到grant角色下以及可以读写grant权限
			const roleObj = new Parse.Query(Parse.Role)
			const grantRoleName = createNewRoleName(this.className, this.id, 'grant')
			const [withGrantResult] = await roleObj.equalTo('name', grantRoleName).limit(1).find()
			const withGrantACL = withGrantResult.getACL()
			withGrantACL.setReadAccess(user, true)
			withGrantACL.setWriteAccess(user, true)
			withGrantResult.getUsers().add(user)
			await withGrantResult.save()
		}
	}

	// 删除实体组成员，并在对应的角色权限中删除此成员
	// user: Parse.User，要删除的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	async delMembers(user) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		// 解除user与实体组之间的relation关系
		const relation = this.relation('members')
		relation.remove(user)
		await this.save()

		const grantRole = createNewRoleName(this.className, this.id, 'grant')
		const roleArray = EntityGroup.Permissions.map((v) => {
			const roleName = createNewRoleName(this.className, this.id, v, this.className)
			return roleName
		})
		const userRoleList = await new Parse.Query(Parse.Role).containedIn('name', [...roleArray, grantRole]).find()
		for (let index = 0; index < userRoleList.length; index += 1) {
			// 因为创建某个角色的时候会把当时的用户添加到角色下
			// 并以relation关系存在在Role表的users字段中，所以这里要先移除关系
			const roleRelation = userRoleList[index].relation('users')
			roleRelation.remove(user)
			const roleAcl = userRoleList[index].getACL()
			// 拿到当前角色的ACl，然后判断该ALC中是否包含这个用户id，如果包含就禁止用户读写该角色
			if (roleAcl.permissionsById[user.id]) {
				roleAcl.setReadAccess(user, false)
				roleAcl.setWriteAccess(user, false)
				userRoleList[index].setACL(roleAcl)
				await userRoleList[index].save()
			}
		}
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户
	// permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async setMemberPermission(user, withGrant = false, permissions = EntityGroup.Permissions) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}

		const originalParents = await recursivelyFind(this)

		const roleObj = new Parse.Query(Parse.Role)
		const roleList = permissions.map((v) => {
			const roleName = createNewRoleName(originalParents.className, originalParents.id,
				v, this.className)
			return roleName
		})

		const result = await roleObj.containedIn('name', roleList).find()
		for (let index = 0; index < result.length; index += 1) {
			result[index].getUsers().add(user)
			await result[index].save()
		}

		if (withGrant) {
			const grantRoleName = createNewRoleName(this.className, this.id, 'grant')
			const [withGrantResult] = await roleObj.equalTo('name', grantRoleName).find()
			const withGrantACL = withGrantResult.getACL()
			withGrantACL.setReadAccess(user, true)
			withGrantACL.setWriteAccess(user, true)
			withGrantResult.getUsers().add(user)
			await withGrantResult.save()
		}
	}
}

module.exports = {
	// 用户要创建自己的业务实体组，可以通过继承这个类
	EntityGroup,
}
