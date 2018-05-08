// Save a reference to some core methods
var toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    indexOf = Array.prototype.indexOf

jQuery.fn = jQuery.prototype = { // 构造函数jQuery的原型对象 fn是prototype的简写，可以少写七个字符，以方便拼写
	constructor: jQuery, // 构造函数的属性constructor 指向jQuery构造函数
	init: function( selector, context, rootjQuery ) {},

    // Start with an empty selector
    // 用于记录jQuery查找和过滤DOM元素是的选择器表达式，但不一定是可执行的选择器表达式，该属性更多的是为了方便调试。
	selector: "",

    // The current version of jQuery being used
    // 表示正在使用的jQuery版本号。
	jquery: "1.7.1",

    // The default length of a jQuery object is 0
    // 表示当前jQuery对象中元素的个数。
	length: 0,

    // The number of elements contained in the matched element set
    // 返回当前jQuery对象中元素的个数。
	size: function() {
		return this.length;
	},
    // 将当前jQuery对象转换为真正的数组，转换后的数组包含了所有的元素。
	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
    // Get the whole matched element set as a clean array
    // 返回当前jQuery对象中指定位置的元素或者包含了全部元素的数组。如果没有传入参数，则调用toArray方法返回包含了所有元素的数组。
    // 如果传入了参数index，则返回一个单独的元素；参数index从0开始计算，并支持负数，负数表示从元素末尾开始计算。
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	// 原型方法.pushStack()创建一个新的空jQuery对象，然后把DOM元素集合放入这个jQuery对象中，并保留对当前jQuery对象的引用。 用于入栈。
	/**
	 *  原型方法.pushStack()是核心方法之一，它为以下方法提供支持：
		1、jQuery对象遍历：eq()、last()、first()、slice()、map()
		2、DOM查找、过滤：find()、not()、filter()、closest()、add()、andSelf()
		3、DOM遍历：parent()、parents()、parentsUntil()、next()、prev()、nextAll()、prevAll()、nextUnit()、prevUnit()、
		siblings()、children()、contents()
		4、DOM插入：jQuery.before()、jQuery.after()、jQuery.replaceWith()、append()、prepent()、before()、after()、replaceWith() 
	*/
	pushStack: function( elems, name, selector ) {
		/* 接收三个参数：
		1、elems：将放入新jQuery对象的元素数组（或类数组对象）。
		2、name：产生元素数组elems的jQuery方法名。
		3、selector：传给jQuery方法的参数，用于修正原型属性selector。 */
		// Build a new jQuery matched element set
		var ret = this.constructor(); // 相当于jQuery() 创建一个新的空jQuery对象。

		// 把参数elems合并到新jQuery对象ret中。
		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		// 在新jQuery对象ret上设置属性prevObject，指向当前jQuery对象，从而形成一个链式栈。】
		// 因此该方法也可以理解为：构建一个新的jQuery对象并入栈，新对象位于栈顶。
		ret.prevObject = this;

		ret.context = this.context;

		// 在新jQuery对象ret上设置属性selector，该属性不一定是合法的选择器表达式，更多的是为了方便调试。
		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {},

	eq: function( i ) {
		i = +i; // 转换为数字
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		// 先借用数组方法slice()从当前jQuery对象中获取指定范围的子集，再调用pushStack方法将子集转换为jQuery对象，
		// 同时通过属性prevObject保留了对当前jQuery对象的引用。
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") ); // 将新jQuery对象的selector修正 例如：div.slice(1, 2)
	},

    // 遍历当前jQuery对象，在每个元素上执行回调函数，并将回调函数的返回值放入一个新的jQuery对象中。
    // 该方法用于获取或设置DOM元素的集合。
    // 回调函数可以返回一个独立的数据项或者数据项数组，返回值将被插入结果集中。
    // 如果返回一个数组，则数组的每个元素会被插入到结果集中；如果返回值是null或者undefined，则不会插入任何元素。
	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem ); // 为了修正this，将this指向数组的当前元素后者对象的当前属性。
		}));
	},
	// 方法.end()结束当前链条中最近的查询操作，并将匹配元素集合还原为之前的状态。
	// .end()用于出栈。
	end: function() {
		// 返回前一个jQuery对象，如果属性prevObject不存在，则构建一个空的jQuery对象返回。
		return this.prevObject || this.constructor(null);
	},
	
	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	// 方法.push()、.sort()、.splice()仅在内部使用，都指向同名的数组方法，因此他们的参数、功能和返回值与数组方法完全一致。
	push: push,
	sort: [].sort,
	splice: [].splice
};

jQuery.extend({ // jQuery.extend()在jQuery构造函数上定义了一堆静态属性或方法
    // args is for internal usage only
    // 静态方法jQuery.each是一个通用的遍历迭代方法，用于无缝的遍历对象或数组。对于数组或类数组对象通过下标遍历，对于其他对象则通过属性名遍历。
    // 遍历过程中如果回调函数返回false，则结束遍历。
	each: function( object, callback, args ) {
        // 参数object：待遍历的对象或数组
        // 参数callback：回调函数，会在数组的每个元素或者对象的每个属性上执行。
        // 参数args：传给回调函数callback的参数数组，可选。如果没有传入参数args，则执行回调函数时会传入两个参数（下标或属性名，对应的元素或属性值），
        // 如果传入了args，则只把args传入callback。
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );
        // 传入了参数args
		if ( args ) {
            // 待遍历的是对象
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
                }
            // 待遍历的是数组
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

        // A special, fast, case for the most common use of each
        // 没有传入参数args
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
    },
    // arg is for internal usage only
    // 静态方法jQuery.map()对数组中的每个元素或对象的每个属性调用一个回调函数，并将回调函数的返回值放入一个新的数组中。
	map: function( elems, callback, arg ) {
        // 参数elems：待遍历的数组或对象。
        // 参数callback：回调函数，会在数组的每个元素或者对象的每个属性上执行。
        // 参数args：仅限于jQuery内部使用。如果调用map时传入了arg，则该参数会被传递给回调函数callback。
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
            isArray = elems instanceof jQuery  // elems是jQuery对象
                        || 
                        length !== undefined && typeof length === "number" && 
                        ( 
                            ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) // elems的length > 0 elems[0]和elems[length - 1]都存在
                            || length === 0 // elems的length值为0
                            || jQuery.isArray( elems )  // elems是真实的数组
                        );

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value; // ret.length 666
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

        // Flatten any nested arrays
        // 扁平化结果集ret中的元素，并返回。
		return ret.concat.apply( [], ret );
    }
})