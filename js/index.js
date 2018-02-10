// 对页面元素的直接操作
(function() {
    // 全局变量
    // 文件区域的容器
    let fileList = tools.$('.file-list')[0];
    // 菜单区域的容器
    let treeMenu = tools.$('.tree-menu')[0];
    // 文件导航区域的容器
    let pathNav = tools.$('.path-nav')[0];
    // 获取到全选按钮
    let checkedAll = tools.$(".checked-all")[0];   
    // 创建文件的按钮
    let create = tools.$('.create')[0];
    // 获取右键菜单
    let contentMenu = tools.$('.content-menu')[0]; 
    // 文件重命名
    let rename = '';  

    // 总的数据
    let datas = data.files;
    // 渲染这个id下的所有的子数据
    let renderId = 0;
    // 没有文件时的容器
    let empty = tools.$(".g-empty")[0];
    // 临时存储父级id
    let tempid = '0';
    //存储选中文件的id
    let dataArr = [];  

    init(); // 页面初始化
    // 页面初始化
    function init() {
        setLayout();      //布局自适应

        fileRenderInit(); // 文件区域首次渲染
        treeRenderInit(); // 树形菜单首次渲染
        navRenderInit();  // 面包屑导航首次渲染

        changeTab();      // 切换列表

        createFile();     // 创建文件

        docEvent();       // 文档点击取消操作
        checkLine();      // 框选
    }
    // 高度自适应
    function setLayout() {
        //主体内容的自适应
        let header = tools.$('.header')[0];
        let weiyunContent = tools.$('.weiyun-content')[0];

        let headerH = header.offsetHeight;
        changeHeight()
        function changeHeight() {
            let viewHeight = tools.viewHeight();
            weiyunContent.style.height = viewHeight - headerH + 'px'
        }
        window.onresize = changeHeight
    }

    //列表切换
    function changeTab() {
        let list = tools.$('.list_change')[0]; // 获取切换列表
        tools.addEvent(list, 'click', function(evt){
            evt = window.event || evt;
            let target = evt.target;
            if(target.nodeName.toLowerCase() === 'a') {
                if(tools.hasClass(target, 'active')) {
                    return;
                }
                let activeCls = tools.$('.active', list)[0];
                tools.removeClass(activeCls, 'active');
                tools.addClass(target, 'active');
                //切换列表
                if(target.dataset.types === 'line') {
                    tools.addClass(fileList,'file-line');

                }else{
                    tools.removeClass(fileList,'file-line');
                }
            }
        })
    }
    
    // 文件区域首次渲染
    function fileRenderInit() {
        fileList.innerHTML = template.createFileHtml(datas, renderId);
        fileEvent(fileList);
        fileEventChange();
        checkAllFile();
    }
    // 渲染文件导航
    function navRenderInit() {
        pathNav.innerHTML = template.createPathNavHtml(datas,0);
        navEvent(pathNav);
    }
    // 菜单区域首次渲染
    function treeRenderInit() {
        treeMenu.innerHTML = template.treeHtml(datas, -1);
        // 定位树形菜单
        template.positionTree(treeMenu, 0);
        treeEvent(treeMenu);
    }
    
    // 菜单区域事件委托
    function treeEvent(el) {
        //利用事件委托，点击树形菜单区域，找到事件源
        tools.addEvent(el, 'click', (evt) => {
            evt = window.event || evt;
            let target = evt.target;
            if(tools.parents(target, '.tree-title')) {
                target = tools.parents(target, '.tree-title');
                //找到.tree-title 对应的fileId
                let fileId = target.dataset.fileId;
                renderNavFilesTree(fileId);
            }
        });
    }
    // 面包屑导航的事件委托
    function navEvent(el) {
        // 利用事件委托，点击面包屑导航，找事件源
        tools.addEvent(el,'click',function(evt){
            evt = window.event || evt;
            let target = evt.target;
            // console.log(tools.parents(target, "a"));
            if(tools.parents(target, 'a')){
                let fileId = target.dataset.fileId;
                // console.log(fileId);
                renderNavFilesTree(fileId);
            }
        });
    }
    // 文件的事件委托
    function fileEvent(el) {
        //利用事件委托，点击每一个文件夹，找事件源
        tools.addEvent(el, 'click', function(evt){
            evt = window.event || evt;
            let target = evt.target;
            if(tools.parents(target,'.item')){
                target = tools.parents(target,'.item');
                let fileId = target.dataset.fileId;
                renderNavFilesTree(fileId);
            }
        });
    }
    // 树形菜单、面包屑导航、文件三个区域重叠交互功能
    function renderNavFilesTree(fileId) {
        //渲染导航区域
        pathNav.innerHTML = template.createPathNavHtml(datas, fileId);
        let hasChilds = dataControl.hasChilds(datas, fileId);
        //判断是否有子元素，来渲染文件区域
        if (hasChilds) {
            tools.hide(empty);
            fileList.innerHTML = template.createFileHtml(datas, fileId);
        }else{
            tools.show(empty);
            fileList.innerHTML = '';
        }
        treeMenu.innerHTML = template.treeHtml(datas, -1);
        //需要给当前div添加样式，其余的div没有样式
        let treeNav = tools.$('.tree-nav', treeMenu)[0];
        if(treeNav){
            tools.removeClass(treeNav, 'tree-nav');
        }
        template.positionTree(treeMenu, fileId);

        //记录当前操作的父id
        tempid = fileId;

        // 每次文件区域结构改变，都要重新给文件添加事件
        fileEventChange();

        tools.removeClass(checkedAll, "checked");

    }
    //文件夹移入移出，选中, 新建，删除，重命名， 移动到，右键菜单事件
    function fileEventChange() {
        let fileItem = tools.$('.file-item',fileList);        //获取所有的文件

        // 文件移入移出功能
        tools.each(fileItem, (item, index) => {
            fileEventChangeOnce(item) 
        });
        // 文件删除
        delFile();
        // 文件重命名
        reName();
        // 文件移动到
        movtion();
    } 
    // 单个文件操作提取
    function fileEventChangeOnce(item) {
        let fileItem = tools.$('.file-item',fileList);
        let checkboxs = tools.$('.checkbox',fileList);        //获取所有选中框 
        let check = tools.$('.checkbox', item)[0]; 
            // 文件移入
            tools.addEvent(item, 'mouseenter' , function() {
                if(!tools.hasClass(check, "checked")){
                    tools.addClass(this, 'file-checked');
                }
            })
            // 文件移出
            tools.addEvent(item, 'mouseleave' , function() {
                if(!tools.hasClass(check, "checked")){
                    tools.removeClass(this, 'file-checked');
                }
            })
            // 单个文件选中事件
            tools.addEvent(check, 'click', function(evt) {
                evt = window.event || evt;
                let isClick = tools.toggleClass(this, 'checked');
                if(isClick && (whoSelect().length == checkboxs.length)) {
                    tools.addClass(checkedAll, 'checked');
                }else{
                    tools.removeClass(checkedAll, 'checked');
                }
                tools.cancelBub();
            });
            // 阻止冒泡
            tools.addEvent(check, 'mousedown', function(evt){
                tools.cancelBub();
            });
            // 右键点击事件
            tools.addEvent(item,'contextmenu',function(evt){
                evt = window.event || evt;
                tools.each(fileItem, function(_item, index){
                    if(_item === item){
                        tools.addClass(_item,'file-checked');
                        tools.addClass(checkboxs[index],'checked');
                    }else{
                        tools.removeClass(_item,'file-checked');
                        tools.removeClass(checkboxs[index],'checked');
                        tools.removeClass(checkedAll,'checked');
                    }
                });
                let disX = evt.clientX;
                let disY = evt.clientY;
                contentMenu.style.left = disX + 'px';
                contentMenu.style.top = disY + 'px';
                tools.show(contentMenu);
                tools.stopDefault();
            });
            tools.addEvent(item, 'mousedown',function(evt){
                tools.cancelBub();
            });
    }
    // 点击全选功能
    function checkAllFile() {
        let fileItem = tools.$('.file-item',fileList);        //获取所有的文件
        let checkboxs = tools.$('.checkbox',fileList);        //获取所有选中框
        tools.addEvent(checkedAll, 'click', function() {
            let isClick = tools.toggleClass(this, 'checked');
            if(isClick){
                tools.each(fileItem, function(item, index) {
                    tools.addClass(item, 'file-checked');
                    tools.addClass(checkboxs[index], 'checked');
                });
            }else{
                tools.each(fileItem, function(item, index) {
                    tools.removeClass(item, 'file-checked');
                    tools.removeClass(checkboxs[index], 'checked');
                });
            }
        });
    } 
    //存储选中的多选框
    function whoSelect() {
        let fileItem = tools.$('.file-item',fileList);        //获取所有的文件
        let checkboxs = tools.$('.checkbox',fileList);        //获取所有选中框
        let arr = [];
        tools.each(checkboxs, function(item, index){
            if(tools.hasClass(item, 'checked')){
                arr.push(fileItem[index]);
            }
        });
        return arr;
    }
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
    // 创建文件夹
    function createFile() {
        tools.addEvent(create, 'mousedown', function(evt){
            evt = window.event || evt;
            tools.hide(empty);
            if(create.isCreateFile) {
                tips('err','文件正在创建中！');
                tools.cancelBub();
                return;
            }
            if(rename.isRenameFile) {
                tips('err','文件正在重命名中！');
                tools.cancelBub();
                return;
            }
            let newEle = template.createFileEle({
                title: '',
                id: new Date().getTime()
            });
            fileList.insertBefore(newEle, fileList.firstElementChild);

            //获取标题，及其输入框
            let fileTit = tools.$('.file-title', newEle)[0];
            let fileEdit = tools.$('.file-edtor', newEle)[0];
            let editor = tools.$('.edtor',newEle)[0];
            tools.hide(fileTit);
            tools.show(fileEdit);
            // editor.select();  //自动选中状态
            editor.onclick = editor.onmousedown = function(evt){
                this.select();
                tools.cancelBub();
            };
            create.isCreateFile = true;  //添加一个状态，表示正在创建文件
            tools.cancelBub();
        });
    } 
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
    // 做删除操作
    function operDel() {
        // 存储选中的文件
        let arr = whoSelect();
        if(!arr.length) {
            tips('err','请选择要删除的文件！');
        } else {
            // 删除文件
            // tools.each(arr, function(item, index){
            //     fileList.removeChild(item);
            // });

            let treeTitle = tools.$('.tree-title',treeMenu);
            // 删除菜单
            tools.each(arr, function(item, index) {
                let fileId = tools.$('.item',item)[0].dataset.fileId;
                delData(fileId);
                // for(let i = 0; i < treeTitle.length; i++) {
                //     if(treeTitle[i].dataset.fileId === fileId){
                //         let pareNode = treeTitle[i].parentNode;
                //         pareNode.parentNode.removeChild(pareNode);
                //         break;
                //     }
                // }
            });
            // console.log(dataArr);
            // 删除数据
            dataArr.forEach(function(val){
                datas.forEach(function(item,index){
                    if(item.id == val){
                        datas.splice(index,1);
                    }
                });
            });
            renderNavFilesTree(tempid);
            tips('ok','文件删除成功！');
        }
        dataArr = [];
    }
    // 存储被选中文件id
    function delData(fileId){
        dataArr.push(fileId);
        if(dataControl.hasChilds(datas, fileId)){
            let childs = dataControl.getChildById(datas, fileId);
            childs.map( (item) => {
                delData(item.id);
                return item;
            });
        }
    }

    // 文件重命名
    function reName() {
        rename = tools.$('.rename');
        let fileItem = tools.$('.file-item',fileList);
        let checkboxs = tools.$('.checkbox',fileList); 
        // console.log(rename)
        for(let i = 0;i < rename.length;i++){
            rename[i].onmousedown = function(evt) {
                // console.log(this)
                evt = window.event || evt;
                let target = evt.target;
                //需要阻止文件的点击事件冒泡
                if(target.getAttribute('frag') == 'true'){
                    tools.addEvent(this,'click',function(evt){
                        tools.cancelBub();
                    });
                    let item = tools.parents(target,'.file-item');
                    tools.each(fileItem,function(_item,index){
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
                let arr = whoSelect();//存储选中的文件
                if(arr.length){
                    tools.each(arr,function(item, index){
                        let fileId = tools.$('.item',item)[0].dataset.fileId;
                        dataArr.push(fileId);
                        //获取标题，及其输入框
                        let fileTit = tools.$('.file-title',item)[0];
                        let fileEdit = tools.$('.file-edtor',item)[0];
                        let editor = tools.$('.edtor',item)[0];

                        editor.onclick = editor.onmousedown = function(evt){
                            tools.cancelBub();
                            this.select();
                        };
                        tools.hide(fileTit);
                        tools.show(fileEdit);
                        rename.isRenameFile = true;  //添加一个状态，表示正在重命名文件
                    });
                    tools.$('.edtor',arr[0])[0].select();  //自动选中状态
                }else{
                    tips('err','请选择要重命名的文件！');
                }
                if(contentMenu.style.display == 'block'){
                    contentMenu.style.display = '';
                }
                tools.cancelBub();
            };
        }
    }

    // 给document绑定一个mousedown，名字输入成功 
    function docEvent() {
        let fileItem = tools.$('.file-item',fileList);
        let checkboxs = tools.$('.checkbox',fileList); 
        tools.addEvent(fileList, 'mousedown', function() {
            if(contentMenu.style.display == 'block'){
                contentMenu.style.display = '';
            }
            if(create.isCreateFile){
                let firstEle = fileList.firstElementChild;
                let editor = tools.$('.edtor',firstEle)[0];
                let val = editor.value.trim();
    
                if (val === ''){
                    fileList.removeChild(firstEle);
                    //需要判断创建失败时，文件列表是否为空
                    if( fileList.innerHTML === "" ){
                        tools.show(empty);
                    }
                    tips('err','新建文件名不能为空！');
                } else {
                    let fileTit = tools.$('.file-title',firstEle)[0];
                    let fileEdit = tools.$('.file-edtor',firstEle)[0];
    
                    fileTit.innerHTML = val;
                    tools.show(fileTit);
                    tools.hide(fileEdit)
    
                    //给新创建的文件添加事件处理
                    fileEventChangeOnce(firstEle)
    
                    //获取当前元素的id
                    let fileId = tools.$('.item',firstEle)[0].dataset.fileId;
    
                    //新建元素的数据结构，并存储数据
                    let newFileData = {
                        id: fileId,
                        pid: Number(tempid),
                        title: val,
                        type: "file"
                    };
                    //放在数据中
                    datas.unshift(newFileData);
                    //datas.splice(0,0,newFileData);
    
                    //获取创建文件的父级ul
                    // console.log(tempid);
                    let ele = document.querySelector('.tree-title[data-file-id="'+ tempid + '"]');
                    let nextUl = ele.nextElementSibling;
    
                    let level  = dataControl.getLevelById(datas,fileId);
                    //调用创建菜单的函数
                    nextUl.appendChild(template.createTreeHtml({
                        id: fileId,
                        title: val,
                        level: level
                    }));
                    if(nextUl.innerHTML !== ''){
                        tools.addClass(ele,'tree-contro');
                        tools.removeClass(ele,'tree-contro-none');
                    }
                    tools.each(fileItem, function(item, index){
                        tools.removeClass(item,'file-checked');
                        tools.removeClass(checkboxs[index], 'checked');
                    });
                    tools.removeClass(checkedAll,'checked');
                    //提醒框
                    tips('ok','新建文件成功！');
                }
                // 文件删除
                delFile();
                // 文件重命名
                reName();
                // 文件移动到
                movtion();
                create.isCreateFile = false;
            }else if(rename.isRenameFile) {
                let arr = whoSelect();//存储选中的文件
                let num = 0;
                tools.each(arr,function(item,index){
                    //获取标题，及其输入框
                    let editor = tools.$('.edtor',item)[0];
                    let val = editor.value.trim();
                    if(val !== '') {
                        num++;
                    }
                });

                if(num < arr.length){
                    tips('err','文件名不能为空！');
                }else{
                    let treeTitle = tools.$('.tree-title',treeMenu);
                    tools.each(arr,function(item,index){
                        let fileTit = tools.$('.file-title',item)[0];
                        let fileEdit = tools.$('.file-edtor',item)[0];
                        let editor = tools.$('.edtor',item)[0];
                        let val = editor.value.trim();

                        // 操作文件
                        tools.show(fileTit);
                        tools.hide(fileEdit);
                        fileTit.innerHTML = val;
                        // 操作树形菜单
                        for(let i = 0;i < treeTitle.length;i++){
                            if(treeTitle[i].dataset.fileId == dataArr[index]){
                                tools.$('.ellipsis',treeTitle[i])[0].innerHTML = val;
                                break;
                            }
                        }
                        // 操作数据
                        datas.forEach(function(item,indx){
                            if(item.id == dataArr[index]){
                                item.title = val;
                            }
                        });
                    });
                    tools.each(fileItem,function(item,index){
                        tools.removeClass(item,'file-checked');
                        tools.removeClass(checkboxs[index],'checked');
                    });
                    tools.removeClass(checkedAll,'checked');
                    tips('ok','文件重命名成功！');
                    dataArr = [];
                }
                rename.isRenameFile = false;
            }else{
                tools.each(fileItem, function(item,index){
                    tools.removeClass(item, 'file-checked');
                    tools.removeClass(checkboxs[index], 'checked');
                });
                tools.removeClass(checkedAll, 'checked');    
            } 
        });
    }

    // 文件移动到
    function movtion(){
        let move = tools.$('.move');  //移动到按钮
        let fileItem = tools.$('.file-item',fileList);
        let checkboxs = tools.$('.checkbox',fileList);
        // 弹出层
        let popup = new PopUp();
        for(let i = 0; i < move.length; i++) {
            move[i].onmousedown = function(evt) {
                if(rename.isRenameFile) {
                    tips('err','文件正在重命名中！');
                    tools.cancelBub();
                    return;
                }
                evt = window.event || evt;
                let target = evt.target;
                if(target.getAttribute('frag') == 'true'){
                    tools.addEvent(this,'click',function(evt){
                        tools.cancelBub();
                    });
                    let item = tools.parents(target,'.file-item');
                    tools.each(fileItem, function(_item,index){
                        if(_item == item){
                            tools.addClass(_item,'file-checked');
                            tools.addClass(checkboxs[index],'checked');
                        }else{
                            tools.removeClass(_item,'file-checked');
                            tools.removeClass(checkboxs[index],'checked');
                            tools.removeClass(checkedAll,'checked');
                        }
                    });
                    tools.cancelBub();
                }
                let str = template.treeHtml(datas, -1);
                let arr = whoSelect();//存储选中的文件
                if(arr.length){
                    // 显示要移动的文件个数
                    popup.total.innerHTML = arr.length + '个文件';
                    datas.forEach(function(item,index){
                        if(item.id == 0){
                            popup.fileMovePathTo.innerHTML = item.title;
                        }
                    });
                    // 显示弹出层
                    popup.open({
                        content: str
                    });
                    tools.each(arr,function(item,index) {
                        let fileId = tools.$('.item', item)[0].dataset.fileId;
                        delData(fileId);
                    });
                    //定位到指定的弹框树形菜单上
                    template.positionTree(popup.dirTree, 0);
                    // console.log(popup);

                    //确定按钮
                    popup.onconfirm = function(){
                        // console.log(popup.error.innerHTML);
                        // 这里的判断条件最好使用标记变量
                        if(popup.error.innerHTML !== '') {
                            return;
                        }
                        tools.each(arr, function(itm,indx) {
                            let fileId = tools.$('.item', itm)[0].dataset.fileId;
                            //console.log(fileId);
                            datas.forEach(function(item,index){
                                if(item.id == fileId){
                                    item.pid = Number(tempid);
                                }
                            });

                        });
                        
                        treeMenu.innerHTML = template.treeHtml(datas,-1);
                        treeMenu = tools.$('.tree-menu')[0];
                        renderNavFilesTree(Number(tempid));

                        tips('ok','文件移动成功！');
                        dataArr = [];
                        // 文件删除
                        delFile();
                        // 文件重命名
                        reName();
                        // 文件移动到
                        movtion();
                    };
                    //关闭和取消按钮
                    popup.onclose = function(){
                        popup.error.innerHTML = '';
                    };
                    if(contentMenu.style.display == 'block'){
                        contentMenu.style.display = '';
                    }
                    tools.each(fileItem,function(item,index){
                        tools.removeClass(item,'file-checked');
                        tools.removeClass(checkboxs[index],'checked');
                    });
                    tools.removeClass(checkedAll,'checked');
                }else{
                    tips('err','请选择要移动的文件！');
                }
            };

        }
        //利用事件委托，点击树形菜单区域，找到事件源
        tools.addEvent(popup.dirTree,'click',function(evt){
            evt = window.event || evt;
            let target = evt.target;
            if(tools.parents(target,'.tree-title')){
                target = tools.parents(target,'.tree-title');
                //找到.tree-title 对应的fileId

                let fileId = target.dataset.fileId;
                let num = 0;
                dataArr.forEach(function(val){
                    if(val !== fileId){
                        num++;
                    }
                });
                // 定位弹出框的树形菜单
                template.positionTree(popup.dirTree,fileId);
                //console.log(num);
                if(num === dataArr.length){
                    let treeNav = tools.$('.tree-nav',popup.dirTree)[0];
                    tools.removeClass(treeNav,'tree-nav');
                    datas.forEach(function(item,index){
                        if(item.id == fileId){
                            popup.fileMovePathTo.innerHTML = item.title;
                        }
                    });
                    // 存储选中的菜单
                    tempid = fileId;
                    popup.error.innerHTML = '';
                }else{
                    popup.error.innerHTML = '不能移动到自身及其子集里';
                }
            }
        });
    }

    // 提示框信息
    let fullTip = tools.$('.full-tip-box')[0];
    let tipText = tools.$('.text',fullTip)[0];

    function tips(cls, title){
        fullTip.style.top = 0;
        fullTip.className = 'full-tip-box';
        fullTip.style.transition = '0.3s';
        tools.addClass(fullTip, cls);
        tipText.innerHTML = title;

        clearTimeout(fullTip.timer);
        fullTip.timer = setTimeout(function(){
            fullTip.style.top = '-32px';
        },2000);
    }
})();