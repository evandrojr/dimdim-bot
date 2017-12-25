"use strict";


var Util = function () {}

Util.prototype = {
    pararPorSegundos: function (segundos) {
        for(i=0; i < segundos * 500000000; ++i){}
        return true;
    },

    getQuantity: function (coin, price, isBuy, callback) {
        price = parseFloat(price)
        coin = isBuy ? 'brl' : coin.toLowerCase()

        tradeApi.getAccountInfo((response_data) => {
            var balance = parseFloat(response_data.balance[coin].available).toFixed(5)
            balance = parseFloat(balance)
            if (coin != 'ltc') {
                if (isBuy && balance < 50) return console.log('Sem saldo disponível para comprar!')
            }
            console.log(`Saldo disponível de ${coin}: ${balance}`)

            if (isBuy) balance = parseFloat((balance / price).toFixed(5))
            callback(parseFloat(balance) - 0.00001)//tira a diferença que se ganha no arredondamento
        },
            (data) => console.log(data))
    }
}

module.exports = {
    Util
}