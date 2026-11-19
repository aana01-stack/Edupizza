const bancoDePerguntas = [
  { pergunta: "Quanto é 7 x 8?", opcoes: ["48", "56", "64", "72"], correta: "56" },
  { pergunta: "Qual é a capital da França?", opcoes: ["Paris", "Londres", "Berlim", "Roma"], correta: "Paris" },
  { pergunta: "Quanto é 5 + 9?", opcoes: ["12", "13", "14", "15"], correta: "14" },
  { pergunta: "Qual é o maior planeta do Sistema Solar?", opcoes: ["Terra", "Marte", "Júpiter", "Saturno"], correta: "Júpiter" },
  { pergunta: "Quanto é 12 - 5?", opcoes: ["5", "6", "7", "8"], correta: "7" },
  { pergunta: "Quem descobriu o Brasil?", opcoes: ["Pedro Álvares Cabral", "Cristóvão Colombo", "Dom Pedro I", "Vasco da Gama"], correta: "Pedro Álvares Cabral" },
  { pergunta: "Quanto é 9 x 6?", opcoes: ["45", "54", "56", "63"], correta: "54" },
  { pergunta: "Qual é o resultado de 20 ÷ 4?", opcoes: ["4", "5", "6", "8"], correta: "5" }
];

const estado = {
  moedas: 0,
  perguntaAtual: null,
  respostaEscolhida: null,
  timer: null,
  progressoForno: 0,
  assando: false
};

const el = (id) => document.getElementById(id);

const estacoes = {
  pedido: el("estacao-pedido"),
  montagem: el("estacao-montagem"),
  forno: el("estacao-forno"),
  corte: el("estacao-corte"),
  entrega: el("estacao-entrega")
};

const coresBotoes = ["cor-amarelo", "cor-vermelho", "cor-azul", "cor-verde"];

function atualizarMoedas() {
  el("moedas").textContent = estado.moedas;
}

function mudarEstacao(nome) {
  Object.values(estacoes).forEach((secao) => secao.classList.remove("ativa"));
  estacoes[nome].classList.add("ativa");
}

function embaralhar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function novaPergunta() {
  const indice = Math.floor(Math.random() * bancoDePerguntas.length);
  estado.perguntaAtual = bancoDePerguntas[indice];
  estado.respostaEscolhida = null;
}

function resetarPizza() {
  const pizza = el("pizza");
  pizza.className = "pizza";
  el("cobertura-pizza").textContent = "";
}

function limparSidebar() {
  el("ingredientes").innerHTML = "";
}

function atualizarComanda(texto, mensagem = "") {
  el("texto-comanda").textContent = texto;
  el("msg-comanda").textContent = mensagem;
}

function esconderTimer() {
  el("area-timer").classList.add("oculto");
  el("progresso-timer").style.width = "0%";
}

function mostrarTimer() {
  el("area-timer").classList.remove("oculto");
}

function iniciarPedido() {
  novaPergunta();
  resetarPizza();
  limparSidebar();
  esconderTimer();
  if (estado.timer) {
    clearInterval(estado.timer);
    estado.timer = null;
  }
  estado.progressoForno = 0;
  estado.assando = false;

  el("btn-ir-forno").disabled = true;
  el("btn-assar").disabled = false;
  el("btn-retirar").disabled = true;
  el("btn-cortar").disabled = false;

  atualizarComanda(
    "Quero uma pizza com a resposta para: " + estado.perguntaAtual.pergunta,
    "Anote o pedido para começar."
  );
  mudarEstacao("pedido");
}

function prepararMontagem() {
  atualizarComanda(
    "Quero uma pizza com a resposta para: " + estado.perguntaAtual.pergunta,
    "Escolha o ingrediente correto na barra lateral."
  );

  const container = el("ingredientes");
  container.innerHTML = "";
  const opcoes = embaralhar(estado.perguntaAtual.opcoes);

  opcoes.forEach((opcao, index) => {
    const botao = document.createElement("button");
    botao.className = "btn-ingrediente " + coresBotoes[index % coresBotoes.length];
    botao.textContent = opcao;
    botao.title = opcao;
    botao.addEventListener("click", () => selecionarOpcao(opcao, botao));
    container.appendChild(botao);
  });

  mudarEstacao("montagem");
}

function selecionarOpcao(opcao, botao) {
  if (estado.respostaEscolhida) return;

  if (opcao === estado.perguntaAtual.correta) {
    estado.respostaEscolhida = opcao;
    botao.classList.add("correto");

    const botoes = el("ingredientes").querySelectorAll("button");
    botoes.forEach((b) => {
      b.disabled = true;
    });
    botao.disabled = true;

    el("cobertura-pizza").textContent = "🍕";
    atualizarComanda(
      "Quero uma pizza com a resposta para: " + estado.perguntaAtual.pergunta,
      "Resposta correta! Ingrediente adicionado."
    );
    el("btn-ir-forno").disabled = false;
  } else {
    botao.style.filter = "grayscale(1)";
    botao.disabled = true;
    atualizarComanda(
      "Quero uma pizza com a resposta para: " + estado.perguntaAtual.pergunta,
      "Resposta errada. Tente outra opção."
    );
  }
}

function irParaForno() {
  limparSidebar();
  esconderTimer();
  estado.progressoForno = 0;
  estado.assando = false;
  el("progresso-timer").style.width = "0%";
  el("btn-assar").disabled = false;
  el("btn-retirar").disabled = true;
  atualizarComanda("Pizza na estação do forno.", "Clique em Assar para começar.");
  mudarEstacao("forno");
}

function iniciarAssar() {
  if (estado.assando) return;
  estado.assando = true;
  estado.progressoForno = 0;
  el("btn-assar").disabled = true;
  el("btn-retirar").disabled = false;
  mostrarTimer();
  atualizarComanda("A pizza está assando...", "Clique em Retirar no ponto certo.");

  estado.timer = setInterval(() => {
    estado.progressoForno += 2;
    if (estado.progressoForno >= 100) {
      estado.progressoForno = 100;
      el("progresso-timer").style.width = "100%";
      retirarDoForno();
      return;
    }
    el("progresso-timer").style.width = estado.progressoForno + "%";
  }, 100);
}

function retirarDoForno() {
  if (!estado.assando && estado.progressoForno === 0) return;
  if (estado.timer) {
    clearInterval(estado.timer);
    estado.timer = null;
  }
  estado.assando = false;
  el("btn-retirar").disabled = true;
  el("btn-assar").disabled = true;

  const pizza = el("pizza");
  pizza.classList.add("dourada");

  if (estado.progressoForno >= 40 && estado.progressoForno <= 70) {
    atualizarComanda("Pizza no ponto!", "Retirada no tempo certo.");
  } else if (estado.progressoForno < 40) {
    atualizarComanda("Pizza retirada cedo.", "Ainda assim, vamos continuar.");
  } else {
    atualizarComanda("Pizza passou do ponto.", "Mas já está dourada!");
  }

  setTimeout(irParaCorte, 1200);
}

function irParaCorte() {
  esconderTimer();
  atualizarComanda("Hora de cortar a pizza.", "Clique em Cortar Pizza.");
  mudarEstacao("corte");
}

function cortarPizza() {
  el("pizza").classList.add("cortada");
  el("btn-cortar").disabled = true;
  atualizarComanda("Pizza cortada em fatias!", "Pronta para entrega.");
  setTimeout(irParaEntrega, 900);
}

function irParaEntrega() {
  atualizarComanda("Pedido pronto!", "Clique em Entregar.");
  mudarEstacao("entrega");
}

function entregarPedido() {
  estado.moedas += 10;
  atualizarMoedas();
  atualizarComanda("Obrigado!", "O cliente ficou satisfeito. +10 moedas.");
  setTimeout(iniciarPedido, 1800);
}

function configurarEventos() {
  el("btn-anotar").addEventListener("click", prepararMontagem);
  el("btn-ir-forno").addEventListener("click", irParaForno);
  el("btn-assar").addEventListener("click", iniciarAssar);
  el("btn-retirar").addEventListener("click", retirarDoForno);
  el("btn-cortar").addEventListener("click", cortarPizza);
  el("btn-entregar").addEventListener("click", entregarPedido);
}

configurarEventos();
atualizarMoedas();
iniciarPedido();
