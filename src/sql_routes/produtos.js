const express = require('express');
const router = express.Router();
const connection = require('../db');

// Rota para buscar todos os produtos e incluir as imagens
router.get('/', (req, res) => {
    
  const { descricao } = req.query;
    
    let query = 'SELECT * FROM produtos';
    if (descricao) {
      query += ` WHERE descricao LIKE ?`;
    }
    
    connection.query(query, [[`%${descricao}%`]], (err, results) => {
    if (err) {
        console.error('Erro ao selecionar produtos: ', err);
        return res.json({ success: false, message: 'Erro ao selecionar produtos.' });
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
  
  module.exports = router;