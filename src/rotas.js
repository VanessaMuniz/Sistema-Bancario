const express = require("express");
const rotas = express();
const { validarContaEsenha } = require("./intermediarios/validarcontaesenha");

const {
  listarContas,
  criarConta,
  atualizarUsuario,
  deletarConta,
  depositar,
  sacar,
  transferir,
  consultarSaldo,
  listarTransacoes,
} = require("./controladores/contas");

rotas.get("/contas", listarContas);
rotas.post("/contas", criarConta);
rotas.put("/contas/:numeroConta/usuario", atualizarUsuario);
rotas.delete("/contas/:numeroConta", deletarConta);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.get("/contas/saldo", consultarSaldo);
rotas.get("/contas/extrato", validarContaEsenha, listarTransacoes);

module.exports = { rotas };
