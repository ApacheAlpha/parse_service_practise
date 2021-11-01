const entity = require('../entity')
const { Parse } = require('./parse')


class organization extends entity.EntityGroup {
	constructor() {
		super()
		this.organization = null
	}

	addProject(project) {
		return super.addEntityGroup('project', project)
	}

	addMembers(user) {
		return super.addMembers(user, permissions = ['read', 'write'])
	}

	grantMemberChomdPermission(user) {
	 return super.grantMemberChomdPermission(user)
	}

}

// class Project extends Parse.EntityGroup {
// 	addDevice(device) {
// 	  return super.addEntity('devices', device)
// 	}
// }

async function test() {
	const org = new organization()
	const Project_obj = new Parse.Object('Project')
	Project_obj.set('Project_name','测试000')
	Project_obj.set('Project_address','测试0001')
	// await Project_obj.save()

	const organization_query = new Parse.Query('organization')
	const organization_list = await organization_query.find({ useMasterKey: true })
	org.organization = organization_list[0]
	// org.addProject(Project_obj)


	const user_query = new Parse.Query(Parse.User)
	const user_list = await user_query.find({ useMasterKey: true })
	// org.addMembers(user_list[0])

	org.grantMemberChomdPermission(user_list[0])



	// const relation = organization_list[0].relation('LLLLLL')
	// relation.add(Project_obj)
	// organization_list[0].save()

	// const Project_query = new Parse.Query('Project')
	// const Project_query = new Parse.Query(Parse.Role)

	// const Project_list = await Project_query.find({ useMasterKey: true })
	// console.log('-------Project_list--',Project_list)
	// console.log('-------Project_list--',await Project_list[1].getACL())
	

}

test()


async function test_addProject() {
	const org = new organization()
	const Project_obj = new Parse.Object('Project')
	Project_obj.set('Project_name','测试000')
	Project_obj.set('Project_address','测试0001')
	await Project_obj.save()

	const organization_query = new Parse.Query('organization')
	const organization_list = await organization_query.find({ useMasterKey: true })
	org.organization = organization_list[0]
	org.addProject(Project_obj)
}

