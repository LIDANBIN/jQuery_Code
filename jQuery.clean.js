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
        // 用于检测script元素是否可执行
        var checkScriptType;

        // 修正文档对象 为了方便直接调用jQuery.clean()转化HTML代码为DOM元素。
        context = context || document;
        // !context.createElement fails in IE with an error but returns typeof 'object'
        if (typeof context.createElement === "undefined") {
            context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
        }

        // 变量ret用来存放转化后的DOM元素
        var ret = [], j;

        // 遍历待转换的HTML代码数组elems
        // 定义循环变量elem并赋值，判断elem的有效性，使用!=过滤掉null和undefined不会过滤掉整型数字0
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            // 如果elem是数字则将它转换为字符串，为了简化之后对elem的有效性和类型的判断。牛逼！
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
                if (!rhtml.test(elem)) { // 	rhtml = /<|&#?\w+;/ 1、文本节点
                    elem = context.createTextNode(elem);
                } else { // 2、一组元素集合
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
                    /**
                     * 将临时div元素插入到安全文档片段中的目的是为了使低版本（IE9以下）浏览器能够正确解析和渲染HTML5标签。
                    * IE9以下的浏览器如果遇到未知标签，浏览器会向DOM树中插入一个没有子元素的空元素。解决办法就是在使用未知标签之前
                    * 调用document.createElement('未知标签')创建一个对应的DOM元素，这样就能是浏览器正确解析和渲染这个未知标签。
                    * */
                    // 如果传入的文档对象是当前文档对象，则把临时div元素插入已创建的安全文档片段safeFragment中。
                    if (context === document) {
                        // Use the fragment we've already created for this document
                        safeFragment.appendChild(div);
                        // 否则调用函数createSafeFragment在文档对象context上创建一个新的[安全]文档片段，然后插入临时div元素。
                    } else {
                        // Use a fragment created with the owner document
                        createSafeFragment(context).appendChild(div);
                    }

                    // Go to html and back, then peel off extra wrappers
                    // 利用浏览器的innerHTML机制将HTML代码转化为DOM元素

                    // 先为HTML代码包裹必要的父标签，然后赋值给临时div元素的innerHTML属性，从而将HTML代码转化为DOM元素。
                    div.innerHTML = wrap[1] + elem + wrap[2];

                    // Move to the right depth
                    // 层层剥去包裹的父元素，得到转换后的DOM元素。 若depth = 0则不执行该循环中的语句
                    // 例如：elem是option 那么div.innerHTML = <select multiple='multiple'><option></option></select> depth = 1
                    // while循环会被执行一次 div = <select multiple='multiple'><option></option></select>
                    // 例如：elem是td 那么div.innerHTML = <table><tbody><tr><td></td></tr></tbody></table> depth = 3
                    // while循环会被执行三次 div = <tr><td></td></tr>
                    while (depth--) {
                        div = div.lastChild;
                    }

                    // Remove IE's autoinserted <tbody> from table fragments
                    // 移除IE6、IE7自动插入的空tbody元素。空元素指没有子元素的元素。
                    if (!jQuery.support.tbody) {

                        // String was a <table>, *may* have spurious <tbody>
                        // 用正则表达式检查HTML代码中是否含有tbody标签 	rtbody = /<tbody/i,
                        var hasBody = rtbody.test(elem),

                            // ！！提取IE6、IE7自动插入的空tbody元素

                            // 如果HTML代码中左边起第一个标签是<table>，且没有tbody标签（tag = table，wrap = [0, '', '']，depth = 0，div = div）
                            // 那么浏览器生成DOM元素时可能自动插入空tbody元素。此时div指向创建的临时div元素，
                            // div.firstChild指向table元素，div.firstChild.childNodes则可能是tbody、thead、tfoot、colgroup、caption中的一个或多个
                            // tbody = div.firstChild.childNodes
                            tbody = tag === "table" && !hasBody ?
                                div.firstChild && div.firstChild.childNodes :

                                // String was a bare <thead> or <tfoot>
                                // 如果HTML代码外部包裹了父标签table，且没有tbody标签，那么浏览器生成DOM元素时可能自动插入空tbody元素。
                                // （tag = thead、tfoot...，wrap = [1, "<table>", "</table>"]，depth = 1，div = <table>...</table>）while循环被执行一次
                                //  tbody = div.childNodes
                                wrap[1] === "<table>" && !hasBody ?
                                    div.childNodes :
                                    // 如果以上条件均不满足，则浏览器生成DOM元素时不会插入空的tbody元素
                                    [];
                        // 遍历数组tbody，移除空tbody元素，非空tbody元素不会被移除。
                        for (j = tbody.length - 1; j >= 0; --j) {
                            // 先判断tbody[j]是否是tbody元素，再对tbody[j]是否是空元素进行防御性检查，以防万一。
                            if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
                                // 移除
                                tbody[j].parentNode.removeChild(tbody[j]);
                            }
                        }
                    }

                    // IE completely kills leading whitespace when innerHTML is used
                    // 插入IE6、IE7、IE8自动剔除的前导空白符 	rleadingWhitespace = /^\s+/,
                    if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                        // 提取出HTML代码中的前导空白符创建文本节点，插入到div的第一个子元素前。
                        div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                    }
                    // 取到转换后的DOM元素集合
                    elem = div.childNodes;
                }
            }
            // ↑↑↑↑jQuery.clean()的核心代码---------------------------------------------------------------


            // Resets defaultChecked for any radios and checkboxes
            // about to be appended to the DOM in IE 6/7 (#8060)
            // 在IE6、IE7中修正复选框和单选按钮的选中状态
            var len;
            if (!jQuery.support.appendChecked) {
                // 遍历转换后的DOM元素集合，在每个元素上调用函数findInputs(elem)
                if (elem[0] && typeof (len = elem.length) === "number") {
                    for (j = 0; j < len; j++) {
                        findInputs(elem[j]);
                    }
                } else {
                    findInputs(elem);
                }
            }

            // 合并转换后的DOM元素
            // elem的值存在两种情况：1、文本节点 2、含有一组元素集合的伪数组对象
            if (elem.nodeType) {
                ret.push(elem);
            } else {
                ret = jQuery.merge(ret, elem);
            }
        }

        // 如果传入了文档片段fragment
        if (fragment) {
            // 初始化变量checkScriptType为一个函数，用于检测script元素是否可执行。 rscriptType = /\/(java|ecma)script/i
            // 如果一个script元素没有指定type或者属性type的值含有/javascript后者/ecmascript，则认为是可执行的。
            checkScriptType = function (elem) {
                return !elem.type || rscriptType.test(elem.type);
            };
            // 遍历数组ret，提取所有（包括子元素）合法的script元素存入数组scripts，其他元素则插入文档片段fragment。
            for (i = 0; ret[i]; i++) {
                // 如果调用jQuery.clean()方法时传入了数组scripts，并找到了合法的script元素，则将该元素从父元素中移除，然后存入数组scripts
                if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
                    scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);
                } else {
                    // 提取当前元素所包含的script元素，并把其中可执行的插入数组ret，插入位置在当前位置之后，以便继续执行上面步骤的检测和提取
                    if (ret[i].nodeType === 1) {
                        var jsTags = jQuery.grep(ret[i].getElementsByTagName("script"), checkScriptType);
                        ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
                    }
                    // 把除了合法script元素之外的所有元素插入文档片段
                    fragment.appendChild(ret[i]);
                }
            }
        }

        // 返回转换后的DOM元素数组
        return ret;
    }
});

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
    "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video";

function createSafeFragment(document) {
    var list = nodeNames.split("|"),
        safeFrag = document.createDocumentFragment();

    if (safeFrag.createElement) {
        while (list.length) {
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

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked(elem) {
    if (elem.type === "checkbox" || elem.type === "radio") {
        elem.defaultChecked = elem.checked;
    }
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs(elem) {
    var nodeName = (elem.nodeName || "").toLowerCase();
    if (nodeName === "input") {
        fixDefaultChecked(elem);
        // Skip scripts, get other children
    } else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") {
        jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
    }
}