// 用于合并两个或多个对象的属性到第一个对象
// jQuery.extend[deep,] target, object1[, objectN] = jQuery.fn.extend([deep,] target, object1[, ...objectN])
// deep是可选的布尔值，表示是否深度合并（即递归合并），默认不递归。
// 如果第一个参数是一个数组或对象，它会被第二个或者后面参数的同名属性完全覆盖。
// target是目标对象，object1和objectN是源对象。如果仅提供一个对象，那么target将被忽略。
/**
 * 执行步骤如下：
 * 1、修正参数deep、target、源对象的起始下标。
 * 2、逐个遍历源对象。
 *  ⅰ、遍历源对象的属性。
 *  ⅱ、覆盖目标对象的同名属性；如果是深度合并，则先递归调用jQuery.extend。
 */
// 因为参数是不确定的，可以有任意多个，所以没有列出可接受的参数。
jQuery.extend = jQuery.fn.extend = function() {
    // 定义局部变量：options：指向某个源对象；name：表示某个源对象的某个属性名；src：表示目标对象的某个属性的原始值；
    // copy：表示某个源对象的某个属性的值；copyIsArray：指示变量copy是否是数组；clone：表示深度复制时原始值的修正值；
    // target：指向目标对象；i：表示源对象的起始下标；length：表示参数的个数，用于修正变量target；deep：指示是否执行深度复制。
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

    // Handle a deep copy situation
    // 如果第一个参数是布尔值，则修正第一个参数为deep，修正第二个参数为目标对象target，并期望源对象从第三个参数开始。
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	// 如果目标对象target不是对象也不是函数，而是字符串或者其他的基本类型，则统一替换成空对象{}，因为在基本对象上设置非原生属性是无效的。
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	// 如果没有传入源对象，则把jQuery或jQuery.fn作为目标对象，并把传入的对象当做源对象
	// length等于i可能的两种情况：1、只传入了一个参数 2、传入了两个参数，第一个是布尔值
	if ( length === i ) {
		target = this;
		--i; // 此时i = 0或1
	}

	// 逐个遍历源对象 循环变量i表示源对象开始的下标 （牛逼）
	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		// 过滤掉值为null或者undefined的元素
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			// 遍历单个源对象的属性
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				// 如果复制值和目标值相等，为了避免深度遍历时死循环，因此不会覆盖目标对象的同名属性。
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				// 如果是深度合并，且赋值值copy是普通JavaScript对象或数组，则递归合并。
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					// 修正原始值副本clone
					// copy是数组
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];
					// copy是对象
					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					// 先把copy值递归合并到原始值副本clone中，然后覆盖目标对象的同名属性。
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				// 如果不是深度合并，且复制值copy不是undefined，则直接覆盖目标对象的同名属性。
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};