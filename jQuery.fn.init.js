window.onload = function() {// All jQuery objects should point back to these
    // jQuery对象是一个类数组对象，含有连续的整型属性、length属性和大量的jQuery方法，jQuery对象由构造函数jQuery()创建
    
    // 定义jQuery构造函数 调用jQuery构造函数时，实际上返回的是jQuery.fn.init()的实例
    // 在jQuery构造函数内部创建并返回另一个构造函数的实例，省去了jQuery实例前面的运算符new
    var jQuery = function (selector, context) {
        return new jQuery.fn.init(selector, context, rootjQuery);
    }
    
    jQuery.fn = jQuery.prototype = { // 构造函数jQuery的原型对象 fn是prototype的简写，可以少写七个字符，以方便拼写
        /**
         * 定义了原型方法jQuery.fn.init()，负责解析参数selector和context的类型并执行相应的查找
         * 参数selector：可以是任意类型的值，但只有undefined、DOM元素、字符串、函数、jQuery对象、普通JavaScript对象是有效的。
         * 参数context：可以不传入，也可以传入DOM对象、jQuery对象或者普通JavaScript对象之一。
         * 参数rootJQuery：包含了document对象的jQuery对象，用于document.getElementById()查找失败、selector是选择器且未指定context、
         * selector是函数的情况。
         * */
        init: function (selector, context, rootjQuery) {
            var match, elem, ret, doc;
            // Handle $(""), $(null), or $(undefined) 
            // 一、如果是空字符串、null、undefined，直接返回this，此时的this是空jQuery对象
            if (!selector) {
                return this;
            }
    
            // Handle $(DOMElement) 
            // 二、如果是一个dom元素，设置第一个元素和属性context指向该dom元素，属性length为1，然后返回包含了该dom元素引用的jQuery对象
            if (selector.nodeType) { // Element节点是1、Text节点是3、Comment节点是8、Document节点是9、DocumentFragment是11
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }
    
            // The body element only exists once, optimize finding it 
            // 三、如果是字符串'body'
            if (selector === "body" && !context && document.body) {
                this.context = document;
                this[0] = document.body;
                this.selector = selector;
                this.length = 1;
                return this;
            }
    
            // Handle HTML strings 
            // 四、如果是其它字符串
            if (typeof selector === "string") {
                // Are we dealing with HTML string or an ID?
                // 先检测selector是HTML代码还是#id：
                // 1、假设这个字符串是HTML代码，跳过正则quickExpr的检查
                if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                    // Assume that strings that start and end with <> are HTML and skip the regex check
                    match = [null, selector, null]; // 假设是HTML
                // 2、否则用quickExpr检测参数是不是复杂的HTML代码或#id   quickExpr = /^(?:[^#<]* (<[\w\W]+>) [^>]*$ | #([\w\-]*)$)/
                } else {
                    // 如果匹配成功，则数组match的第一个元素为参数selector，第二个元素为匹配的HTML代码或undefined，第三个元素为匹配的#id或undefined
                    match = quickExpr.exec(selector);
                }
    
                // Verify a match, and that no context was specified for #id
                // 如果match不是null 那么selector是HTML或者#id 
                // !!注意：省略了对match[2]的判断 因为如果match存在 那么如果match[1]为undefined则match[2]必定为#id，完整写法为(match && (match[1] || match[2] && !context))
                if (match && (match[1] || !context)) {
                    // HANDLE: $(html) -> $(array)
                    // 4-1、参数selector是HTML代码
                    if (match[1]) {
                        // 修正context 如果context是jQuery对象则取第一个元素，若不是则不做修改
                        context = context instanceof jQuery ? context[0] : context;
                        // 修正doc 如果context不是document则设置为context的document，如果context是document（context.ownerDocument返回null）则设置为context
                        doc = (context ? context.ownerDocument || context : document);
    
                        // If a single string is passed in and it's a single tag
                        // just do a createElement and skip the rest
                        // 检测selector（HTML代码）是否是单独标签 rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/
                        ret = rsingleTag.exec(selector);
    
                        //  4-1-1、selector是单独标签，则调用document.createElement()创建标签对应的dom元素
                        if (ret) {
                            // context是props jQuery.isPlainObject用于检测context对象是否是‘纯粹’的对象，即用{}或者new Object()创建的
                            if (jQuery.prototype.isPlainObject(context)) {
                                // 把创建的DOM元素放入数组中，方便后期调用jQuery的.merge()方法    
                                selector = [document.createElement(ret[1])];
                                // 调用jQuery方法.attr()把context中的属性、事件设置到新创建的DOM元素上
                                // jQuery.fn.attr.call(selector, context, true);
                            // context不是props而是ownerDocument
                            } else {
                                selector = [doc.createElement(ret[1])];
                            }
    
                        // 4-1-2、selector是复杂标签 利用浏览器的innerHTML机制来创建DOM元素
                        } else {
                            ret = jQuery.buildFragment([match[1]], [doc]); 
                            // 创建过程由jQuery.buildFragment和jQuery.clean实现，方法jQuery.buildFragment的返回值格式为：
                            /**
                             * {
                             *   fragment:含有转换后的DOM元素的文档片段，
                             *   cacheable：HTML代码是否满足缓存条件
                             * }
                             */
                            // 如果HTML代码满足缓存条件，则在使用转换后的DOM元素时，必须先复制一份再使用，否则可以直接使用
                            selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
                        }
    
                        // return jQuery.merge(this, selector); // 将新建的selector对象数组合并到当前jQuery对象中并返回
                        return selector;// 将新建的selector对象数组合并到当前jQuery对象中并返回
    
                    // HANDLE: $("#id")
                    // 4-2、参数selector是#id且未指定参数context
                    } else {
                        elem = document.getElementById(match[2]);
    
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        // 检查elem的parentNode属性，因为Blackberry 4.6会返回已经不存在文档中的DOM节点
                        if (elem && elem.parentNode) {
                            // Handle the case where IE and Opera return items
                            // by name instead of ID
                            // 在IE6、IE7或者某些版本的opera浏览器中getElementById方法是按照name属性来查找元素的
                            // 如果查找到的元素的id值与传入的id值不相同，则调用Sizzle查找并返回一个含有选中元素的新jQuery对象
                            if (elem.id !== match[2]) {
                                return rootjQuery.find(selector);
                            }
    
                            // Otherwise, we inject the element directly into the jQuery object
                            this.length = 1;
                            this[0] = elem;
                        }
    
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
    
                // HANDLE: $(expr, $(...))
                // 4-3、参数selector是选择器表达式
                // 如果没有指定context或者context是jQuery对象
                } else if (!context || context.jquery) {
                    return (context || rootjQuery).find(selector);
    
                // HANDLE: $(expr, context)
                // (which is just equivalent to: $(context).find(expr)
                // 如果指定了上下文且上下文不是jQuery对象
                } else {
                    return this.constructor(context).find(selector);
                }
    
            // HANDLE: $(function)
            // Shortcut for document ready
            // 五、参数selector是函数 被认为是绑定ready事件
            } else if (jQuery.isFunction(selector)) {
                return rootjQuery.ready(selector); // $(function)是$(document).ready(function)的简写
            }
            // 六、参数selector是jQuery对象 会复制它的属性selector和context 206行会把参数selector中包含的选中元素引用，全部复制到当前jQuery对象中
            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }
            // 七、如果selector是数组或者伪数组（如jQuery对象），则都添加到当前jQuery对象中；
            // 如果selector是JavaScript对象，则作为第一个元素放入当前jQuery对象中；
            // 如果是其它类型的值，则作为第一个元素放入当前jQuery对象中。
            // 最后返回jQuery对象。
            return jQuery.makeArray(selector, this);
        },
        isPlainObject: function( obj ) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
                return false;
            }
    
            try {
                // Not own constructor property must be Object
                if ( obj.constructor &&
                    !hasOwn.call(obj, "constructor") &&
                    !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                    return false;
                }
            } catch ( e ) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }
    
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
    
            var key;
            for ( key in obj ) {}
    
            return key === undefined || hasOwn.call( obj, key );
        }
    };
    jQuery.fn.init.prototype = jQuery.fn;
    
    var rootjQuery = jQuery(document),
    quickExpr = /^(?:[^#<]* (<[\w\W]+>) [^>]*$ | #([\w\-]*)$)/,
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/
    console.log(jQuery());
    console.log(jQuery(document));
    console.log(jQuery('body'));
    console.log(jQuery());
    console.log(jQuery.prototype.isPlainObject); // function(){}
    console.log(jQuery('<div></div>')); // undefined
}