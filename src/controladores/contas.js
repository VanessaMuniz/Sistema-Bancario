const bancodedados = require("../bancodedados");

const listarContas = (req, res) => {
  const { senha } = req.query;
  if (isNaN(Number(senha))) {
    return res.status(400).json({
      mensagem: "Por favor digitar apenas caracteres numéricos",
    });
  }
  if (!senha) {
    return "A senha é obrigatória";
  }
  const contasEncontradas = bancodedados.contas.find(
    (conta) => conta.usuario.senha === Number(senha)
  );
  if (!contasEncontradas) {
    return res.status(401).json({ mensagem: "Senha inválida" });
  }

  return res.status(200).json(contasEncontradas);
};

let numero = 1;
const criarConta = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  const saldo = 0;
  if (
    !nome ||
    !cpf ||
    !data_nascimento ||
    !telefone ||
    !email ||
    !senha === undefined
  ) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }
  const cpfEncontrado = bancodedados.contas.find(
    (conta) => conta.usuario.cpf === Number(cpf)
  );
  if (cpfEncontrado) {
    return res
      .status(400)
      .json({ mensagem: "Já existe conta vinculada a esse cpf" });
  }
  const emailEncontrado = bancodedados.contas.find(
    (conta) => conta.usuario.email === email
  );
  if (emailEncontrado) {
    return res
      .status(400)
      .json({ mensagem: "Já existe conta vinculada a esse email" });
  }
  const novaConta = {
    numero,
    saldo,
    usuario: { nome, cpf, data_nascimento, telefone, email, senha },
  };
  numero++;
  bancodedados.contas.push(novaConta);

  return res.status(200).json(novaConta);
};

const atualizarUsuario = (req, res) => {
  const { numeroConta } = req.params;
  if (isNaN(Number(numeroConta))) {
    return res.status(400).json({ mensagem: "Digite apenas números" });
  }
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  if (!numeroConta) {
    return res
      .status(400)
      .json({ mensagem: "O número da conta é obrigatório" });
  }
  const contaEncontrada = bancodedados.contas.find(
    (conta) => conta.numero === Number(numeroConta)
  );
  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }
  if (
    !nome &&
    !cpf &&
    !data_nascimento &&
    !telefone &&
    !email &&
    !senha === undefined
  ) {
    return res.status(400).json({ mensagem: "Informe o que deseja atualizar" });
  }
  if (cpf) {
    const cpfEncontrado = bancodedados.contas.find(
      (conta) => conta.usuario.cpf === Number(cpf)
    );
    if (cpfEncontrado) {
      return res.status(400).json({ mensagem: "Esse cpf já existe" });
    }
  }
  if (email) {
    const emailEncontrado = bancodedados.contas.find(
      (conta) => conta.usuario.email === email
    );
    if (emailEncontrado) {
      return res.status(400).json({ mensagem: "Esse email já existe" });
    }
  }
  const contaAtualizada = {
    usuario: { nome, cpf, data_nascimento, telefone, email, senha },
  };
  contaEncontrada = contaAtualizada;

  return res.status(200).json({ mensagem: "Conta atualizada com sucesso" });
};

const deletarConta = (req, res) => {
  const { numeroConta } = req.params;
  if (isNaN(Number(numeroConta))) {
    return res.status(400).json({ mensagem: "Digite apenas números" });
  }
  const contaEncontrada = bancodedados.contas.find(
    (conta) => conta.numero === Number(numeroConta)
  );
  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }
  if (contaEncontrada.saldo != 0) {
    return res
      .status()
      .json({ mensagem: "Só contas com o saldo zerado podem ser excluidas" });
  }
  const index = bancodedados.contas.indexOf(contaEncontrada);
  bancodedados.contas.splice(index, 1);

  return res.status(200).json({ mensagem: "Conta removida com sucesso" });
};

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;
  if (!numero_conta || !valor) {
    return res
      .status(400)
      .json({ mensagem: "O número da conta e o valor são obrigatórios" });
  }
  const contaEncontrada = bancodedados.contas.find(
    (conta) => conta.numero === Number(numero_conta)
  );
  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }
  if (valor <= 0) {
    return res
      .status(400)
      .json({ mensagem: "Essa transação não pode ser realizada" });
  }

  contaEncontrada.saldo += valor;
  const deposito = { data: new Date().toISOString(), numero_conta, valor };
  bancodedados.depositos.push(deposito);

  return res.status(200).json({ mensagem: "Depósito realizado com sucesso" });
};

const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;
  if (!numero_conta || !valor || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }
  const contaEncontrada = bancodedados.contas.find(
    (conta) => conta.numero === Number(numero_conta)
  );
  if (!contaEncontrada) {
    return res.status(401).json({ mensagem: "Conta não encontrada" });
  }
  if (contaEncontrada.senha != senha) {
    return res.status(403).json({ mensagem: "Senha inválida" });
  }
  if (contaEncontrada.saldo < valor) {
    return res.status(403).json({
      mensagem:
        "Não serão permitidos saques com valores superiores ao saldo em conta",
    });
  }
  contaEncontrada.saldo -= valor;
  const saque = { data: new Date().toISOString(), numero_conta, valor };
  bancodedados.saques.push(saque);

  return res.status(200).json({ mensagem: "Saque realizado com sucesso" });
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }
  const contaDeOrigem = bancodedados.contas.find(
    (conta) => conta.numero === Number(numero_conta_origem)
  );
  if (!contaDeOrigem) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }
  const contaDeDestino = bancodedados.contas.find(
    (conta) => conta.numero === Number(numero_conta_destino)
  );
  if (!contaDeDestino) {
    return res.status(401).json({ mensagem: "Conta não encontrada" });
  }
  if (contaDeOrigem.senha != senha) {
    return res.status(401).json({ mensagem: "Senha inválida" });
  }
  if (contaDeOrigem.saldo < valor) {
    return res.status(400).json({
      mensagem:
        "não serão permitidas transferências com valores superiores ao saldo em conta",
    });
  }
  contaDeOrigem.saldo -= valor;
  contaDeDestino.saldo += valor;
  const transferencia = {
    data: new Date().toISOString(),
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };
  bancodedados.transferencias.push(transferencia);

  return res
    .status(200)
    .json({ mensagem: "Transferência realizada com sucesso" });
};

const consultarSaldo = (req, res) => {
  const { numero_conta, senha } = req.query;
  if (!numero_conta || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }
  const contaEncontrada = bancodedados.contas.find((conta) => {
    conta.numero === Number(numero_conta);
  });
  if (!contaEncontrada) {
    return res.status(401).json({ mensagem: "Conta não encontrada" });
  }
  if (contaEncontrada.senha != senha) {
    return res.status(401).json({ mensagem: "Senha inválida" });
  }

  return res.status(200).json(contaEncontrada.saldo);
};

const listarTransacoes = (req, res) => {
  const { numero_conta, senha } = req.query;
  const contaEncontrada = bancodedados.contas.find((conta) => {
    conta.numero === Number(numero_conta);
  });
  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }
  if (contaEncontrada.senha != senha) {
    return res.status(400).json({ mensagem: "Senha inválida" });
  }

  const depositos = bancodedados.depositos.filter((deposito) => {
    deposito.numero_conta === Number(numero_conta);
  });
  const saques = bancodedados.saques.filter((saque) => {
    saque.numero_conta === Number(numero_conta);
  });
  const transferenciasEnviadas = bancodedados.transferencias.filter(
    (transferencia) => {
      transferencia.numero_conta_origem === Number(numero_conta);
    }
  );
  const transferenciasRecebidas = bancodedados.transferencias.filter(
    (transferencia) => {
      transferencia.numero_conta_destino === Number(numero_conta);
    }
  );

  const extrato = {
    depositos,
    saques,
    transferenciasEnviadas,
    transferenciasRecebidas,
  };

  return res.status(200).json(extrato);
};
module.exports = {
  listarContas,
  criarConta,
  atualizarUsuario,
  deletarConta,
  depositar,
  sacar,
  transferir,
  consultarSaldo,
  listarTransacoes,
};
