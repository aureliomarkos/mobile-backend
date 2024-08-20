// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config({ path: 'mysqlConfig.env' });

const helmet = require('helmet');
app.use(helmet());

// Importando as rotas
const clientesRoutes = require('./src/sql_routes/clientes');
const produtosRoutes = require('./src/sql_routes/produtos');
const produtoDescricaoRoutes = require('./src/sql_routes/produto_descricao')
const favoritosRoutes = require('./src/sql_routes/favoritos')
const carrinhoRoutes = require('./src/sql_routes/carrinho')
const enderecosRoutes = require('./src/sql_routes/enderecos')
const pedidosRoutes = require('./src/sql_routes/pedidos')


// Middleware CORS
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:8080', // Origem do seu PWA em desenvolvimento
  'capacitor://localhost', // Origem do seu aplicativo mobile
  'https://sua-aplicacao.com', // Domínio do seu PWA em produção
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origem (como no caso de apps mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));


app.use(express.json());

// Usando as rotas
app.use('/clientes', clientesRoutes);
app.use('/produtos', produtosRoutes);
app.use('/produtoDescricao', produtoDescricaoRoutes);
app.use('/favoritos', favoritosRoutes);
app.use('/carrinho', carrinhoRoutes);
app.use('/enderecos', enderecosRoutes)
app.use('/pedidos', pedidosRoutes)

// Rota raiz
app.get('/', (req, res) => {
  res.send('API está funcionando!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});