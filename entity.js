/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
const _ = require('lodash')
const { Parse } = require('./parse')

async function recursivelyDelete(realtionResult) {
	const relationattributes = realtionResult.attributes
	const keyList = Object.keys(relationattributes)
	for (let i = 0; i < keyList.length; i += 1) {
		if (relationattributes[keyList[i]] instanceof Parse.Relation) {
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
	const getParent = realtionResult.get('parent')
	if (!getParent) {
		return realtionResult
	}
	const queryResult = await new Parse.Query(getParent.className).equalTo('id', getParent.className.id).first()
	if (!queryResult.get('parent')) {
		return queryResult
	}
	const result = await recursivelyFind(queryResult)
	return result
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

	async setACLAndAddUserToRole(parent, roleName, permission) {
		const grantRoleName = createNewRoleName(parent.className, parent.id, 'grant')
		const currentUser = Parse.User.current()
		const roleACL = new Parse.ACL()
		roleACL.setRoleReadAccess(grantRoleName, true)
		roleACL.setRoleWriteAccess(grantRoleName, true)
		let roleObj
		if (permission === 'grant') {
			roleACL.setReadAccess(currentUser, true)
			roleACL.setWriteAccess(currentUser, true)
			roleObj = new Parse.Role(grantRoleName, roleACL)
		} else {
			roleObj = new Parse.Role(roleName, roleACL)
		}
		roleObj.getUsers().add(currentUser)
		await roleObj.save()
		return roleObj
	}

	async ensurePermissionGrant() {
		// ensurePermissionGrant 只用来验证grant权限是否存在，不存在则自动创建,创建的时候把当前用户添加到grant角色
		const parent = await recursivelyFind(this)
		const grantRole = createNewRoleName(parent.className, parent.id, 'grant')
		let grantRoleObj
		grantRoleObj = await new Parse.Query(Parse.Role).equalTo('name', grantRole).first()
		if (!grantRoleObj) {
			grantRoleObj = await this.setACLAndAddUserToRole(parent, null, 'grant')
		}
		return grantRoleObj
	}

	async ensureRole(permission, className) {
		// 返回我们需要的权限对象，不存在则创建后再返回
		let Role
		if (permission === 'grant') {
			Role = await this.ensurePermissionGrant()
			return Role
		}
		const roleName = createNewRoleName(this.className, this.id, permission, className)
		Role = await new Parse.Query(Parse.Role).equalTo('name', roleName).first()
		// 当传入的permission 是read或者write时且roleName不存在的时候就自动创建再返回该角色名对象,同时把当前用户的信息添加到该角色
		if (!Role) {
			const parent = await recursivelyFind(this)
			Role = await this.setACLAndAddUserToRole(parent, roleName)
			return Role
		}
		return Role
	}

	// 把实体添加到当前实体组的fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名  entity：Parse.Object，实体
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
		entity.set('parent', this)
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
		entity.unset('parent')
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
		const relation = this.relation(fieldName)
		relation.add(entityGroup)
		await this.save()
		entityGroup.set('parent', this)
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
		entityGroup.unset('parent')
		await entityGroup.save()
		await recursivelyDelete(entityGroup)
	}

	async changeGrantRoleAcl(user) {
		const grantRole = this.ensureRole('grant')
		const grantACL = grantRole.getACL()
		grantACL.setReadAccess(user, true)
		grantACL.setWriteAccess(user, true)
		grantRole.getUsers().add(user)
		await grantRole.save()
	}

	// 向实体组添加成员，创建对应的角色权限，并添加此成员到角色里
	// user: Parse.User，要添加的用户 permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async addMembers(user, withGrant = false) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		this.relation('members').add(user)
		await this.save()
		const originalParent = await recursivelyFind(this)
		const readRoleName = createNewRoleName(originalParent.className, originalParent.id, 'read', this.className)
		const writeRoleName = createNewRoleName(originalParent.className, originalParent.id, 'write', this.className)
		const RoleList = await new Parse.Query(Parse.Role).containedIn('name', [readRoleName, writeRoleName]).find()

		for (let index = 0; index < RoleList.length; index += 1) {
			RoleList[index].getUsers().add(user)
			await RoleList[index].save()
		}
		if (withGrant && !originalParent) {
			await this.changeGrantRoleAcl(user)
		}
	}

	// 删除实体组成员，并在对应的角色权限中删除此成员
	// user: Parse.User，要删除的用户 permissions：Array<String>，该用户在当前实体拥有的权限
	async delMembers(user) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		this.relation('members').remove(user)
		await this.save()
		const grantRole = createNewRoleName(this.className, this.id, 'grant')
		const roleArray = EntityGroup.Permissions.map((v) => createNewRoleName(this.className, this.id,
			v, this.className))
		const userRoleList = await new Parse.Query(Parse.Role).containedIn('name', [...roleArray, grantRole]).equalTo('users', user).find()
		for (let index = 0; index < userRoleList.length; index += 1) {
			// 创建某个角色的时候会把当时的用户添加到角色下并把relation关系存在在Role表的users字段中
			if (userRoleList[index].attributes.name.indexOf('grant') !== -1) {
				const roleAcl = userRoleList[index].getACL()
				// 拿到当前角色的ACl,禁止用户读写该角色
				roleAcl.setReadAccess(user, false)
				roleAcl.setWriteAccess(user, false)
				userRoleList[index].setACL(roleAcl)
			}
			userRoleList[index].relation('users').remove(user)
			await userRoleList[index].save()
		}
	}

	async addUserToRole(roleNameList, user) {
		const findRoleResult = await new Parse.Query(Parse.Role).containedIn('name', roleNameList).find()
		for (let index = 0; index < findRoleResult.length; index += 1) {
			findRoleResult[index].getUsers().add(user)
			await findRoleResult[index].save()
		}
	}

	// 改变某实体组成员的权限
	// user: Parse.User，要改变的用户  permissions：Array<String>，该用户在当前实体拥有的权限
	// withGrant: 是否分配权限控制权限，子实体组此参数不能为true
	async setMemberPermission(user, withGrant = false, permissions = EntityGroup.Permissions) {
		if (!(user instanceof Parse.Object)) {
			throw new Error('user must be Parse.Object type')
		}
		const originalParent = await recursivelyFind(this)
		const roleList = permissions.map((v) => createNewRoleName(originalParent.className,
			originalParent.id, v, this.className))
		// 找到该用户所属的角色
		const findResult = await new Parse.Query(Parse.Role).containedIn('name', roleList).equalTo('users', user).find()
		const findResultRoleName = _.map(findResult, (v) => (v.attributes.name))
		// 获取用户不存在的角色，例如;roleList包含[read,write],实际上findResult只包含[read],xorWithResult就是[write]
		const xorWithResult = _.xorWith(roleList, findResultRoleName)
		if (findResult.length) {
			for (let index = 0; index < findResult.length; index += 1) {
				findResult[index].relation('users').remove(user)
				await findResult[index].save()
			}
		} else {
			// 如果用户没有分配角色，就把用户添加到角色下
			await this.addUserToRole(roleList, user)
		}
		// 如果用户不存在某个角色下，在这里把用户添加进去
		if (xorWithResult.length && findResult.length) {
			await this.addUserToRole(xorWithResult, user)
		}
		if (withGrant && !originalParent) {
			await this.changeGrantRoleAcl(user)
		}
	}
}

module.exports = {
	// 用户要创建自己的业务实体组，可以通过继承这个类
	EntityGroup,
}
