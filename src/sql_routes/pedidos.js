// file: pedidos.js
const express = require('express');
const router = express.Router();
const connection = require('../db');


// Função inserir um novo pedido
const insertNewPedido = async ( clienteId, enderecoId, forma_pagto, frete, total ) => {
    
    const query = 'INSERT INTO pedidos (clienteId, enderecoId, forma_pagto, frete, total) VALUES (?,?,?,?,?)';
    
    return new Promise((resolve, reject) => {
      connection.query(query, [clienteId, enderecoId, forma_pagto, frete, total], (err, results) => {
        if (err) {
          console.error('Erro ao inserir os dados na tabela pedidos: ', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
};


// Função para pegar todos os ítens do carrinho
const getAllProdutosCarrinho = async ( clienteId ) => {
    const query = `SELECT car.produtoId, car.qtde, pro.preco
                   FROM carrinho car
                   JOIN produtos pro ON car.produtoId = pro.id
                   WHERE clienteId=?`
    
    return new Promise((resolve, reject) => {
      connection.query(query, [clienteId], (err, results) => {
        if (err) {
          console.error('Erro ao executar a consulta na tabela carrinho: ', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
};


// Função inserir os produtos do carrinho na tabela pedido_itens
const insertProdutosInPedidoItens = async ( pedidoId, produtoId, qtde, preco ) => {
    
    const query = 'INSERT INTO pedido_itens (pedidoId, produtoId, qtde, preco) VALUES (?,?,?,?)';
    
    return new Promise((resolve, reject) => {
      connection.query(query, [pedidoId, produtoId, qtde, preco], (err, results) => {
        if (err) {
          console.error('Erro ao inserir os dados na tabela pedido_itens: ', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
};

// Função para dar baixa no estoque na tabela produtos
const updateQtdeProdutos = async ( produtoId, qtde ) => {
    
    const query = 'UPDATE produtos SET qtde=qtde-? WHERE id=?';
    
    return new Promise((resolve, reject) => {
      connection.query(query, [qtde, produtoId], (err, results) => {
        if (err) {
          console.error('Erro ao atualizar a qtde na tabela produtos: ', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
};

// Função para remover os produtos do cliente na tabela carrinho
const clearCarrinho = async ( clienteId ) => {
    
    const query = 'DELETE FROM carrinho WHERE clienteId=?';
    
    return new Promise((resolve, reject) => {
      connection.query(query, [clienteId], (err, results) => {
        if (err) {
          console.error('Erro ao remover os produtos do cliente na tabela carrinho: ', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
};


// Rota para inserir um novo pedido
router.post('/addPedido', async (req, res) => {
    const { clienteId, enderecoId, formaPagto, totalFrete, valorTotal } = req.body;
  
    connection.beginTransaction(async (err) => {
        if (err) {
            console.error('Erro ao iniciar a transação para salvar o pedido: ', err);
            return res.json({ success: false, message: 'Erro ao iniciar a transação para salvar o pedido.' });
        }
  
        try {
            const resultInsertNewPedido = await insertNewPedido(clienteId, enderecoId, formaPagto, totalFrete, valorTotal);
            const pedidoId = resultInsertNewPedido.insertId;
  
            // Seleciona todos os itens do carrinho
            const resultGetAllProdutosCarrinho = await getAllProdutosCarrinho(clienteId);
  
            // Atualiza a quantidade dos produtos
            for (let produto of resultGetAllProdutosCarrinho) {
                await updateQtdeProdutos(produto.produtoId, produto.qtde);
            }
  
            // Insere os produtos do carrinho na tabela pedido_itens
            for (let produto of resultGetAllProdutosCarrinho) {
                await insertProdutosInPedidoItens(pedidoId, produto.produtoId, produto.qtde, produto.preco);
            }
  
            // Limpa o carrinho
            await clearCarrinho(clienteId);
  
            // Commit da transação
            connection.commit((err) => {
            if (err) {
                return connection.rollback(() => {
                    console.error('Erro ao confirmar a transação para salvar o pedido:', err);
                    return res.json({ success: false, message: 'Erro ao confirmar a transação para salvar o pedido.'});
                });
            }
            res.json({ success: true, message: 'Pedido criado com sucesso.' });
            });
        } catch (error) {
            // Rollback da transação em caso de erro
            connection.rollback(() => {
                console.error('Erro ao processar o pedido:', error);
                return res.json({ success: false, message: 'Erro ao processar o pedido.' });
            });
        }
    });
});  

// Rota para selecionar pedido_item/pedido/produto
router.get('/', (req, res) => {
    
    const { clienteId } = req.query

    const query =  `SELECT pit.id, pro.imagem, pro.descricao, pro.preco, pit.qtde, (pit.qtde * pro.preco) AS 'valorTotalProduto',
                    ped.data, ped.status
                    FROM pedido_itens pit
                    JOIN pedidos ped ON pit.pedidoId=ped.id
                    JOIN produtos pro ON pit.produtoId=pro.id
                    WHERE ped.clienteId=?;`

    connection.query(query, [clienteId], (err, results) => {
    if (err) {
        console.error('Erro ao selecionar os pedidos do cliente: ', err);
        return res.json({ success: false, message: 'Erro ao selecionar os pedidos do cliente.'});
    }

    // Converter as imagens BLOB para base64
    const pedidos = results.map(produto => {
      if (produto.imagem) {
          produto.imagem = Buffer.from(produto.imagem).toString('base64');
      }
      return produto;
    });
    return res.json({ success: true, data: pedidos});
  });
});

module.exports = router;