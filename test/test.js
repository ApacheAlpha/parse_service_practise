const { ACL } = require('parse')
const { Parse } = require('./parse')


class EntityGroup extends Parse.Object {
	async delMembers(user) {

	}

class Organization extends EntityGroup {
	addProject(project) {
		return super.addEntityGroup('projects', project)
	}
}


async function test() {
	const query_data = new Parse.Query('Organization')
	const organization_result = await query_data.find({ useMasterKey: true })
	// console.log(')))))))))))))))))))))))', organization_result[0].attributes)

	const user_data = new Parse.Query(Parse.User)
	const user_result = await user_data.find({ useMasterKey: true })
	console.log(')))))))))))))))))))))))', user_result)

	// const relation = organization_result[0].relation('numbers')
	// relation.add(user_result[1])
	// organization_result[0].save()
	// relation.remove(user_result[0])
	// organization_result[0].save()

	// const acl = new Parse.ACL()
	const acl = organization_result[0].getACL()
	console.log(')))))))))))))))))))))))', acl)
	acl.setReadAccess(user_result[0], false)
	acl.setWriteAccess(user_result[0], false)
	organization_result[0].setACL(acl)
	organization_result[0].save()


}
test()

	// 把实体添加到当前实体组的fieldName数组字段里，并设置好权限规则
	// fieldName：String，字段名
	// entity：Parse.Object，实体
	async addEntity(fieldName, entity) {
		if (typeof entity !== 'object' || !fieldName) {
			console.log('typeof error:entity need a object or fieldName Must be entered')
			return
		}

		try {
			const query_data = new Parse.Query(this.name)
			const query_data_list = await query_data.find({ useMasterKey: true })

			const relation = organization_result[0].relation('numbers')
			relation.add(entity)
			organization_result[0].save()



			// const result = query_data_list[0].get(fieldName)
			// if (result.length) {
			// 	result.push(entity)
			// }
			// query_data_list[0].set(fieldName, result)

			// // await query_data_list[0].save()
			// const role_query = new Parse.Query(Parse.Role)
			// role_query.startsWith('name', 'Organization')
			// role_query.endsWith('name', 'Organization')
			// const role_list = await role_query.find({ useMasterKey: true })

			// for (let index = 0; index < role_list.length; index++) {
			// 	const acl = new Parse.ACL()
			// 	if (role_list[index].attributes.name.indexOf('read')) {
			// 		acl.setReadAccess(role_list[index], true)
			// 		entity.setACL(acl)
			// 		// entity.save()
			// 		return
			// 	}
			// 	acl.setReadAccess(role_list[index], true)
			// 	acl.setWriteAccess(role_list[index], true)
			// 	entity.setACL(acl)
			// entity.save()        
			// }
		} catch (error) {
			console.log('addEntity error: ', error)
		}
	}

	async addEntityGroup(fieldName, entityGroup) {
		if (typeof entityGroup !== 'object' || !fieldName || !entityGroup.length) {
			console.log('typeof error:entity need a ( object or array) or fieldName Must be entered')
			return
		}
		const query_data = new Parse.Query(this.name)
		const query_data_list = await query_data.find({ useMasterKey: true })
		if (!query_data_list.length) {
			console.log(`${this.name} The length of the list cannot be zero`)
			return
		}
		const result = query_data_list[0].get(fieldName)
		if (result.length) {
			this.insert_list = result.concat(entityGroup)
		}
		query_data_list[0].set(fieldName, this.insert_list)

		// const role_query = new Parse.Query(Parse.Role)
		// role_query.startsWith('name', 'Organization')
		// role_query.endsWith('name', 'Organization')
		// const role_list = await role_query.find({ useMasterKey: true })
		// for (let index = 0; index < role_list.length; index++) {
		// 	const acl = new Parse.ACL()
		// 	if (role_list[index].attributes.name.indexOf('read')) {
		// 		acl.setReadAccess(role_list[index], true)
		// 		entityGroup[index].setACL(acl)
		// 		// entity.save()
		// 		return
		// 	}
		// 	acl.setReadAccess(role_list[index], true)
		// 	acl.setWriteAccess(role_list[index], true)
		// 	entityGroup[index].setACL(acl)
		// 	// entity.save()        
		// }

	}
// async function test() {
// 	const EntityGroup_obj = new Parse.EntityGroup()
// 	const UUU = await EntityGroup_obj.addEntity('')
// 	UUU.save()
// }

// Parse.Object.registerSubclass('Organization', Organization)
// Parse.Object.registerSubclass('EntityGroup', EntityGroup);

