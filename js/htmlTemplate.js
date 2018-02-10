// 生成的html模板
let template = {
    // 文件区域相同结构
     commonFileStruct(fileData){
        let common = `<div class="item" data-file-id='${fileData.id}'>
                        <lable class="checkbox"></lable>
                        <div class="file-img">
                            <i></i>
                        </div>
                        <p class="file-title-box">
                            <span class="file-title">${fileData.title}</span>
                            <span class="file-edtor">
                                <input class="edtor" value="${fileData.title}" type="text"/>
                            </span>
                        </p>
                        <div class="file-oper fr">
                            <span class="rename fl" frag="true">重命名</span>
                            <span class="move fl" frag="true">移动到</span>
                            <span class="delect fl" frag="true">删除</span>
                        </div>
                    </div>`;
        return common;
    },
    // 渲染文件区域
    filesHtml(fileData) {
        let fileHtml = `<div class="file-item" data-file-id='${fileData.id}'>
            ${template.commonFileStruct(fileData)}
        </div>`;
        return fileHtml;
    },
    // 通过id来获取下边的子文件html结构
    createFileHtml(datas, fileId){
        let childs = dataControl.getChildById(datas, fileId);
        let html = '';
        childs.map((item) => {
            html += template.filesHtml(item);
            return item;
        })
        return html;
    },
    // 点击新建文件夹，返回一个元素对象
    createFileEle(fileData) {
        let newDiv = document.createElement('div');
        newDiv.className = 'file-item';
        newDiv.innerHTML = template.commonFileStruct(fileData);
        return newDiv;
    },
    // 渲染树形菜单区域
    treeHtml(data, treeId) {
        let childs = dataControl.getChildById(data, treeId);
        let html = `<ul>`;
        childs.map((item) => {
            let level = dataControl.getLevelById(data, item.id);
            let hasChilds = dataControl.hasChilds(data, item.id);
            let classNames = hasChilds ? 'tree-contro' : 'tree-contro-none';
            html += `<li>
                    <div class="tree-title ${classNames}" data-file-id='${item.id}' style='padding-left: ${level * 14}px'>
                        <span>
                            <strong class="ellipsis">${item.title}</strong>
                            <i class="ico"></i>
                        </span>
                    </div>
                    ${template.treeHtml(data, item.id)}
                </li> `;
            return item;    
        });
        html += `</ul>`;        
        return html;    
    },
    // 定位到树形菜单
    positionTree(obj, positionId) {
        let ele = obj.querySelector(`.tree-title[data-file-id="${positionId}"]`);
        tools.addClass(ele, 'tree-nav');
    },
    //创建文件夹时，创建树形菜单
    createTreeHtml(options){
        let newLi = document.createElement('li');
        newLi.innerHTML = `<div class="tree-title tree-contro-none" data-file-id='${options.id}' style='padding-left: ${options.level * 14}px'>
                        <span>
                            <strong class="ellipsis">${options.title}</strong>
                            <i class="ico"></i>
                        </span>
                    </div>
                    <ul></ul>`;
        return newLi;
    },
    //通过指定的id创建菜单目录
    createPathNavHtml(datas, fileId){
        //找到指定id所有的父数据
        let parents = dataControl.getParents(datas, fileId).reverse();

        let pathNavHtml = '';
        let len = parents.length;
        parents.forEach(function(item, index){
            if(index < parents.length - 1){
                pathNavHtml += `<a href="javascript:;" style="z-index:${len--}" data-file-id="${item.id}">${item.title}</a>`;
            }
        });
        pathNavHtml += `<span class="current-path" style="z-index:${len--}">${parents[parents.length - 1].title}</span>`;
        return pathNavHtml;
    }
};