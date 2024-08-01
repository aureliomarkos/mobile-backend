const express = require('express');
const router = express.Router();
const connection = require('../db');


// Rota para selecionar todos os produtos de favoritos
router.get('/', (req, res) => {
    
  const { clienteId } = req.query

  const query =  `SELECT fav.id AS 'favoritoId', pro.id, pro.descricao, pro.qtde, pro.preco, pro.imagem
                  FROM favoritos fav
                  JOIN produtos pro ON fav.produtoId = pro.id
                  WHERE fav.clienteId = ?;`
    
  connection.query(query, [clienteId], (err, results) => {
      if (err) {
        console.error('Erro ao executar a consulta: ', err);
        return res.json({ success: false, message: 'Erro ao buscar produtos nos favoritos.' });
      }

      // Converter as imagens BLOB para base64
      const produtos = results.map(produto => {
        if (produto.imagem) {
            produto.imagem = Buffer.from(produto.imagem).toString('base64');
        }
        return produto;
      });

      return res.json({ success: true, data: produtos });
  });
});


// Rota para add Produto na tabela favoritos
router.post('/addFavorito', (req, res) => {
    
    const { clienteId, produtoId } = req.body
  
    const query = 'INSERT INTO favoritos (clienteId, produtoId) VALUES (?, ?)';
      
    connection.query(query, [clienteId, produtoId], (err, results) => {
    if (err) {
        console.error('Erro ao adicionar favorito: ', err);
        return res.json({ success: false, message: 'Erro ao adicionar favorito.' });
    }
    return res.json({ success: true, message: 'Produto adicionado ao carrinho.' });
    });
});
  

// Rota para remover Produto da tabela favoritos
router.delete('/removeFavorito/:favoritoId', (req, res) => {
    
    const { favoritoId } = req.params;
  
    const query = 'DELETE FROM favoritos WHERE id=?';
      
    connection.query(query, [favoritoId], (err, results) => {
    if (err) {
        console.error('Erro ao remover produto de favoritos: ', err);
        return res.json({ success: false, message: 'Erro ao remover produto de favoritos.' });
    }
    return res.json({ success: true, message: 'Produto removido de favoritos.'});
    });
});

// Rota para remover Produto da tabela favoritos com o código do cliente e do produto
router.delete('/removeFavoritoCP/:clienteId/:produtoId', (req, res) => {
    
  const { clienteId, produtoId } = req.params;

  const query = 'DELETE FROM favoritos WHERE clienteId=? AND produtoId=?';
    
  connection.query(query, [clienteId, produtoId], (err, results) => {
  if (err) {
      console.error('Erro ao remover produto de favoritos: ', err);
      return res.json({ success: false, message: 'Erro ao remover produto de favoritos.' });
  }
  return res.json({ success: true, message: 'Produto removido de favoritos.'});
  });
});


// Rota para remover todos os Produtos favoritos do cliente
router.get('/limparFavoritos', (req, res) => {
    
  const { clienteId } = req.query;

  const query = 'DELETE FROM favoritos WHERE clienteId=?';
    
  connection.query(query, [clienteId], (err, results) => {
  if (err) {
      console.error('Erro ao remover todos produtos de favoritos: ', err);
      return res.json({ success: false, message: 'Erro ao remover todos produtos de favoritos.' });
  }
  return res.json({ success: true, message: 'Todos os produtos removido de favoritos.' })
  });
});


// Rota para verificar se o produto esta na tabela favoritos
router.get('/produtoInFavoritos', (req, res) => {
 
    const { clienteId, produtoId } = req.query;

    const query = 'SELECT * FROM favoritos WHERE clienteId=? AND produtoId=?';
        
    connection.query(query, [clienteId, produtoId], (err, results) => {
    if (err) {
        console.error('Erro ao verificar se existe o produto na tabela favorito: ', err);
        return res.json({ success: false, message: 'Erro ao verificar se existe o produto na tabela favorito.' });
    }
   
    if (results.length === 0) { res.json(false) }
    else { res.json(true) }
    });
});
  
module.exports = router;