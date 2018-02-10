// 对DOM操作的工具类
let tools = (function() {
    var toolsObj = {
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
        },
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
        parents: function(obj,selector){
            /*
            * selector
            * id
            * class
            * 标签
            * 9 代表DOM树的根节点
            * */
            if(selector.charAt(0) === '#'){
                while(obj.id !== selector.slice(1)){
                    obj = obj.parentNode;
                }
            }else if(selector.charAt(0) === '.'){
                while(obj && obj.nodeType !== 9 && !tools.hasClass(obj,selector.slice(1))){
                    obj = obj.parentNode;
                }
            }else{
                while(obj && obj.nodeType !== 9 && obj.nodeName.toLowerCase() !== selector){
                    obj = obj.parentNode;
                }
            }
            return obj && obj.nodeType === 9 ? null : obj;
         },
        each: function(obj, callBack){
            for( var i = 0; i < obj.length; i++ ){
                callBack(obj[i], i);
            }
        },
        getEleRect: function(obj){
            return obj.getBoundingClientRect();
        },
        collisionRect: function(obj1,obj2){
            var objRect1 = tools.getEleRect(obj1);
            var objRect2= tools.getEleRect(obj2);

            var rectWid1 = objRect1.width;
            var rectHgt1 = objRect1.height;
            var rectTp1 = objRect1.top;
            var rectLft1 = objRect1.left;

            var rectWid2 = objRect2.width;
            var rectHgt2 = objRect2.height;
            var rectTp2 = objRect2.top;
            var rectLft2 = objRect2.left;

            if(rectLft1 > rectLft2 + rectWid2 || rectLft1 + rectWid1 < rectLft2 || rectTp1 > rectTp2 + rectHgt2 || rectTp1 + rectHgt1 < rectTp2){
                return false;
            }else{
                return true;
            }
        },
        /*collisionRect:function(obj1,obj2){
            var obj1Rect = tools.getEleRect(obj1);
            var obj2Rect = tools.getEleRect(obj2);

            var obj1W = obj1Rect.width;
            var obj1H = obj1Rect.height;
            var obj1L = obj1Rect.left;
            var obj1T = obj1Rect.top;

            var obj2W = obj2Rect.width;
            var obj2H = obj2Rect.height;
            var obj2L = obj2Rect.left;
            var obj2T = obj2Rect.top;
            //碰上返回true 否则返回false
            if( obj1W+obj1L>obj2L && obj1T+obj1H > obj2T && obj1L < obj2L+obj2W && obj1T<obj2T+obj2H ){
                return true
            }else{
                return false;
            }
        },*/
        store: function(namespace,data){
            if(data){
                return localStorage.setItem(namespace,JSON.stringify(data));
            }
            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store) || []);
        },
        extend:function (obj){  //深拷贝
            var newArr = obj.constructor === Array ? [] : {};
            for( var attr in obj ){
                if( typeof obj[attr] === "object"){
                    newArr[attr] = tools.extend(obj[attr]);
                }else{
                    newArr[attr] = obj[attr];
                }
            }
            return newArr;
        },
        hide:function (element){
            return element.style.display = "none";
        },
        show:function (element){
            return element.style.display = "block";
        },
        getOffset:function (obj){
            return {
                width:obj.offsetWidth,
                height:obj.offsetHeight
            }
        },
        viewHeight: function () {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        },
        cancelBub: function(evt) {
            evt = window.event || evt;
            evt.cancelBubble = true;
            evt.stopPropagation();
        },
        stopDefault: function(evt) {
            evt = window.event || evt;
            evt.preventDefault();
            return false;
        }
    };
    return toolsObj;
}());