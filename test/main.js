const entity = require('../entity')
const { Parse } = require('./parse')


// class organization extends entity.EntityGroup {
// 	constructor() {
// 		super()
// 		this.organization = null
// 	}

// 	addProject(project) {
// 		return super.addEntityGroup('projects', project)
// 	}

// 	addEntity(entity) {
// 		return super.addEntity('projets', entity)
// 	}


// 	addMembers(user) {
// 		return super.addMembers(user, permissions = ['read', 'write'])
// 	}

// 	removeEntityGroup(entityGroup) {
// 		return super.removeEntityGroup('projects', entityGroup)
// 	}

// }

// class Project extends Parse.EntityGroup {
// 	addDevice(device) {
// 	  return super.addEntity('devices', device)
// 	}

// }

async function test() {
	// console.log('))))))))))', org_id)
	// console.log('))))))))))', EntityGroup.Permissions)

	// const org = new organization()
	// const Project_obj = new Parse.Object('Project')
	// Project_obj.set('Project_name', '测试000')
	// Project_obj.set('Project_address', '测试0001')
	// // await Project_obj.save()

	// const org = new organization()
	// const Project_obj = new Parse.Object('Project')
	// Project_obj.set('Project_name', '测试000')
	// Project_obj.set('Project_address', '测试0001')
	// // await Project_obj.save()

	// const organization_query = new Parse.Query('organization')
	// const organization_list = await organization_query.find({ useMasterKey: true })
	// org.organization = organization_list[0]
	// org.addProject(Project_obj)

	// const user_query = new Parse.Query(Parse.User)
	// const user_list = await user_query.find({ useMasterKey: true })
	// org.addMembers(user_list[0])

	// org.grantMemberChomdPermission(user_list[0])

	// const relation = organization_list[0].relation('LLLLLL')
	// relation.add(Project_obj)
	// organization_list[0].save()

	// const org_id = '001'
	// const query_data = new Parse.Query(Parse.Role)
	// query_data.containedIn('name', [`Organization.${org_id}.read`, `Organization.${org_id}.write`, `Organization.${org_id}.grant`])
	// const query_data_list = await query_data.find({ useMasterKey: true })
	// console.log('LLLLLLLLLLLLLLLL', query_data_list)
	// console.log('LLLLLLLLLLLLLLLL', query_data_list[0].get('name'))

	// const org = new organization()
	// const inv_obj = new Parse.Object('inv')
	// inv_obj.set('inv_name', '测试000')
	// await inv_obj.save()

	// const organization_query = new Parse.Query('Organization')
	// const organization_list = await organization_query.find({ useMasterKey: true })
	// console.log('LLLLLLLLLLLLLLLL', organization_list)
	// org.organization = organization_list[0]
	// org.addEntity(inv_obj)

	// Organization__8CmJyfFubz__read__Organization
	// Organization__8CmJyfFubz__write__Organization
	// Organization__8CmJyfFubz__grant

	// const role_list = new Parse.Query('Project')
	// const result = await role_list.find({useMasterKey:true})
	// console.log('))))))))234)))))))))',result[0])



	// const Project1 = new Parse.Query('Project1')
	// const Project1_result =await Project1.find({useMasterKey:true})
	// console.log('Project1_resultProject1_result',Project1_result)

	// const Project1 = new Parse.Object('Project')
	// Project1.set('Project_name','uuuuuuu')
	// Project1.set('Project_address','KKKKKKKKKKK')
	// await Project1.save()

	// const [project] =await new Parse.Query('Project').find()
	// console.log('))))))77777)234234))))))))))', project)
	// const [device] =await new Parse.Query('device').find()
	// console.log('))))))77777)2))))))))))',device)
	// project.relation('devices').add(device)
	// await project.save()


	const Project_query = new Parse.Query('Project')
	const result = await Project_query.find()
	console.log('))))))))0))))))))', result)

	const user_query = new Parse.Query(Parse.User)
	const user_result = await user_query.find()
	console.log('))))))))1))))))))', user_result)


	// const acl = new Parse.ACL()
	// acl.setReadAccess(result, true)
	// acl.setWriteAccess(result, true)

	// const relation = result[0].relation('devices')
	// const DDD =await relation.query().find({useMasterKey:true})
	// console.log(')))))))))23123123))))))))',DDD)

	// result[0].remove()




}
test()


// async function test_addProject() {
// 	const org = new organization()
// 	const Project_obj = new Parse.Object('Project')
// 	Project_obj.set('Project_name', '测试000')
// 	Project_obj.set('Project_address', '测试0001')
// 	await Project_obj.save()

// 	const organization_query = new Parse.Query('organization')
// 	const organization_list = await organization_query.find({ useMasterKey: true })
// 	org.organization = organization_list[0]
// 	org.addProject(Project_obj)
// }
// // test_addProject()

// async function test_addEntity() {
// 	const org = new organization()
// 	const inv_obj = new Parse.Object('inventory')
// 	inv_obj.set('sn', '测试000')
// 	await inv_obj.save()

// 	const organization_query = new Parse.Query('organization')
// 	const organization_list = await organization_query.find({ useMasterKey: true })
// 	org.organization = organization_list[0]
// 	org.addEntity(inv_obj)
// }

// async function removeEntityGroup() {
// 	const org = new organization()
// 	const Project_query = new Parse.Query('Project')
// 	const Project_list = await Project_query.find({ useMasterKey: true })
// 	org.removeEntityGroup(Project_list[0])

// }
// // removeEntityGroup()
