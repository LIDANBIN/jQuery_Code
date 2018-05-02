// jQuery.clean(elems, context, fragment, scripts)负责把HTML代码转化成DOM元素，并提取其中的script元素。
// 该方法临时创建一个div元素，并将其插入一个安全文档片段中，然后把HTML代码赋值给div元素的innerHTML属性，
// 浏览器会自动生成DOM元素，最后解析div元素的子元素得到转换后的DOM元素。
/**
 * 方法jQuery.clean执行的步骤如下：
 * 1、创建一个临时div元素，并插入到一个安全文档片段中。
 * 2、为HTML代码包裹必要的父标签，然后赋值给临时div元素的innerHTML属性，从而将HTML代码转换为DOM元素，
 * 之后再层层剥去包裹的父元素，得到转换后的DOM元素。
 * 3、移除IE6、IE7自动插入的空tbody元素，插入IE6、IE7、IE自动剔除的前导空白符。
 * 4、取到转换后的DOM元素集合。
 * 5、在IE6、IE7中修复复选框和单选按钮的选中状态。
 * 6、合并转换后的DOM元素。
 * 7、如果传入了文档片段fragment，则提取所有合法的script元素存入数组scripts，并把其他元素插入文档片段fragment。
 * 8、最后返回转换后的DOM元素数组。
 */
jQuery.extend({
    /**
     * jQuery.clean接收四个参数：
     * 1、参数elems：数组，包含了待转化的HTML代码。
     * 2、参数context：文档对象，该参数在jQuery.buildFragment中被修正为正确的文档对象，
     * 稍后会调用它的方法createTextNode()创建文本节点、调用createElement()创建临时div元素。
     * 3、参数fragment：文档片段，作为存放转换后的DOM元素的占位符，该参数在jQuery.buildFragment中被创建。
     * 4、参数scripts：数组，用于存放转换后的DOM元素中的script元素。
     */
    clean: function (elems, context, fragment, scripts) {
        var checkScriptType;

        // 修正文档对象 为了方便直接调用jQuery.clean()转化HTML代码为DOM元素。
        context = context || document;

        // !context.createElement fails in IE with an error but returns typeof 'object'
        if (typeof context.createElement === "undefined") {
            context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
        }

        // 遍历待转换的HTML代码数组elems
        // 变量ret用来存放转化后的DOM元素
        var ret = [], j;

        // 开始遍历待转化的HTML代码数组
        // 定义循环变量elem并赋值，判断elem的有效性，使用!=过滤掉null和undefined不会过滤掉整型数字0
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            // 如果elem是数字则将它转换为字符串，为了简化之后对elem的有效性和类型的判断。
            if (typeof elem === "number") {
                elem += "";
            }
            // 如果!elem为true，即elem可以转换为false，那么跳过本次循环，执行下一次循环。用于过滤空字符串的情况。
            if (!elem) {
                continue;
            }


            // ↓↓↓↓jQuery.clean()的核心代码---------------------------------------------------------------
            // Convert html string into DOM nodes
            // 如果elem是字符串，即HTML代码，则开始转换HTML代码为DOM元素。
            if (typeof elem === "string") {
                // 如果标签中不包含字符代码、数字代码和标签代码，则调用原生方法document.createTextNode()创建文本节点。
                if (!rhtml.test(elem)) { // 	rhtml = /<|&#?\w+;/
                    elem = context.createTextNode(elem);
                } else {
                    // Fix "XHTML"-style tags in all browsers
                    // 修正自关闭标签 rxhtmlTag = / < (?!area|br|col|embed|hr|img|input|link|meta|param) ( ([\w:]+) [^>]*) \/ > /ig
                    // ?!p是反前向声明，要求接下来的字符不与模式p匹配
                    elem = elem.replace(rxhtmlTag, "<$1></$2>");

                    // Trim whitespace, otherwise indexOf won't work as expected
                    // 创建一个临时div
                    // 提取HTML代码中的标签部分，删除了前导空白符和左尖括号，并转换为小写赋值给变量wrap  rtagName = /<([\w:]+)/
                    var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(),
                        wrap = wrapMap[tag] || wrapMap._default,
                        // 取出被包裹的深度赋值给变量depth，稍后将依据该变量层层剥去包裹的父元素
                        depth = wrap[0],
                        // 创建一个临时的div元素，稍后它将会被添加到一个安全文档片段中，并且它的innerHTML属性会被设置成待转换的HTML代码。
                        div = context.createElement("div");

                    // Append wrapper element to unknown element safe doc fragment
                    // 如果传入的文档对象是当前文档对象，则把临时div元素插入已创建的安全文档片段safeFragment中。
                    if (context === document) {
                        // Use the fragment we've already created for this document
                        safeFragment.appendChild(div);
                    // 否则调用函数createSafeFragment在文档对象context上创建一个新的安全文档片段，然后插入临时div元素。
                    } else {
                        // Use a fragment created with the owner document
                        createSafeFragment(context).appendChild(div);
                    }

                    // Go to html and back, then peel off extra wrappers
                    // 利用浏览器的innerHTML机制将HTML代码转化为DOM元素

                    // 先为HTML代码包裹必要的父标签，然后赋值给临时div元素的innerHTML属性，从而将HTML代码转化为DOM元素。
                    div.innerHTML = wrap[1] + elem + wrap[2];

                    // Move to the right depth
                    // 层层剥去包裹的父元素，得到转换后的DOM元素。
                    while (depth--) {
                        div = div.lastChild;
                    }

                    // Remove IE's autoinserted <tbody> from table fragments
                    // 移除IE6、IE7自动插入的空tbody元素。空元素指没有子元素的元素。
                    if (!jQuery.support.tbody) {

                        // String was a <table>, *may* have spurious <tbody>
                        // 用正则表达式检查HTML代码中是否含有tbody标签
                        var hasBody = rtbody.test(elem),
                            // 提取IE6、IE7自动插入的空tbody元素
                            tbody = tag === "table" && !hasBody ?
                                div.firstChild && div.firstChild.childNodes :

                                // String was a bare <thead> or <tfoot>
                                wrap[1] === "<table>" && !hasBody ?
                                    div.childNodes :
                                    [];

                        for (j = tbody.length - 1; j >= 0; --j) {
                            if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
                                tbody[j].parentNode.removeChild(tbody[j]);
                            }
                        }
                    }

                    // IE completely kills leading whitespace when innerHTML is used
                    if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                        div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                    }

                    elem = div.childNodes;
                }
            }
            // ↑↑↑↑jQuery.clean()的核心代码---------------------------------------------------------------


            // Resets defaultChecked for any radios and checkboxes
            // about to be appended to the DOM in IE 6/7 (#8060)
            var len;
            if (!jQuery.support.appendChecked) {
                if (elem[0] && typeof (len = elem.length) === "number") {
                    for (j = 0; j < len; j++) {
                        findInputs(elem[j]);
                    }
                } else {
                    findInputs(elem);
                }
            }

            if (elem.nodeType) {
                ret.push(elem);
            } else {
                ret = jQuery.merge(ret, elem);
            }
        }

        if (fragment) {
            checkScriptType = function (elem) {
                return !elem.type || rscriptType.test(elem.type);
            };
            for (i = 0; ret[i]; i++) {
                if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
                    scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);

                } else {
                    if (ret[i].nodeType === 1) {
                        var jsTags = jQuery.grep(ret[i].getElementsByTagName("script"), checkScriptType);

                        ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
                    }
                    fragment.appendChild(ret[i]);
                }
            }
        }

        return ret;
    }
});

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video";
        
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


// 数组中的元素依次是：包裹的深度，包裹的父标签，父标签对应的关闭标签
var wrapMap = {
        option: [1, "<select multiple='multiple'>", "</select>"], // 如果是被包含在单选selector中那么option元素的selected属性会默认被设置为true
        legend: [1, "<fieldset>", "</fieldset>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        area: [1, "<map>", "</map>"],
        _default: [0, "", ""]
    },
    safeFragment = createSafeFragment(document);

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
// 在IE9以下的浏览器中，不能序列化标签<link>和<script>，即通过浏览器的innerHTML机制不能将其转换为对应的link元素和script元素
// 此时测试项jQuery.support.htmlSerialize为false，解决方案是在标签<link>和<script>外包裹一层元素再转换，包裹的元素定义在wrapMap._default中。
if (!jQuery.support.htmlSerialize) {
    wrapMap._default = [1, "div<div>", "</div>"];
}