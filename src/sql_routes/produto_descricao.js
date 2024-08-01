const express = require('express');
const router = express.Router();
const connection = require('../db');

// Rota para buscar todos os produtos e incluir as imagens
router.get('/', (req, res) => {
    
  const { produtoId } = req.query;
    
    const query = 'SELECT * FROM produto_descricao WHERE id=?';
    
    connection.query(query, [produtoId], (err, results) => {
      if (err) {
        console.error('Erro ao selecionar detalhes do produto: ', err);
        return res.json({ success: false, message: 'Erro ao selecionar detalhes do produto.'});
        
      }
  
      // Converter as imagens BLOB para base64
      const produto = results.map(produto => {

        // imagem 1
        if (produto.imagem_1) {
            produto.imagem_1 = Buffer.from(produto.imagem_1).toString('base64');
        };

        // imagem 2
        if (produto.imagem_2) {
            produto.imagem_2 = Buffer.from(produto.imagem_2).toString('base64');
        };

        // imagem 3
        if (produto.imagem_3) {
            produto.imagem_3 = Buffer.from(produto.imagem_3).toString('base64');
        };

        // imagem 4
        if (produto.imagem_4) {
            produto.imagem_4 = Buffer.from(produto.imagem_4).toString('base64');
        };

        // imagem 5
        if (produto.imagem_5) {
            produto.imagem_5 = Buffer.from(produto.imagem_5).toString('base64');
        };

        return produto;
      });
  
      return res.json({ success: true, data: produto });
    });
  });
  
  module.exports = router;