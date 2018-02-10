# cloud

--------
### 概述
项目是基于Vue.js，成品是一个PC端的购物车。前端的许多操作都要传输到后台，所以这里node也是很重要的一部分。
#### 模块划分
> 
* [x] 用户登陆登出
* [x] 商品列表
* [x] 购物车列表
* [x] 地址列表
* [x] 购物订单列表
* [x] 购物完成信息
#### 技术栈
> 
*  Vue
*  Vuex
*  Vue-Router
*  Vue-cli
*  Axios
*  Node
*  Mongodb

#### src目录结构
* api：用来请求服务器端数据的，通过`axios`发送请求，服务端代理，需要在`config/index.js`中设置代理接口
    proxyTable: {
      '/api': {
        target: 'http://localhost:9000'
      }
    }
* assets: 存放样式资源
* components: 存放一些基础组件
* views: 存放一些视图组件
* router: 配置路由
* store: 一些共享状态管理(由于这里状态只有用户，购物车数量，所以直接写在了main.js文件中)

#### server目录结构
* bin：服务端启动项
* models: 数据库模型
* public: 服务端页面样式，文字，图片资源
* routes: 服务端路由
* util: 工具类文件
* views: 返回给客户端的网页模板
* app.js: 服务端入口文件

#### 好用的插件
* 图片懒加载
  ``` bash
  npm install vue-lazyload -D
  import VueLazyload from 'vue-lazyload'
  github网址：https://github.com/hilongjw/vue-lazyload
  ```
* `express-generator`生成器
  ``` 
  npm install express-generator -S
  这是一个express自动生成插件
  ```
* 分页加载vue-infinite-scroll
  ``` bash
  npm install vue-infinite-scroll --save
  import infiniteScroll from 'vue-infinite-scroll'
  Vue.use(infiniteScroll)
  github网址：https://github.com/ElemeFE/vue-infinite-scroll
  ```
### Node知识点
由于node学的不是很好，所以这里总结一下感觉比较特别的一些基础知识。
#### 数据库
```
显示数据库列表 show dbs
创建一个demo数据库 use demo
创建数据库表：db.createCollection("user")

创建数据库集合并插入数据:
db.users.insert({id: 123, name: "张三"})
查看数据库集合：show collections
删除数据库: db.dropDatabase()
删除集合: db.user.drop() 

插入数据：db.user.insert({id: 123, username: 'jack', age: 20, class: {name: 'imooc', num: 10}})
查询数据并格式化：db.user.find().pretty()
查询第一条数据：db.user.findOne()
条件查询：db.user.find({'username': 'jack'})
          db.user.find({'age': {$gt: 20}})		
更新数据：db.user.update({username: "jack"}, {$set: {age: 30}})
更新子数据：db.user.update({username: "jack"}, {$set: {'class.name': 'imooc-jack'}})

删除数据：db.user.remove({id: 123})

导入文件数据：mongoimport -d db_demo -c users --file E:/代码/project/v18dyy/resource/dumall-users
```
* 删除购物车商品
```
router.post('/cartDel', function (req, res, next) {
  var userId = req.cookies.userId
  var productId = req.body.productId
  // $pull 要删除的数据
  User.update({
    userId: userId
  }, {
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  },function (err, doc) {
    if (err) {
      res.json({
        code: 1,
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        code: 0,
        msg: '',
        result: 'suc'
      })
    }
  })
})
```
* 修改购物车商品数量
```
router.post("/cartEdit", function (req, res, next) {
  var userId = req.cookies.userId
  var productId = req.body.productId
  var productNum = req.body.productNum
  var checked = req.body.checked

  // 更新子文档
  User.update({"userId": userId, "cartList.productId": productId}, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked,
    }, function (err,doc) {
    if (err) {
      res.json({
        code: 1,
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        code: 0,
        msg: '',
        result: 'suc'
      })
    }
  })
})
```

### 交互体验
该项目使用纯手写css样式，采用响应式布局，使用transition效果。使用到了分页加载插件`vue-infinite-scroll`，做到了下拉加载效果。

通过原生js实现的进度条效果，详情请看https://github.com/mengdianliang/shopping/blob/master/src/components/progress/progress.vue

为了减少流量，图片加载使用了懒加载的方式，滚动时再加载真实的图片。

### 效果
![](https://github.com/mengdianliang/shopping/blob/master/show/goodlist.png)
![](https://github.com/mengdianliang/shopping/blob/master/show/cart.png)
![](https://github.com/mengdianliang/shopping/blob/master/show/address.png)
![](https://github.com/mengdianliang/shopping/blob/master/show/order.png)
### 构建
#### 开发环境

``` bash
# install dependencies
npm install
# start server
node server/bin/www
# serve with hot reload at localhost:8080
npm run dev
```
### 总结
通过学习该项目，对node又有了新的认识。虽然也有许多获取数据失败的问题，最多的还是node知识不扎实造成的，希望以后再node上多下点功夫。摁，加油！




