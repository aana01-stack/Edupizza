'use strict';

const ESPERA_MONTAGEM = 900;
const TEMPO_FORNO = 2000;
const ESPERA_ENTREGA = 700;

const telas = {
    menu: document.getElementById('tela-menu'),
    cliente: document.getElementById('tela-cliente'),
    cozinha: document.getElementById('tela-cozinha'),
    forno: document.getElementById('tela-forno'),
    entrega: document.getElementById('tela-entrega')
};

const balaoCliente = document.getElementById('balao-cliente');
const avatarCliente = document.getElementById('avatar-cliente');
const textoPedidoCozinha = document.getElementById('texto-pedido-cozinha');
const containerIngredientes = document.getElementById('ingredientes');
const pizza = document.getElementById('pizza');
const pizzaToppings = pizza.querySelector('.pizza-toppings');
const feedback = document.getElementById('feedback');
const forno = document.getElementById('forno');
const pizzaForno = document.getElementById('pizza-forno');
const barraForno = document.getElementById('barra-forno');
const textoForno = document.getElementById('texto-forno');
const tituloEntrega = document.getElementById('titulo-entrega');
const textoEntrega = document.getElementById('texto-entrega');
const moedaGanha = document.getElementById('moeda-ganha');
const btnAnotar = document.getElementById('btn-anotar');
const btnProximo = document.getElementById('btn-proximo');

let perguntaAtual = null;
let filaDeClientes = [];
let indiceAtual = 0;
let moedas = 10;
let nivel = 1;
let acertou = false;
let timerForno = null;

function mostrarTela(nome) {
    Object.values(telas).forEach(tela => tela.classList.remove('ativa'));
    telas[nome].classList.add('ativa');
}

function shuffle(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function atualizarHUD() {
    document.querySelectorAll('.hud-moedas').forEach(el => {
        el.textContent = moedas;
    });
    document.querySelectorAll('.hud-nivel').forEach(el => {
        el.textContent = nivel;
    });
}

function iniciarTurno() {
    filaDeClientes = shuffle(bancoDePerguntas);
    indiceAtual = 0;
    moedas = 10;
    nivel = 1;
    atualizarHUD();
    proximoCliente();
}

function proximoCliente() {
    if (indiceAtual >= filaDeClientes.length) {
        alert(`Fim do turno! Você ganhou ${moedas} moedas.`);
        mostrarTela('menu');
        return;
    }

    perguntaAtual = filaDeClientes[indiceAtual];
    balaoCliente.textContent = perguntaAtual.pergunta;
    avatarCliente.className = `cliente tipo-${(indiceAtual % 4) + 1}`;
    mostrarTela('cliente');
}

function anotarPedido() {
    textoPedidoCozinha.textContent = perguntaAtual.pergunta;
    montarCozinha();
    mostrarTela('cozinha');
}

function montarCozinha() {
    containerIngredientes.innerHTML = '';
    pizzaToppings.innerHTML = '';
    pizza.className = 'pizza pizza-vazia';
    feedback.textContent = '';
    feedback.style.color = '';

    const opcoes = shuffle(perguntaAtual.opcoes);
    const ingredientes = shuffle(perguntaAtual.ingredientes);

    opcoes.forEach((opcao, indice) => {
        const botao = document.createElement('button');
        botao.className = 'btn-ingrediente';
        const emoji = document.createElement('span');
        emoji.className = 'emoji';
        emoji.textContent = ingredientes[indice].split(' ')[0];
        const rotulo = document.createElement('span');
        rotulo.className = 'rotulo';
        rotulo.textContent = opcao;
        botao.append(emoji, rotulo);
        botao.addEventListener('click', () => verificarResposta(opcao, botao));
        containerIngredientes.appendChild(botao);
    });
}

function travarIngredientes() {
    document.querySelectorAll('.btn-ingrediente').forEach(botao => {
        botao.disabled = true;
    });
}

function adicionarToppings() {
    for (let i = 0; i < 10; i++) {
        const topping = document.createElement('span');
        topping.className = 'topping';
        topping.style.left = `${18 + Math.random() * 190}px`;
        topping.style.top = `${18 + Math.random() * 190}px`;
        topping.style.animationDelay = `${i * 0.03}s`;
        pizzaToppings.appendChild(topping);
    }
}

function verificarResposta(opcaoEscolhida, botaoClicado) {
    travarIngredientes();
    acertou = opcaoEscolhida === perguntaAtual.correta;

    if (acertou) {
        botaoClicado.classList.add('correto');
        pizza.classList.add('pizza-pronta');
        adicionarToppings();
        feedback.textContent = 'Delícia! Pizza pronta para o forno.';
        feedback.style.color = '#2e7d32';
        moedas += 10;
        atualizarHUD();
    } else {
        botaoClicado.classList.add('errado');
        pizza.classList.add('pizza-queimada');
        feedback.textContent = 'Ops! Esse ingrediente queimou a pizza...';
        feedback.style.color = '#c0392b';
    }

    window.setTimeout(assarPizza, ESPERA_MONTAGEM);
}

function assarPizza() {
    mostrarTela('forno');
    forno.className = 'forno assando';
    pizzaForno.style.backgroundColor = '';
    barraForno.style.width = '0%';
    textoForno.textContent = 'Assando...';

    let progresso = 0;
    window.clearInterval(timerForno);
    timerForno = window.setInterval(() => {
        progresso += 4;
        barraForno.style.width = `${progresso}%`;
        if (progresso < 60) {
            barraForno.style.background = '#4caf50';
        } else if (progresso < 85) {
            barraForno.style.background = '#f6b352';
        } else {
            barraForno.style.background = '#e74c3c';
        }
        if (progresso >= 100) {
            window.clearInterval(timerForno);
            finalizarForno();
        }
    }, TEMPO_FORNO / 25);
}

function finalizarForno() {
    forno.classList.remove('assando');
    if (acertou) {
        forno.classList.add('pronto');
        textoForno.textContent = 'Pizza pronta!';
    } else {
        forno.classList.add('queimado');
        textoForno.textContent = 'Pizza queimada!';
    }
    window.setTimeout(prepararEntrega, ESPERA_ENTREGA);
}

function prepararEntrega() {
    tituloEntrega.textContent = acertou ? 'Pedido entregue!' : 'Pizza queimou!';
    textoEntrega.textContent = acertou
        ? 'O cliente adorou a resposta.'
        : 'O cliente ficou triste. Tente outro ingrediente!';
    moedaGanha.textContent = acertou ? '+10 🪙' : '+0 🪙';
    mostrarTela('entrega');
}

function proximoPedido() {
    indiceAtual++;
    proximoCliente();
}

document.getElementById('btn-iniciar').addEventListener('click', iniciarTurno);
btnAnotar.addEventListener('click', anotarPedido);
btnProximo.addEventListener('click', proximoPedido);
