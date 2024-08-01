const express = require('express');
const router = express.Router();
const connection = require('../db');

// Função para localizar o endereço principal do cliente
const searchEnderecoPrincipal = async (clienteId) => {
  const query = 'SELECT id FROM enderecos WHERE clienteId=? AND principal=true';
  
  return new Promise((resolve, reject) => {
    connection.query(query, [clienteId], (err, results) => {
      if (err) {
        console.error('Erro ao localizar endereco principal na tabela endereços: ', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Função para localizar o endereço principal do cliente
const updateEnderecoPrincipal = async (enderecoId, flagEnderecoPrincipal) => {
  const query = 'UPDATE enderecos SET principal=? WHERE id=?';
  
  return new Promise((resolve, reject) => {
    connection.query(query, [flagEnderecoPrincipal, enderecoId], (err, results) => {
      if (err) {
        console.error('Erro ao alterar o endereco principal na tabela endereços: ', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Rota para buscar todos endereços do cliente
router.get('/', (req, res) => {
    
    const { clienteId } = req.query

    const query = 'SELECT * FROM enderecos WHERE clienteId=? ORDER BY principal DESC';
    
    connection.query(query, [clienteId], (err, results) => {
      if (err) {
        console.error('Erro ao executar a consulta de endereços: ', err);
        return res.json({ success: false, message: 'Erro ao buscar endereços.' });
      }
      
      return res.json({ success: true, data: results });
    });
});

// Rota para buscar o endereço principal do cliente
router.get('/getEnderecoPrincipal', (req, res) => {
    
  const { clienteId } = req.query

  const query = 'SELECT * FROM enderecos WHERE clienteId=? AND principal=true';
  
  connection.query(query, [clienteId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar endereço principal: ', err);
      return res.json({ success: false, message: 'Erro ao buscar endereço principal.' });
    }
    return res.json({ success: true, data: results });
  });
});


// Rota para alterar o endereco principal
router.put('/setEnderecoPrincipal', async (req, res) => {
  const { enderecoId, clienteId } = req.body;

  try {
    const enderecoPrincipalOLD = await searchEnderecoPrincipal(clienteId);

    if (enderecoPrincipalOLD.length) {
      const updateOldEndereco = await updateEnderecoPrincipal(enderecoPrincipalOLD[0].id, false);
      const updateNewEndereco = await updateEnderecoPrincipal(enderecoId, true);

      if (updateOldEndereco && updateNewEndereco) {
        return res.json({ success: true, message: 'Endereço principal atualizado com sucesso.' });
      } else {
        return res.json({ success: false, message: 'Erro ao atualizar endereço principal.' });
      }
    
    } else {
      const updateNewEndereco = await updateEnderecoPrincipal(enderecoId, true);
      if (updateNewEndereco){
        return res.json({ success: true, message: 'Endereço principal atualizado com sucesso.' });
      } else {
        return res.json({ success: false, message: 'Erro ao atualizar endereço principal.' });
      }
    }
  
  } catch (error) {
    console.error('Erro ao alterar o endereço principal:', error);
    return res.json({ success: false, message: 'Erro ao atualizar o endereço principal.' });
  }
});

// Rota para remover um endereço da tabela endereços
router.delete('/removeEndereco', (req, res) => {
    const { enderecoId } = req.query;

    const query = 'DELETE FROM enderecos WHERE id=?';

    connection.query(query, [enderecoId], (err, results) => {
        if (err) {
          console.error('Erro ao remover endereço: ', err);
          return res.json({ sucess: false, message: 'Erro ao remover endereço.' });
        }
        if (results.affectedRows === 0) {
          return res.json({ success: false, message: 'Endereço não encontrado' });
        }
        return res.json({ success: true, message: 'Endereço removido com sucesso' });
    });
});


// Rota inserir novo endereço
router.post('/addEndereco', (req, res) => {
    
  const { clienteId, cep, rua, nro, bairro, cidade, estado, complemento } = req.body

  const query = 'INSERT INTO enderecos (clienteId, cep, rua, nro, bairro, cidade, estado, complemento, principal) VALUES (?,?,?,?,?,?,?,?, false)';
    
  connection.query(query, [clienteId, cep, rua, nro, bairro, cidade, estado, complemento], (err, results) => {
      if (err) {
        console.error('Erro ao cadastrar endereço: ', err);
        return res.json({ success: false, message: 'Erro ao cadastrar endereço.' });
      }
      return res.json({ success: true, message: 'Endereço cadastrado com sucesso.' });
  });
});


// Rota para alterar endereço
router.post('/updateEndereco', (req, res) => {
    
  const { enderecoId, cep, rua, nro, bairro, cidade, estado, complemento } = req.body

  const query = 'UPDATE enderecos SET cep=?, rua=?, nro=?, bairro=?, cidade=?, estado=?, complemento=? WHERE id=?';
    
  connection.query(query, [cep, rua, nro, bairro, cidade, estado, complemento, enderecoId], (err, results) => {
      if (err) {
        console.error('Erro ao alterar o endereço:', err);
        return res.json({ success: false, message: 'Erro ao alterar o endereço.' });
      }
      return res.json({ success: true, message: 'Endereço alterado com sucesso.' });
  });
});

module.exports = router;









