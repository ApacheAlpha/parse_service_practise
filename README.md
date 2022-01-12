# parse_service_practise.md

## 该parse service SDK本人练习随手所写，请勿直接带入生产或测试环境一共包含一个实体组抽象类EntityGroup和多个类方法，详细代码在名称为entity的js文件中
&nbsp;
[测试文件链接地址](https://github.com/ApacheAlpha/parse_service_practise/blob/new_third/test.js)
### 实体组和实体的关系图
&nbsp;
[![IDulZ9.png](https://z3.ax1x.com/2021/11/12/IDulZ9.png)](https://imgtu.com/i/IDulZ9)
&nbsp;

|方法名 | 参数1 | 参数2 | 参数3 | 参数4 | 方法作用|
|------ |------|------|------|------|------|
|ensurePermissionGrant(roleName) | 实体组的grant角色名称 | 无 | 无 | 无 | 确保最高权限grant存在|
|ensureRole(permission, className) | permission 权限名称 | className 当前实体或者实体组类名 | 无 | 无 | 确保一般权限存在，存在便返回该权限的Parse.Object|
|addEntity(fieldName, entity) | fieldName 关系字段 | entity 实体对象 | 无 | 无 | 把实体添加到当前实体组的fieldName关系字段里 |
|removeEntity(fieldName, entity) | fieldName 关系字段 | entity 实体对象| 无 | 无 | 把实体从当前实体组的fieldName关系字段里移除|
|addEntityGroup(fieldName, entityGroup) | fieldName 关系字段 | entityGroup 实体组对象| 无 | 无  | 把实体组添加到当前实体组fieldName关系字段里|
|removeEntityGroup(fieldName, entityGroup) | fieldName 关系字段 | entityGroup 实体组对象| 无 | 无  | 把实体组从当前实体组fieldName关系字段里移除|
|addMembers(user, withGrant = false) | user 用户对象 | withGrant 决定是否授予用户最高grant权限| 无 | 无  | 把实体组从当前实体组fieldName关系字段里移除|
|delMembers(user) | user 要被删除的用户 | 无 | 无 | 无 | 删除实体组成员，并在对应的角色权限中删除此成员|
|setMemberPermission(user, permissions, withGrant = false) | user 被改变的用户 | permissions 用户权限 | withGrant 决定是否授予当前用户最高grant权限 | 无 | 改变某实体组成员的权限|
