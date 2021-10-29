const entity =  require('./entity')
const {Parse} = require('./parse')


class organization extends  entity.EntityGroup{
	constructor(){
		super()
	}

	// addinv(resource_data){
	// 	return super.addEntity('resource', resource_data)
	// }
	addProject(project) {
		return super.addEntityGroup('project', project)
	}
	addnumber(user){
		return super.addMembers(user)
	}


}

const new_organization = new organization()

async  function test() {
	// const query_data = new Parse.Query('inventory')
	// const resource_data =await query_data.find({useMasterKey:true})
	// const result = new_organization.addinv(resource_data[2])
	// result.save()

	// const query_data = new Parse.Query('Project')
	// const resource_data =await query_data.find({useMasterKey:true})
	// console.log(')))))))))))))))))))))',resource_data.slice(2))
	// const result = new_organization.addProject(resource_data.slice(2))
	// result.save()

	// const user_data = new Parse.Query(Parse.User)
	// const resource_data =await user_data.find({useMasterKey:true})
	// // console.log(')))))))))))))))))))))',resource_data)
	// const result = await new_organization.addnumber(resource_data.slice(2))
	// // console.log(':LLLLLLLLLLLLLLLLLLLLLLLL',result)
	// // result.save()


	const user_data = new Parse.Query(Parse.User)
	const resource_data =await user_data.find({useMasterKey:true})
	// console.log(')))))))))))))))))))))',resource_data)
	const result = await new_organization.delMembers(resource_data.slice(2))
	// console.log(':LLLLLLLLLLLLLLLLLLLLLLLL',result)
	// result.save()




}

test()