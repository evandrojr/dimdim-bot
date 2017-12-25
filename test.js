const UtilClass = require("./util").Util
var U = new UtilClass()


var i = new Date()
console.log(i)

U.pararPorSegundos(2);

var f = new Date()
console.log(f)
console.log(f-i)
