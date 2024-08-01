const express = require('express');
const router = express.Router();
const connection = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função para verificar se o email já está cadastrado
const verifyExistEmail = async ( email ) => {
  const query = 'SELECT * FROM clientes WHERE email=?'
  
  return new Promise((resolve, reject) => {
    connection.query(query, [email], (err, results) => {
      if (err) {
        console.error('Erro ao executar a consulta na tabela clientes: ', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Função para cadastrar um novo cliente
const addNewCliente = async ( nome, cpf, rg, celular, email, dataNasc, senha ) => {
  const query = 'INSERT INTO clientes ( nome, cpf, rg, celular, email, data_nascimento, senha ) VALUES (?,?,?,?,?,?,?)';
  
  return new Promise((resolve, reject) => {
    connection.query(query, [nome, cpf, rg, celular, email, dataNasc, senha], (err, results) => {
      if (err) {
        console.error('Erro ao cadastrar cliente: ', err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};


// Rota para buscar cliente específico pelo id
router.get('/:id', (req, res) => {
  const { clienteId } = req.query;
  
  const query = 'SELECT * FROM clientes WHERE id=?';
  
  connection.query(query, [clienteId], (err, results) => {
    if (err) {
      console.error('Erro ao localizar Cliente: ', err);
      return res.json({ success: false, message: 'Erro ao localizar Cliente.'});
    }
    
    if (results.length === 0) {
      return res.json({ success: false, message: 'Cliente não encontrado.'});
    }
    return res.json({ success: true, data: results, message: 'Cliente localizado com sucesso.' });
  });
});


// Rota para cadastrar um novo cliente
router.post('/addCliente', async (req, res) => {
    const { nome, cpf, rg, celular, email, dataNasc, senha } = req.body

    try {
        const resultVerifyExistEmail = await verifyExistEmail(email)

        // verifica se já existe o email
        if ( resultVerifyExistEmail.length ){ return res.json({ success: false, message: 'Email já cadastrado.' }) }

        // Hash da senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        // cadastrar o cliente
        const resultAddcliente = await addNewCliente( nome, cpf, rg, celular, email, dataNasc, hashedSenha )
        if ( resultAddcliente ) { return res.json({ success: true, message: 'Cliente cadastrado com sucesso.' }) }
        else { return res.json({ success: false, message: 'Não foi possível cadastrar cliente.' }) }

    } catch (error) {
      console.error('Erro ao cadastrar novo cliente: ', error);
      return res.json({ success: false, message: 'Erro ao cadastrar novo cliente.'});
    }
});


// Rota para alterar os dados do cliente
router.put('/updateCliente', async (req, res) => {
    
  const { clienteId, nome, cpf, rg, celular, dataNasc, senha } = req.body

  let query;
  let arrayQuery;
  
  if (senha) {
    try {
      // Hash da nova senha
      const hashedSenha = await bcrypt.hash(senha, 10);
      query = 'UPDATE clientes SET nome=?, cpf=?, rg=?, celular=?, data_nascimento=?, senha=? WHERE id=?';
      arrayQuery = [nome, cpf, rg, celular, dataNasc, hashedSenha, clienteId];

    } catch (err) {
      console.error('Erro ao gerar hash da senha:', err);
      return res.json('Erro ao gerar hash da senha.');
    }
  
  } else {
    query = 'UPDATE clientes SET nome=?, cpf=?, rg=?, celular=?, data_nascimento=? WHERE id=?';
    arrayQuery = [nome, cpf, rg, celular, dataNasc, clienteId];
  };
    
    connection.query(query, arrayQuery, (err, results) => {
      if (err) {
        console.error('Erro ao alterar os dados do cliente:', err);
        return res.json({ success: false, message: 'Erro ao alterar os dados do cliente.'});
      }
      return res.json({ success: true, message: 'Cliente alterado com sucesso.'});
    });
  });


// Pegue a chave secreta da variável de ambiente
const secretKey = process.env.JWT_SECRET || 'seuSegredoSuperSeguro';

// Rota para fazer o login do cliente
router.post('/login', async (req, res) => {
  const { email, senha } = req.body

  try {

    // Verificar se o usuário existe
    const cliente = await verifyExistEmail(email)
    if (cliente.length === 0) {
        return res.json({ success: false, message: 'Email incorreto.' });
    }
    
    // Verificar a senha
    const isMatch = await bcrypt.compare(senha, cliente[0].senha);
    if (!isMatch) {
        return res.json({ success: false,  message: 'Senha incorreta.' });
    }

    // Gerar token JWT
    const token = jwt.sign({ userId: cliente[0].id }, secretKey, { expiresIn: '1h' });
    
    return res.json({ success: true, data: token, message: 'Login efetuado com sucesso.' });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.json({ success: false, message: 'Erro ao fazer login.' });
}
});

// Middleware de autenticação \Users\oripk\mobile\src\middleware
const authenticateToken = require('../middleware/authenticateToken');

router.post('/checkLogin', authenticateToken, (req, res) => {
  const user = req.user;
  res.json({ user });
});

module.exports = router;