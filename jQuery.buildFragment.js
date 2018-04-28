// 方法jQuery.buildFragment先创建一个文档片段DocumentFragment,然后调用方法jQuery.clean将HTML代码转化为DOM元素，并储存在创建的文档对象中
// 文档片段DocumentFragment表示文档的一部分但不属于文档树，当把DocumentFragment插入文档树时，
// 插入的不是DocumentFragment自身而是它的所有子孙节点，即可以一次向文档树中插入多个节点。
// 如果HTML代码符合缓存条件，方法jQuery.buildFragment会把转换后的DOM元素缓存起来，下次转换相同的HTML代码时直接从缓存中读取，不需要重复转换。
/**
 * jQuery.buildFragment(args, nodes, scripts)
 * 执行的关键步骤如下：
 * 1、如果HTML代码符合缓存条件，则尝试从缓存对象jQuery.fragments中读取缓存的DOM元素。
 * 2、创建文档片段DocumentFragment。
 * 3、调用方法jQuery.clean(elems, context, fragment, scripts)将HTML代码转换为DOM元素，并储存在创建的文档片段中。
 * 4、如果HTML代码符合缓存条件，则把转换后的DOM元素放入缓存对象jQuery.fragments。
 * 5、最后返回文档片段和缓存状态{fragment: fragment, cacheable: cacheable}。
 * 接收三个参数：
 * 1、参数args：数组，含有待转化为DOM元素的HTML代码。
 * 2、参数nodes：数组，含有文档对象、jQuery对象或DOM元素，用于修正创建文档片段DocumentFragment的文档对象。
 * 3、参数scripts：数组，用于存放HTML代码中的script元素。方法jQuery.buildFragment会把该参数传给方法jQuery.clean，后者把HTML代码转换为DOM元素后，
 * 会提取其中的script元素并存入数组scripts。方法domManip(args, table, callback)把转换后的DOM元素插入文档树后，会手动执行数组scripts中的元素。
*/

jQuery.buildFragment = function (args, nodes, scripts) {

	/**↓↓↓↓-----------------------------------------------定义局部变量*/
	// 变量fragment指向稍后可能创建的文档片段DocumentFragment。变量cacheable表示HTML代码是否符合缓存条件。
	// 变量cacheresults指向从缓存对象jQuery.fragments中取到的文档片段，其中包含了缓存的DOM元素。变量doc表示创建文档片段的文档对象。
	var fragment, cacheable, cacheresults, doc,
		first = args[0];
	/**↑↑↑↑-----------------------------------------------定义局部变量*/



	/**↓↓↓↓----------------------------------------------------------------修正文档对象doc*/
	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	// 数组nodes可能包含一个明确的文档对象，也可能包含jQuery对象或者DOM元素。
	if (nodes && nodes[0]) {
		// 读取nodes[0]的ownerDocument属性并赋值给doc，如果nodes[0].ownerDocument不存在则假定nodes[0]是document对象并赋值给doc。
		doc = nodes[0].ownerDocument || nodes[0];
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	// 检查doc.createDocumentFragment是否存在，若不存在则将document赋值给doc。
	if (!doc.createDocumentFragment) {
		doc = document;
	}
	/**↑↑↑↑-----------------------------------------------------------------修正文档对象doc*/



	/**↓↓↓↓-----------------------从缓存对象jQuery.fragments中读取缓存的DOM元素 */
	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	/**
	 * HTML代码必须满足以下所有条件，才符合缓存条件：
	 * 数组args的长度为1，且第一个元素是字符串，即数组args中只含有一段HTML代码。
	 * HTML的长度小于512（1/2KB），否则可能导致缓存占用的内存过大。
	 * 文档对象doc是当前文档对象，即只缓存为当前文档创建的DOM元素，不缓存其他框架（iframe）的。
	 * HTML代码中不能含有这些标签：<script>、<object>、<embed>、<option>、<style>。
	 * 当前浏览器可以正确复制单选按钮或复选框的选中状态checked，或者HTML代码中的单选按钮或复选框没有被选中。
	 * 当前浏览器可以正确复制HTML5元素，或者HTML代码中不含有HTML5标签。
	 */
	// 	rnocache = /<(?:script|object|embed|option|style)/i,
	// 	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	// 	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	//  nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
	// "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",

	if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
		first.charAt(0) === "<" && !rnocache.test(first) &&
		(jQuery.support.checkClone || !rchecked.test(first)) &&
		(jQuery.support.html5Clone || !rnoshimcache.test(first))) {
		// 如果HTML代码满足缓存条件，则设置变量cacheable为true。在使用转换后的DOM元素时，如果变量chacheable为true，
		// 则必须先复制一份再使用，否则可以直接使用。
		cacheable = true;
		// 尝试从缓存中读取DOM元素
		cacheresults = jQuery.fragments[first];
		// 如果命中缓存，且缓存不是1，则表示读取到的是文档片段
		if (cacheresults && cacheresults !== 1) {
			// 赋值给变量fragment
			fragment = cacheresults;
		}
	}
	/**↑↑↑↑------------------------从缓存对象jQuery.fragments中读取缓存的DOM元素 */



	/**↓↓↓↓-------------转化HTML代码为DOM元素 */
	// !fragment为true可能的三种情况：1、HTML代码不符合缓存条件。2、HTML代码符合缓存条件但此时是第一次转换，没有对应的缓存。
	// 3、HTML代码符合缓存条件但此时是第二次转换，对应的缓存是1。
	if (!fragment) {
		fragment = doc.createDocumentFragment();
		jQuery.clean(args, doc, fragment, scripts);
	}
	/**↑↑↑↑-------------转化HTML代码为DOM元素 */

	


	/**↓↓↓↓-------------把转化后的DOM元素放入缓存对象jQuery.fragments */
	if (cacheable) {
		jQuery.fragments[first] = cacheresults ? fragment : 1;
	}
	/**↑↑↑↑-------------把转化后的DOM元素放入缓存对象jQuery.fragments */



	return { fragment: fragment, cacheable: cacheable }; // 返回文档片段和缓存状态
};