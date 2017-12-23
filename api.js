//MERCADO BITCOIN
const unirest = require('unirest')
const crypto  = require('crypto')
const qs      = require('querystring')

const ENDPOINT_API = 'https://www.mercadobitcoin.com.br/api/'
const ENDPOINT_TRADE_PATH = "/tapi/v3/"
const ENDPOINT_TRADE_API = 'https://www.mercadobitcoin.net' + ENDPOINT_TRADE_PATH

var MercadoBitcoin = function (config) {
    this.config = {
        CURRENCY: config.currency
    }
}

MercadoBitcoin.prototype = {

    ticker: function (success) {
        this.call('ticker', success);
    },

    orderBook: function (success) {
        this.call('orderbook', success);
    },

    trades: function (success) {
        this.call('trades', success);
    },

    call: function (method, success) {

        unirest.get(ENDPOINT_API + this.config.CURRENCY + '/' + method)
            .headers('Accept', 'application/json')
            .end(function (response) {
                try{
                    success(JSON.parse(response.raw_body));
                }
                catch(ex){ console.log(ex)}
        });
    }
}

var MercadoBitcoinTrade = function (config) {
    this.config = {
        KEY: config.key,
        SECRET: config.secret,
        PIN: config.pin,
        CURRENCY: config.currency
    }
}

MercadoBitcoinTrade.prototype = {

    getAccountInfo: function(success, error) {
        this.call('get_account_info', {}, success, error)
    },

    listMyOrders: function (parameters, success, error) {
        this.call('list_orders', parameters, success, error)
    },

    placeBuyOrder: function(qty, limit_price, success, error){
        this.call('place_buy_order', {coin_pair: `BRL${config.CURRENCY}`, quantity: (''+qty).substr(0,10), limit_price: ''+limit_price}, success, error)
    },

    placeSellOrder: function(qty, limit_price, success, error){
        this.call('place_sell_order', {coin_pair: `BRL${config.CURRENCY}`, quantity: (''+qty).substr(0,10), limit_price: ''+limit_price}, success, error)
    },

    cancelOrder: function (orderId, success, error) {
        this.call('cancel_order', {coin_pair: `BRL${config.CURRENCY}`, order_id: orderId}, success, error)
    },

    call: function (method, parameters, success, error) {

        var now = Math.round(new Date().getTime() / 1000)
        var queryString = qs.stringify({'tapi_method': method, 'tapi_nonce': now})
        if(parameters) queryString += '&' + qs.stringify(parameters)

        var signature = crypto.createHmac('sha512', this.config.SECRET)
                            .update(ENDPOINT_TRADE_PATH + '?' + queryString)
                            .digest('hex')

        unirest.post(ENDPOINT_TRADE_API)
            .headers({'TAPI-ID': this.config.KEY})
            .headers({'TAPI-MAC': signature})
            .send(queryString)
            .end(function (response) {
                if(response.body){
                    if (response.body.status_code === 100 && success)
                        success(response.body.response_data)
                    else if(error)
                        error(response.body.error_message)
                    else
                        console.log(response.body)
                }
                else console.log(response)
            })
    }
}

module.exports = {
    MercadoBitcoin,
    MercadoBitcoinTrade
}