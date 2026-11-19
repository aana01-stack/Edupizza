const bancoDePerguntas = [
  { pergunta: "Qual é a capital da França?", opcoes: ["Paris", "Londres", "Berlim", "Roma"], correta: "Paris" },
  { pergunta: "Quanto é 5 + 7?", opcoes: ["10", "11", "12", "13"], correta: "12" },
  { pergunta: "Qual é o resultado de 9 x 3?", opcoes: ["21", "27", "24", "30"], correta: "27" },
  { pergunta: "Qual planeta é conhecido como Planeta Vermelho?", opcoes: ["Vênus", "Marte", "Júpiter", "Mercúrio"], correta: "Marte" },
  { pergunta: "Quanto é 20 - 8?", opcoes: ["10", "11", "12", "13"], correta: "12" },
  { pergunta: "Qual é o maior oceano do mundo?", opcoes: ["Atlântico", "Índico", "Ártico", "Pacífico"], correta: "Pacífico" },
  { pergunta: "Quanto é 6 x 6?", opcoes: ["30", "36", "42", "32"], correta: "36" },
  { pergunta: "Quem pintou a Mona Lisa?", opcoes: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"], correta: "Leonardo da Vinci" }
];

const emojisIngredientes = ["🍅", "🧀", "🥓", "🍄", "🫒", "🌽", "🍍", "🥬"];
const clientes = ["👨‍🍳", "👩‍🦰", "🧑", "👩", "👦", "👧"];

const estado = {
  estacao: "pedido",
  perguntaAtual: null,
  respostaCorreta: null,
  ingredienteEmoji: "🍕",
  pontos: 0,
  moedas: 0,
  vidas: 3,
  timerForno: null,
  tempoForno: 0,
  resultadoForno: null
};

const el = (id) => document.getElementById(id);

const estacoes = {
  pedido: el("estacao-pedido"),
  montagem: el("estacao-montagem"),
  forno: el("estacao-forno"),
  corte: el("estacao-corte"),
  entrega: el("estacao-entrega")
};

const nomesEstacoes = {
  pedido: "Estação: Pedido",
  montagem: "Estação: Montagem",
  forno: "Estação: Forno",
  corte: "Estação: Corte",
  entrega: "Estação: Entrega"
};

function atualizarHUD() {
  el("moedas").textContent = estado.moedas;
  el("pontos").textContent = estado.pontos;
}

function mostrarEstacao(nome) {
  estado.estacao = nome;
  Object.values(estacoes).forEach((sec) => sec.classList.remove("ativa"));
  estacoes[nome].classList.add("ativa");
  el("status-estacao").textContent = nomesEstacoes[nome];
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
  estado.respostaCorreta = estado.perguntaAtual.correta;
}

function definirCliente() {
  const emoji = clientes[Math.floor(Math.random() * clientes.length)];
  el("cliente-emoji").textContent = emoji;
}

function limparPizzas() {
  ["ingredientes-pizza", "ingredientes-pizza-forno", "ingredientes-pizza-corte", "ingredientes-pizza-entrega"].forEach((id) => {
    el(id).innerHTML = "";
  });

  ["pizza", "pizza-forno", "pizza-corte", "pizza-entrega"].forEach((id) => {
    const pizza = el(id);
    pizza.className = "pizza";
  });

  ["cortes", "cortes-corte", "cortes-entrega"].forEach((id) => {
    el(id).classList.remove("visivel");
  });

  el("msg-montagem").textContent = "";
  el("msg-montagem").className = "mensagem";
  el("msg-forno").textContent = "";
  el("msg-forno").className = "mensagem";
  el("msg-corte").textContent = "";
  el("msg-corte").className = "mensagem";
  el("msg-entrega").textContent = "";
}

function iniciarPedido() {
  limparPizzas();
  definirCliente();
  novaPergunta();
  estado.resultadoForno = null;

  el("fala-cliente").textContent = "Quero uma pizza com:";
  el("pedido-texto").textContent = estado.perguntaAtual.pergunta;
  el("btn-anotar").disabled = false;

  prepararMontagem();
  prepararForno();
  prepararCorte();
  prepararEntrega();
  mostrarEstacao("pedido");
}

function prepararMontagem() {
  const container = el("opcoes-ingredientes");
  container.innerHTML = "";
  const opcoes = embaralhar(estado.perguntaAtual.opcoes);

  opcoes.forEach((opcao, index) => {
    const emoji = emojisIngredientes[index % emojisIngredientes.length];
    const botao = document.createElement("button");
    botao.className = "btn btn-vermelho btn-ingrediente";
    botao.innerHTML = `<span class="emoji">${emoji}</span><span>${opcao}</span>`;
    botao.addEventListener("click", () => verificarResposta(opcao, emoji, botao));
    container.appendChild(botao);
  });
}

function verificarResposta(opcao, emoji, botao) {
  const botoes = el("opcoes-ingredientes").querySelectorAll("button");
  const pizza = el("pizza");
  const msg = el("msg-montagem");

  if (opcao === estado.respostaCorreta) {
    estado.ingredienteEmoji = emoji;
    botoes.forEach((b) => (b.disabled = true));
    botao.classList.remove("btn-vermelho");
    botao.classList.add("btn-correto");

    const item = document.createElement("span");
    item.textContent = emoji;
    el("ingredientes-pizza").appendChild(item);

    pizza.classList.add("animar");
    setTimeout(() => pizza.classList.remove("animar"), 600);

    msg.textContent = "Resposta correta! Ingrediente adicionado.";
    msg.className = "mensagem sucesso";

    setTimeout(() => irParaForno(), 900);
  } else {
    estado.vidas -= 1;
    pizza.classList.add("estragada");
    msg.textContent = "Resposta errada! A pizza estragou. Tente novamente.";
    msg.className = "mensagem erro";

    setTimeout(() => {
      pizza.classList.remove("estragada");
      if (estado.vidas <= 0) {
        msg.textContent = "Você perdeu todas as vidas. Novo pedido chegando...";
        botoes.forEach((b) => (b.disabled = true));
        estado.vidas = 3;
        setTimeout(iniciarPedido, 1500);
      }
    }, 700);
  }
}

function copiarIngredientes(destinoId) {
  const origem = el("ingredientes-pizza").innerHTML;
  el(destinoId).innerHTML = origem;
}

function irParaForno() {
  copiarIngredientes("ingredientes-pizza-forno");
  mostrarEstacao("forno");
}

function prepararForno() {
  estado.tempoForno = 0;
  estado.resultadoForno = null;
  if (estado.timerForno) {
    clearInterval(estado.timerForno);
    estado.timerForno = null;
  }
  el("progresso-forno").style.width = "0%";
  el("area-timer").classList.add("oculto");
  el("btn-colocar-forno").disabled = false;
  el("btn-retirar-forno").disabled = false;
  el("msg-forno").textContent = "";
  el("msg-forno").className = "mensagem";
  el("pizza-forno").className = "pizza";
}

function iniciarForno() {
  if (estado.timerForno) return;
  el("btn-colocar-forno").disabled = true;
  el("area-timer").classList.remove("oculto");
  el("msg-forno").textContent = "A pizza está assando...";

  const duracao = 5000;
  const inicio = Date.now();

  estado.timerForno = setInterval(() => {
    const decorrido = Date.now() - inicio;
    estado.tempoForno = Math.min(decorrido, duracao);
    const percentual = (estado.tempoForno / duracao) * 100;
    el("progresso-forno").style.width = `${percentual}%`;

    if (decorrido >= duracao) {
      clearInterval(estado.timerForno);
      estado.timerForno = null;
      retirarPizza(true);
    }
  }, 100);
}

function retirarPizza(automatico = false) {
  if (!automatico && !estado.timerForno && estado.tempoForno === 0) return;
  if (estado.timerForno) {
    clearInterval(estado.timerForno);
    estado.timerForno = null;
  }

  const percentual = (estado.tempoForno / 5000) * 100;
  const pizza = el("pizza-forno");
  const msg = el("msg-forno");

  if (percentual >= 40 && percentual <= 60) {
    estado.resultadoForno = "dourada";
    pizza.classList.add("dourada");
    msg.textContent = "Perfeito! Pizza no ponto certo.";
    msg.className = "mensagem sucesso";
  } else if (percentual < 40) {
    estado.resultadoForno = "crua";
    pizza.classList.add("crua");
    msg.textContent = "Você tirou cedo: pizza crua.";
    msg.className = "mensagem erro";
  } else {
    estado.resultadoForno = "queimada";
    pizza.classList.add("queimada");
    msg.textContent = "Você tirou tarde: pizza queimada.";
    msg.className = "mensagem erro";
  }

  el("btn-retirar-forno").disabled = true;
  setTimeout(irParaCorte, 1200);
}

function irParaCorte() {
  copiarIngredientes("ingredientes-pizza-corte");
  const pizza = el("pizza-corte");
  pizza.className = "pizza";
  if (estado.resultadoForno === "crua") pizza.classList.add("crua");
  if (estado.resultadoForno === "dourada") pizza.classList.add("dourada");
  if (estado.resultadoForno === "queimada") pizza.classList.add("queimada");
  mostrarEstacao("corte");
}

function prepararCorte() {
  el("cortes-corte").classList.remove("visivel");
  el("btn-cortar").disabled = false;
  el("msg-corte").textContent = "";
  el("msg-corte").className = "mensagem";
}

function cortarPizza() {
  el("cortes-corte").classList.add("visivel");
  el("pizza-corte").classList.add("animar");
  setTimeout(() => el("pizza-corte").classList.remove("animar"), 600);
  el("btn-cortar").disabled = true;
  el("msg-corte").textContent = "Pizza cortada em 8 fatias!";
  el("msg-corte").className = "mensagem sucesso";
  setTimeout(irParaEntrega, 900);
}

function irParaEntrega() {
  copiarIngredientes("ingredientes-pizza-entrega");
  const pizza = el("pizza-entrega");
  pizza.className = "pizza";
  if (estado.resultadoForno === "crua") pizza.classList.add("crua");
  if (estado.resultadoForno === "dourada") pizza.classList.add("dourada");
  if (estado.resultadoForno === "queimada") pizza.classList.add("queimada");
  el("cortes-entrega").classList.add("visivel");
  prepararEntrega();
  mostrarEstacao("entrega");
}

function prepararEntrega() {
  el("btn-entregar").disabled = false;
  el("msg-entrega").textContent = "Clique em entregar para receber a avaliação.";
}

function calcularPontuacao() {
  let moedas = 20;
  let pontos = 20;
  let avaliacao = "Bom trabalho! +20 Moedas";

  if (estado.resultadoForno === "dourada") {
    moedas += 30;
    pontos += 30;
    avaliacao = "Perfeito! Pizza no ponto. +50 Moedas";
  } else if (estado.resultadoForno === "crua") {
    moedas += 5;
    pontos += 5;
    avaliacao = "A pizza estava crua... +25 Moedas";
  } else if (estado.resultadoForno === "queimada") {
    moedas += 0;
    pontos += 0;
    avaliacao = "A pizza queimou um pouco... +20 Moedas";
  }

  return { moedas, pontos, avaliacao };
}

function entregarPizza() {
  const resultado = calcularPontuacao();
  estado.moedas += resultado.moedas;
  estado.pontos += resultado.pontos;
  atualizarHUD();

  el("msg-entrega").textContent = resultado.avaliacao;
  el("fala-cliente").textContent = "Obrigado pela pizza!";
  el("pedido-texto").textContent = `Você ganhou ${resultado.moedas} moedas.`;
  el("btn-entregar").disabled = true;

  setTimeout(iniciarPedido, 2200);
}

function configurarEventos() {
  el("btn-anotar").addEventListener("click", () => {
    el("btn-anotar").disabled = true;
    mostrarEstacao("montagem");
  });

  el("btn-colocar-forno").addEventListener("click", iniciarForno);
  el("btn-retirar-forno").addEventListener("click", () => retirarPizza(false));
  el("btn-cortar").addEventListener("click", cortarPizza);
  el("btn-entregar").addEventListener("click", entregarPizza);
}

configurarEventos();
atualizarHUD();
iniciarPedido();
