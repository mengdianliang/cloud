# cloud

--------
### 概述
项目是基于原生js，成品是一个PC端的云盘车，实现了其中的一部分功能。

#### 模块划分
> 
* [x] 文件区域展示分为文件展示、列表展示
* [x] 树形菜单、面包屑导航、文件区域三者交互式渲染
* [x] 文件新建、删除、重命名、移动到
* [x] 文件全选、框选
* [x] 右键菜单功能

#### 技术点
> 
*  递归调用
*  事件监听
*  阻止冒泡和默认行为
*  事件委托
*  拖拽
*  碰撞检测

#### js目录结构
* data.js：用来存放数据的
* handleData.js: 用来操作数据的工具类函数
* htmlTemplate.js: 用来做结构渲染的类函数
* index.js: 直接对页面元素做功能操作的入口
* pupup.js: 封装的弹出层模板
* tools.js: 一些DOM操作的方法

### 功能点
这里有一些自己感觉好的方法和思想，简要说一下：
* 获取元素、添加类属性，删除类属性
```
$: function(selector, context) {
            /*
            * #id
            * .class
            * 标签
            * '#id li'
            * '.class a'
            * */
            context = context || document;
            //群组选择器
            if(selector.indexOf(' ') !== -1){
                return context.querySelectorAll(selector);
                //id获取
            }else if(selector.charAt(0) === '#'){
                return context.getElementById(selector.slice(1));
                //class获取
            }else if(selector.charAt(0) === '.'){
                return tools.getByClass(selector.slice(1), context);
                //标签获取
            }else{
                return context.getElementsByTagName(selector);
            }
        },
        getByClass: function(className, context) {
            //context获取某一元素下边的
            //className传递过来的类样式
            context = context || document;
            //如果浏览器支持通过类样式获取元素，执行下边代码
            if(context.getElementsByClassName) {
                return context.getElementsByClassName(className);
            }
            //获取context下的所有节点，ret用来存储获取到的节点
            let nodes = context.getElementsByTagName('*'),
                ret = [];
            for(let i= 0; i < nodes.length; i++) {
                if(hasClass(nodes[i], className)){
                    ret.push(nodes[i]);
                }
            }
            return ret;
        },
        addClass: function(element, classNames){
            if(typeof classNames === 'string') {
                if(tools.hasClass(element, classNames)) {
                    return;
                }
                let newClass = element.className.split(' ');
                newClass.push(classNames);
                element.className = newClass.join(' ');
            }
        },
        removeClass: function(element, classNames){
            let classNameArr = element.className.split(' ');
            for(let i = 0;i < classNameArr.length;i++){
                if(classNameArr[i] === classNames){
                    classNameArr.splice(i, 1);
                    i--;
                }
            }
            element.className = classNameArr.join(' ');
        },
        hasClass: function(element,classNames){
            let reg = new RegExp('(^|\\s)' + classNames + '(\\s|$)');
            return reg.test(element.className);
        },
        toggleClass: function(element,classNames){
            if(tools.hasClass(element,classNames)){
                tools.removeClass(element,classNames);
                return false;
            }else{
                tools.addClass(element,classNames);
                return true;
            }
        }
```
* 框选
```
 // 文件框选功能
    // /*
    // * 1.生成一个框选框
    // * 2.碰撞检测
    // * */
    function checkLine() {
        let newSel = 0;
        let disX = 0;
        let disY = 0;
        let fileItem = tools.$('.file-item',fileList);
        let checkboxs = tools.$('.checkbox',fileList); 
        tools.addEvent(fileList, 'mousedown', function(evt) {
            evt = window.event || evt;
            let target = evt.target;
            disX = evt.clientX;
            disY = evt.clientY;

            // 如果框选在选中框上边，则取消框选
            if(tools.parents(target, '.nav-a')) {
                return;
            }

            // 鼠标移动
            tools.addEvent(document, 'mousemove', moveFn);
            tools.addEvent(document, 'mouseup', upFn);
            tools.stopDefault();
        })
        function moveFn(evt) {
            evt = window.event || evt;
            //框选框大于一定范围时，才做框选操作
            if(Math.abs(evt.clientX - disX) > 10 || Math.abs(evt.clientY - disY) > 10) {
                if(!newSel) {
                    newSel = document.createElement('div');
                    newSel.className = 'selectTab';
                    document.body.appendChild(newSel);
                }

                let wid = evt.clientX - disX;
                let hgt = evt.clientY - disY;

                newSel.style.left = Math.min(evt.clientX, disX) + 'px';
                newSel.style.top = Math.min(evt.clientY, disY) + 'px';
                tools.show(newSel);

                newSel.style.width = Math.abs(wid) + 'px';
                newSel.style.height = Math.abs(hgt) + 'px';
                
                // 检测碰撞，遍历文件区域所有的文件
                tools.each(fileItem, function(item,index){
                    if(tools.collisionRect(item, newSel)){
                        tools.addClass(item,'file-checked');
                        tools.addClass(checkboxs[index], 'checked');
                    }else{
                        tools.removeClass(item, 'file-checked');
                        tools.removeClass(checkboxs[index], 'checked');
                    }
                });
                if( whoSelect().length === checkboxs.length ){
                    tools.addClass(checkedAll,"checked");
                }else{
                    tools.removeClass(checkedAll,"checked");
                }
            }
        }
        function upFn(){
            tools.removeEvent(document,'mousemove',moveFn);
            tools.removeEvent(document,'mouseup',upFn);
            if(newSel) {
                tools.hide(newSel);
                newSel.style.width = '0px';
                newSel.style.height = '0px';
            }
        }
    }
```
* 事件监听
```
 addEvent: function(obj, evtName, fn) {
            //obj事件对象，evtname事件名，fn事件执行函数
            if (obj.addEventListener) {
                return obj.addEventListener(evtName, fn, false);
            } else {
                return obj.attachEvent('on' + evtName, function(){
                fn.call(obj);
                });
            }
        },
        removeEvent: function(obj, evtName, fn) {
            //obj事件对象，evtname事件名，fn事件执行函数
            if(removeEventListener){
                return obj.removeEventListener(evtName, fn, false);
            }else{
                return obj.detachEvent('on' + evtName, function(){
                    fn.call(obj);
                })
            }
        },
```
* 个人总结：
```
(1)对于结构不断发生改变的元素来说，使用直接点击事件，比事件绑定要好得多：
eg:
    // 删除文件
    function delFile() {
        //删除文件的按钮
        let delList = tools.$('.delect');

        let fileItem = tools.$('.file-item',fileList);
        let checkboxs = tools.$('.checkbox',fileList); 

        for(let i = 0; i < delList.length; i++){
            delList[i].onmousedown = function(evt) {
                
            // 这里不用事件监听函数的原因是：事件监听是可以重复执行的}
            // tools.addEvent(delList[i],'mousedown',function(evt){
                // console.log(this)
                evt = window.event || evt;
                let target = evt.target;
                if(target.getAttribute('frag') == 'true'){
                    let item = tools.parents(target,'.file-item');
                    tools.each(fileItem, function(_item, index) {
                        if(_item == item){
                            tools.addClass(_item,'file-checked');
                            tools.addClass(checkboxs[index],'checked');
                        }else{
                            tools.removeClass(_item,'file-checked');
                            tools.removeClass(checkboxs[index],'checked');
                            tools.removeClass(checkedAll,'checked');
                        }
                    });
                }
                // 删除操作
                operDel();

                if(contentMenu.style.display == 'block'){
                    contentMenu.style.display = '';
                }
                // console.log(datas);
                tools.cancelBub();
            };
        }
    }
  (2) 对于结构变化的元素，尽量在函数内部重新获取，这样结构更清晰，代码更严谨。（尽管在外部也能获取） 
  (3) 数据改变视图，只有在页面改变比较大时，才适合用；否则，我们可以改变局部页面结构和数据
  (4) 模块化对于后期的维护有很大的帮助。
```

### 效果
![](https://github.com/mengdianliang/cloud/blob/master/show/page.png)
![](https://github.com/mengdianliang/cloud/blob/master/show/list.png)
![](https://github.com/mengdianliang/cloud/blob/master/show/check.png)
![](https://github.com/mengdianliang/cloud/blob/master/show/checkall.png)
![](https://github.com/mengdianliang/cloud/blob/master/show/move.png)
![](https://github.com/mengdianliang/cloud/blob/master/show/rename.png)

### 总结
通过学习该项目，对js的理解有进一层，这里根据自己经验的积累，有很多自己总结的方法，希望能对大家学习有帮助。




