"use strict";
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

const UtilClass = require("./util").Util
var U = new UtilClass()


// tradeApi.getAccountInfo(response_data => {
//     console.log(response_data);
//     process.exit();
// })

// getQuantity('LTC', 1, false, (qty) => {
//     console.log(qty)
//     process.exit();
// })

// TODO avaliar disponibilidade antes de executar a operação

var d = {}
d.env = "test" // test | production
d.crawlerIntevalo = 20000 // Em milisegundos
d.quantidadeVendaLtc = 0.01
d.quantidadeCompraLtc = 0.006
d.lucroMinimo = 0.02
d.tradesExecutionMax = 5000

if (d.lucroMinimo < 0.0065 && d.env != "test") {
    console.log("Lucro muito baixo para produção");
    process.exit(1);
}

function definirPrecos(d, lastPrice) {
    d.precoBase = lastPrice
    d.precoMinimoVenda = d.precoBase * (1 + parseFloat(d.lucroMinimo))
    d.precoMaximoCompra = d.precoBase * (1 - parseFloat(d.lucroMinimo))
    let precos = {}
    precos.precoBase = d.precoBase
    precos.precoMinimoVenda = d.precoMinimoVenda
    precos.precoMaximoCompra = d.precoMaximoCompra
    console.log("Novos preços obtidos: ");
    console.log(precos)
}

async function calcularDefinicoesVariaves(d) {
    return new Promise(resolve => {
        infoApi.ticker((tick) => {
            definirPrecos(d, parseFloat(tick.ticker.last))
            resolve(d);
        })
    })
}


async function tentarTrade() {
    // return new Promise(resolve => {


        if (!d.tradeExecution && d.tradeExecution != 0 || !d.tradesExecutionMax || d.tradesExecution > d.tradesMax) {
            console.log("Número máximo de trades executados, finalizando... bom lucro!");
            console.log(d)
            process.exit(0)
        }

        console.log(d)
        await infoApi.ticker((tick) => {
            tick = tick.ticker
            console.log(tick)
            // console.log(tick.last)

            // Vender
            if (tick.last >= d.precoMinimoVenda) {
                if (d.env === "test") {
                    console.log(`SIMULAÇÃO - Criada ordem de venda ${d.quantidadeVendaLtc} por ${tick.last}`)
                    console.log('SIMULAÇÃO - Ordem de venda inserida no livro.')
                    d.tradeExecution++;
                    definirPrecos(d, tick.last)
                }
                if (d.env === "production") {
                    tradeApi.placeSellOrder(d.quantidadeVendaLtc, tick.last,
                        (data) => {
                            console.log(`Criada ordem de venda ${d.quantidadeVendaLtc} por ${tick.last}`)
                            console.log('Ordem de venda inserida no livro. ' + data)
                            d.tradeExecution++;
                            definirPrecos(d, tick.last)
                        },
                        (data) => {
                            console.log('Erro ao inserir ordem de venda no livro. ' + data)
                        }
                    )
                }
            } else {
                console.log("Barato demais para vender, aguarde mais um pouco até alcançar " + d.precoMinimoVenda)
            }

            // Comprar
            if (tick.last <= d.precoMaximoCompra) {
                if (d.env === "test") {
                    console.log(`SIMULAÇÃO - Criada ordem de compra ${d.quantidadeCompraLtc} por ${tick.last}`)
                    console.log('SIMULAÇÃO - Ordem de compra inserida no livro.')
                    d.tradeExecution++;
                    definirPrecos(d, tick.last)
                }
                if (d.env === "production") {
                    tradeApi.placeBuyOrder(d.quantidadeCompraLtc, tick.last,
                        (data) => {
                            console.log(`Criada ordem de compra ${d.quantidadeCompraLtc} por ${tick.last}`)
                            console.log('Ordem de compra inserida no livro. ' + data)
                            d.tradeExecution++;
                            definirPrecos(d, tick.last)
                        },
                        (data) => {
                            console.log('Erro ao inserir ordem de compra no livro. ' + data)
                        }
                    )
                }
            } else {
                console.log("Caro demais para comprar, aguarde mais um pouco até alcançar " + d.precoMaximoCompra)
            }
        })
    console.log("Fim tentar trade");

    // })
}

function preparar() {
    d.tradeExecution = 0
}

async function rodar() {
    preparar()
    await calcularDefinicoesVariaves(d)
    // console.log(r);

    console.log("Antes do tentar trade")
    tentarTrade()
    console.log("Apos do tentar trade")
    setInterval(() => tentarTrade(), d.crawlerIntevalo)
}

////////////////////////////// Início da execução //////////////////////////////////////////////////

rodar();
