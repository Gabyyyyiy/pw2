import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import conectarBanco from './database/conexao.js';

dotenv.config();
const app = express();
const PORTA = process.env.PORTA;
app.use(express.json());

app.get('/', (req, res) => {
    res.end('Bem vindo a API de Produtos Pizza PWI!');
});

app.get('/produtos', async (req, res) => {
    const conexao = await conectarBanco();
    try {
        const sql = 'SELECT * FROM produto';
        const [linhas] = await conexao.execute(sql);
        res.json(linhas)
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ erro: error.message });
    } finally {
        await conexao.end();
    }
});

app.post('/produtos', async (req, res) => {
    const conexao = await conectarBanco();
    const novoProduto = req.body;
    try {
        const sql = 'INSERT INTO produto (produto_nome, produtos_descricao, produto_valor,produto_imagem, produto_status) VALUES  (?, ?, ?, ?, ?)';
        const [resultado] = await conexao.execute(sql, [
            novoProduto.produto_nome,
            novoProduto.produtos_descricao,
            novoProduto.produto_valor,
            novoProduto.produto_imagem,
            novoProduto.produto_status,
        ]);
        res.status(201).json({ id: resultado.insertId, ...novoProduto });
    } catch (error) {
        console.error('Erro na inserção:', error);
        res.status(500).json({ erro: error.message });
    } finally { await conexao.end(); }
});

app.put('/produtos/:id', async (req, res) => {
    const conexao = await conectarBanco();
    const id = req.params.id;
    const novoProduto = req.body;

    try {
        const sql = 'UPDATE produto SET produto_nome = ?, produtos_descricao = ?,produto_valor = ?, produto_imagem = ?, produto_status = ? WHERE id_produto = ?';
        const dados = [
            novoProduto.produto_nome,
            novoProduto.produtos_descricao,
            novoProduto.produto_valor,
            novoProduto.produto_imagem,
            novoProduto.produto_status,
            id
        ];
        const [resultado] = await conexao.execute(sql, dados);
        if (resultado.affectedRows > 0) {
            res.json({ id, ...novoProduto });
        } else {
            res.status(404).json({ erro: 'produto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ erro: error.message });
    } finally { await conexao.end(); }
});
app.delete('/produtos/:id', async (req, res) => {
    const conexao = await conectarBanco();
 
    const id = req.params.id;
    try {
        const sql = 'DELETE FROM produto WHERE id_produto = ?';
        const [resultado] = await conexao.execute(sql,[id]);
        if (resultado.affectedRows > 0) {
            res.json({mensagem : 'Produto  deletado com sucesso' });
        } else {
            res.status(404).json({erro : 'Produto não encontrado'});
        }
    } catch (error) {
        res.status(500).json({erro: error.message});
    } finally { await conexao.end(); }
});
 
app.get('/produtos/:id', async (req, res) => {
    const conexao = await conectarBanco();
    const id = req.params.id;
    try {
        const sql = 'SELECT * FROM produto WHERE id_produto = ?';
        const [linhas] = await conexao.execute(sql, [id]);
        if (linhas.length > 0) {
            res.json(linhas[0]);
        } else {
            res.status(404).json({ erro: 'Produto não encontrado' });
        }
    }catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ erro: error.message});
    } finally { await conexao.end();}
});
const server = http.createServer(app);
server.listen (PORTA, ()=> {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
