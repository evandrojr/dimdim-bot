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

function trade() {

    var cfg = {}

    cfg.precoBase = 930
    cfg.quantidadeVendaLtc = 0.05
    cfg.quantidadeCompraLtc = 0.01
    cfg.lucroMinimo = parseFloat(process.env.PROFITABILITY)
    cfg.precoMinimoVenda = Math.round(cfg.precoBase * (1 + parseFloat(process.env.PROFITABILITY)))
    cfg.precoMaximoCompra = Math.round(cfg.precoBase * (1 - parseFloat(process.env.PROFITABILITY)))

    console.log(cfg)
    // process.exit()

    infoApi.ticker((tick) => {
        tick = tick.ticker
        console.log(tick)

        // tick.last = parseFloat(tick.last)
        console.log(tick.last)

        // Vender
        if (tick.last >= cfg.precoMinimoVenda) {
            tradeApi.placeSellOrder(cfg.quantidadeVendaLtc, tick.last,
                (data) => {
                    console.log('Ordem de venda inserida no livro. ' + data)
                    process.exit();
                },
                (data) => {
                    console.log('Erro ao inserir ordem de venda no livro. ' + data)
                }
            )
        } else {
            console.log("Barato demais para vender, aguarde mais um pouco até alcançar " + cfg.precoMinimoVenda)
        }

        // Comprar
        if (tick.last <= cfg.precoMaximoCompra) {
            tradeApi.placeBuyOrder(cfg.quantidadeCompraLtc, tick.last,
                (data) => {
                    console.log('Ordem de compra inserida no livro. ' + data)
                    process.exit();
                },
                (data) => {
                    console.log('Erro ao inserir ordem de compra no livro. ' + data)
                }
            )
        } else {
            console.log("Caro demais para comprar, aguarde mais um pouco até alcançar " + cfg.precoMaximoCompra)
        }

    })
}




trade()
setInterval(() => {

    trade()

    },
    process.env.CRAWLER_INTERVAL
)
