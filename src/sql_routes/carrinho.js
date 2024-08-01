const express = require('express');
const router = express.Router();
const connection = require('../db');

// Função para verificar se o produto existe no carrinho
const verifyProdutoExisteCarrinho = async (clienteId, produtoId) => {
  const query = 'SELECT * FROM carrinho WHERE clienteId=? AND produtoId=?';
  
  return new Promise((resolve, reject) => {
    connection.query(query, [clienteId, produtoId], (err, results) => {
      if (err) {
        console.error('Erro ao executar a consulta na tabela carrinho: ', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Função para atualizar a quantidade do produto no carrinho
const updateQtdeProdutoCarrinho = async (clienteId, produtoId) => {
  const query = 'UPDATE carrinho SET qtde=qtde+1 WHERE clienteId=? AND produtoId=?';
  
  return new Promise((resolve, reject) => {
    connection.query(query, [clienteId, produtoId], (err, results) => {
      if (err) {
        console.error('Erro ao executar update na tabela carrinho: ', err);
        reject(false);
      } else {
        console.log('Quantidade do Produto alterada no carrinho.');
        resolve(true);
      }
    });
  });
};

// Função para adicionar produto ao carrinho
const addProdutoAoCarrinho = async (clienteId, produtoId) => {
  const query = 'INSERT INTO carrinho (clienteId, produtoId, qtde) VALUES (?, ?, 1)';
  
  return new Promise((resolve, reject) => {
    connection.query(query, [clienteId, produtoId], (err, results) => {
      if (err) {
        console.error('Erro ao executar a inserção de dados na tabela carrinho: ', err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};

// Rota para adicionar produto ao carrinho
router.post('/addCarrinho', async (req, res) => {
  const { clienteId, produtoId } = req.body

  try {
    const result = await verifyProdutoExisteCarrinho(clienteId, produtoId);

    if (result.length) { 
      const responseUpdate = await updateQtdeProdutoCarrinho(clienteId, produtoId);
      if (responseUpdate) {
        return res.json({ success: true, message: 'Quantidade do produto atualizada no carrinho.' });
      } else {
        return res.json({ success: false, message: 'Erro ao atualizar a quantidade do produto no carrinho.' });
      }
    } else {
      const responseInsert = await addProdutoAoCarrinho(clienteId, produtoId);
      if (responseInsert) {
        return res.json({ success: true, message: 'Produto adicionado ao carrinho com sucesso.'});
      } else {
        return res.json({ success: false, message: 'Erro ao adicionar produto no carrinho.'});
      }
    }
  
  } catch (error) {
    console.error('Erro ao adicionar produto no carrinho: ', error);
    return res.json({ success: false, message: 'Erro ao adicionar produto no carrinho.'});
  }
});


// Rota para selecionar todos os ítens do carrinho
router.get('/', (req, res) => {
    
    const { clienteId } = req.query

    const query =  `SELECT car.id AS 'carrinhoId', pro.id, pro.descricao, pro.qtde, car.qtde AS 'qtdeCarrinho',
                           pro.preco, pro.imagem, (car.qtde * pro.preco) AS 'valorTotalProduto'
                    FROM carrinho car
                    JOIN produtos pro ON car.produtoId = pro.id
                    WHERE car.clienteId = ?;`

    connection.query(query, [clienteId], (err, results) => {
    if (err) {
        console.error('Erro ao selecionar os produtos do carrinho para o cliente: ', err);
        return res.json({ success: false, message: 'Erro ao selecionar os produtos do carrinho para o cliente.'});
    }

    // Converter as imagens BLOB para base64
    const produtos = results.map(produto => {
    if (produto.imagem) {
        produto.imagem = Buffer.from(produto.imagem).toString('base64');
    }
    return produto;
    });
    return res.json({ success: true, data: produtos});
  });
});


// Rota para somar todos os ítens do carrinho
router.get('/valorTotalCarrinho', (req, res) => {
    
  const { clienteId } = req.query

  const query =  `SELECT SUM(car.qtde * pro.preco) as 'valorTotalCarrinho'
                  FROM carrinho car
                  JOIN produtos pro ON car.produtoId = pro.id
                  WHERE car.clienteId = ?;`

    connection.query(query, [clienteId], (err, results) => {
      if (err) {
        console.error('Erro ao somar os produtos do carrinho: ', err);
        return res.json({ success: false, message:'Erro ao somar os produtos do carrinho.'});

      }
      return res.json({ success: true, data: results});
    });
  });


// Rota para remover Produto da tabela carrinho
router.delete('/removeCarrinho/:carrinhoId', (req, res) => {
    
    const { carrinhoId } = req.params;
  
    const query = 'DELETE FROM carrinho WHERE id=?';
      
    connection.query(query, [carrinhoId], (err, results) => {
        if (err) {
          console.error('Erro ao remover produto do carrinho:', err);
          return res.json({success: false, messagem: 'Erro ao remover produto do carrinho.'});
        }
        return res.json({success: true, message: 'Produto removido do carrinho com sucesso.'});
    });
});

// Rota para alterar a qtde do produto no carrinho
router.put('/updateQtdeCarrinho', (req, res) => {
    
  const { carrinhoId, qtdeCarrinho } = req.body;

  const query = 'UPDATE carrinho SET qtde=? WHERE id=?';
    
  connection.query(query, [qtdeCarrinho, carrinhoId], (err, results) => {
      if (err) {
        console.error('Erro ao alterar a qtde do produto no carrinho:', err);
        return res.json({ success: false, message:'Erro ao alterar a qtde do produto no carrinho.'});
      }
      return res.json({success: true, message:'Produto alterado no carrinho com sucesso.'});
  });
});


// Rota para remover todos os Produtos da tabela carrinho
router.get('/limparCarrinho', (req, res) => {
    
  const { clienteId } = req.query;

  const query = 'DELETE FROM carrinho WHERE clienteId=?';
    
  connection.query(query, [clienteId], (err, results) => {
      if (err) {
        console.error('Erro ao remover os produtos da tabela carrinho: ', err);
        return res.json({ success: false, message: 'Erro ao remover os produtos do carrinho.'});
      }
      return res.json({ success: true, message: 'Produtos removido do carrinho com sucesso.'});
  });
});

module.exports = router;