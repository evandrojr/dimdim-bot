//index.js
require("dotenv-safe").load()
const MercadoBitcoin = require("./api").MercadoBitcoin
const MercadoBitcoinTrade = require("./api").MercadoBitcoinTrade
var infoApi = new MercadoBitcoin({ currency: 'LTC' })
var tradeApi = new MercadoBitcoinTrade({
    currency: 'LTC',
    key: process.env.KEY,
    secret: process.env.SECRET,
    pin: process.env.PIN
})

function getQuantity(coin, price, isBuy, callback) {
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


// tradeApi.getAccountInfo(response_data => {
//     console.log(response_data);
//     process.exit();
// })

// getQuantity('LTC', 1, false, (qty) => {
//     console.log(qty)
//     process.exit();
// })


// Baby step 1
// Fixar um valor em reais e um valor em LTC para comprar ou vender
// Reais 10
// LTC 0,01

var cfg = {}

cfg.precoBase = 1000
cfg.quantidadeVendaLtc = 0.01
cfg.quantidadeCompraLtc = 0.01
cfg.precoMinimoVenda = cfg.precoBase * (1 + parseFloat(process.env.PROFITABILITY))
cfg.precoMaximoCompra = cfg.precoBase * (1-parseFloat(process.env.PROFITABILITY))

console.log(cfg)
// process.exit()

infoApi.ticker((tick) => {
    console.log(tick)

    // Vender
    if (tick.last >= cfg.precoMinimoVenda) {
        tradeApi.placeSellOrder(cfg.quantidadeVendaLtc, ticker.last,
            (data) => {
                console.log('Ordem de venda inserida no livro. ' + data)
                process.exit();
            },
            (data) => {
                console.log('Erro ao inserir ordem de venda no livro. ' + data)
                process.exit(1);
            }
        )
    }else{
        console.log("Barato demais para vender, aguarde mais um pouco")
    }

    // Comprar
    if (tick.last <= cfg.precoMaximoCompra) {
        tradeApi.placeBuyOrder(cfg.quantidadeCompraLtc, ticker.last,
            (data) => {
                console.log('Ordem de venda inserida no livro. ' + data)
                process.exit();
            },
            (data) => {
                console.log('Erro ao inserir ordem de venda no livro. ' + data)
                process.exit(1);
            }
        )
    }else{
        console.log("Caro demais para comprar, aguarde mais um pouco")
    }

})

// setInterval(() =>
//     infoApi.ticker((tick) => {
//         console.log(tick)

//         // Vender
//         if (ticker.last >= precoBase * parseFloat(process.env.PROFITABILITY)) {
//             tradeApi.placeSellOrder(0.01, ticker.last,
//                 (data) => {
//                     console.log('Ordem de venda inserida no livro. ' + data)
//                     process.exit();
//                 },
//                 (data) => {
//                     console.log('Erro ao inserir ordem de venda no livro. ' + data)
//                     process.exit(1);
//                 }
//             )
//         }

//         if (ticker.last <= precoBase - (precoBase * parseFloat(process.env.PROFITABILITY))) {
//             tradeApi.placeBuyOrder(quantidadeCompraLtc, ticker.last,
//                 (data) => {
//                     console.log('Ordem de venda inserida no livro. ' + data)
//                     process.exit();
//                 },
//                 (data) => {
//                     console.log('Erro ao inserir ordem de venda no livro. ' + data)
//                     process.exit(1);
//                 }
//             )
//         }

//     }),
//     process.env.CRAWLER_INTERVAL
// )
