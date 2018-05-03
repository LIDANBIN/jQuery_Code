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
    // 修正目标对象target、源对象起始下标i
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};