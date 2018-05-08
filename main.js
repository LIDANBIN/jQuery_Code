window.onload = function () {
    // console.log(document.createElement);
    // console.log(undefined === null);
    // console.log(undefined == null);
    // console.log($());
    // console.log(jQuery('body'));
    // console.log(jQuery(document));
    // console.log(jQuery('<div></div>'));
    var A = function() {

    }
    A.prototype.name = 'aaa'
    var b = new A();
    console.log(b.name) // aaa
    this.console.log(A.name) // A
    // console.log(jQuery.prototype.isPlainObject); // function(){}
    // console.log(jQuery.isPlainObject); // undefined

    console.log(Array);
}