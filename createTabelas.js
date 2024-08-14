const mysql = require('mysql2');
require('dotenv').config({ path: 'mysqlConfig.env' });

// Configuração da conexão MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Função para criar as tabelas
const createTables = () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      senha VARCHAR(60) NOT NULL,
      cpf VARCHAR(14) UNIQUE NOT NULL,
      rg VARCHAR(20) UNIQUE NOT NULL,
      data_nascimento DATE NOT NULL,
      celular VARCHAR(15),
      ativo BOOLEAN DEFAULT TRUE
    );`,

    `CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT TRUE
      );`,
  

    `CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      descricao TEXT NOT NULL,
      qtde INT,
      preco DECIMAL(10, 2) NOT NULL,
      unidade VARCHAR(3),
      categoriaId INT,
      ativo BOOLEAN DEFAULT TRUE,
      imagem MEDIUMBLOB,
      FOREIGN KEY (categoriaId) REFERENCES categorias(id)
    );`,

    `CREATE TABLE IF NOT EXISTS produto_descricao (
      id INT AUTO_INCREMENT PRIMARY KEY,  
      produtoId INT,
      caracteristica TEXT,
      imagem_1 MEDIUMBLOB,
      imagem_2 MEDIUMBLOB,
      imagem_3 MEDIUMBLOB,
      imagem_4 MEDIUMBLOB,
      imagem_5 MEDIUMBLOB,
      FOREIGN KEY (produtoId) REFERENCES produtos(id)
    );`,

    `CREATE TABLE IF NOT EXISTS carrinho (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clienteId INT,
      produtoId INT,
      qtde INT,
      FOREIGN KEY (clienteId) REFERENCES clientes(id),
      FOREIGN KEY (produtoId) REFERENCES produtos(id)
    );`,

    `CREATE TABLE IF NOT EXISTS enderecos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clienteId INT,
        rua VARCHAR(255),
        nro VARCHAR(20),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        complemento VARCHAR(100),
        cep VARCHAR(9),
        ativo BOOLEAN DEFAULT TRUE,
        principal BOOLEAN,
        FOREIGN KEY (clienteId) REFERENCES clientes(id)
      );`,    


    `CREATE TABLE IF NOT EXISTS pedidos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clienteId INT,
      enderecoId INT,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      frete DECIMAL(10, 2),
      total DECIMAL(10, 2),
      status ENUM('Pendente', 'Processando', 'Concluído', 'Cancelado') DEFAULT 'Pendente',
      forma_pagto VARCHAR(20),
      FOREIGN KEY (clienteId) REFERENCES clientes(id),
      FOREIGN KEY (enderecoId) REFERENCES enderecos(id)
    );`,

    `CREATE TABLE IF NOT EXISTS pedido_itens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedidoId INT,
        produtoId INT,
        qtde INT,
        preco DECIMAL(10, 2),
        FOREIGN KEY (pedidoId) REFERENCES pedidos(id),
        FOREIGN KEY (produtoId) REFERENCES produtos(id)
      );`,
  

    `CREATE TABLE IF NOT EXISTS favoritos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clienteId INT,
      produtoId INT,
      FOREIGN KEY (clienteId) REFERENCES clientes(id),
      FOREIGN KEY (produtoId) REFERENCES produtos(id)
    );`
  ];

  
  queries.forEach(query => {
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Erro ao criar a tabela:', err);
      } else {
        console.log('Tabela criada com sucesso');
      }
    });
  });
  connection.end();
};

createTables();
