const validarContaEsenha = (req, res, next) => {
  const { numero_conta, senha } = req.query;
  if (!numero_conta || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }
  next();
};

module.exports = { validarContaEsenha };
