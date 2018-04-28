# jQuery源码解读笔记

## 一、构造jQuery对象 jQuery.fn.init
调用构造函数时传入的参数不同，创建jQuery对象的逻辑也会随之不同。
> 构造函数jQuery有七种不同的方法：
1. `jQuery(selector[,context])`接受一个css选择器表达式和可选的选择器上下文，返回一个包含了匹配的DOM元素的jQuery对象
1. `jQuery(html [,ownerDocument])`、`jQuery(html[,props])`用提供的HTML代码创建元素
1. `jQuery(element)`、`jQuery(elementArray)`封装DOM元素为jQuery对象
1. `jQuery(object)`封装普通对象为jQuery对象
1. `jQuery(callback)`绑定ready事件监听函数，当DOM结构加载完成时执行
1. `jQuery(jQuery object)`接受一个jQuery对象，返回该jQuery对象的拷贝副本
1. `jQuery()`创建一个空jQuery对象

## 二、jQuery.buildFragment
方法`jQuery.buildFragment`先创建一个文档片段`DocumentFragment`，然后调用方法`jQuery.clean`将`HTML`代码转化为`DOM`元素，并储存在创建的文档对象中。文档片段`DocumentFragment`表示文档的一部分但不属于文档树，当把DocumentFragment插入文档树时，插入的不是`DocumentFragment`自身而是它的所有子孙节点，即可以一次向文档树中插入多个节点。<br/>
> 执行的关键步骤如下：
1. 如果`HTML`代码符合缓存条件，则尝试从缓存对象`jQuery.fragments`中读取缓存的`DOM`元素。
1. 创建文档片段`DocumentFragment`。
1. 调用方法`jQuery.clean(elems, context, fragment, scripts)`将HTML代码转换为DOM元素，并储存在创建的文档片段中。
1. 如果`HTML`代码符合缓存条件，则把转换后的`DOM`元素放入缓存对象`jQuery.fragments`。
1. 最后返回文档片段和缓存状态`{fragment: fragment, cacheable: cacheable}`。
