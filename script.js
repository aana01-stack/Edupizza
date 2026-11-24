const bancoDePerguntas = [
    { pergunta: "Quanto é 7 x 8?", opcoes: ["48", "56", "64", "72"], correta: "56" },
    { pergunta: "Qual é a capital da França?", opcoes: ["Paris", "Londres", "Berlim", "Roma"], correta: "Paris" },
    { pergunta: "Quem descobriu o Brasil?", opcoes: ["Cabral", "Colombo", "Dom Pedro", "Vasco"], correta: "Cabral" }
];

let perguntaAtual = null;
let moedas = 0;
let tempoForno = 0;
let intervalForno = null;
let pizzariaAberta = false;

const ui = {
    sidebar: document.getElementById('sidebar-ingredientes'),
    textoPedido: document.getElementById('texto-pedido'),
    moedas: document.getElementById('moedas'),
    pizzaMontagem: document.getElementById('pizza-montagem'),
    pizzaForno: document.getElementById('pizza-forno'),
    barraForno: document.getElementById('barra-forno'),
    btnForno: document.getElementById('btn-forno'),
    statusTicket: document.getElementById('status-ticket'),
    filaClientes: document.getElementById('fila-clientes'),
    btnOpen: document.getElementById('btn-open'),
    comandaFisica: document.getElementById('comanda-fisica')
};

// Iniciar Jogo
function iniciarJogo() {
    document.getElementById('tela-inicial').classList.add('escondida');
    document.getElementById('jogo-principal').style.display = 'flex';
}

// Abrir Pizzaria (Lobby)
function abrirPizzaria() {
    if (pizzariaAberta) return;
    pizzariaAberta = true;
    ui.btnOpen.style.display = 'none';
    
    // Adiciona 3 clientes na fila
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const cliente = document.createElement('div');
            cliente.style.fontSize = '80px';
            cliente.innerText = ['👨‍🍳', '👩‍🦰', '🧔'][i];
            cliente.style.cursor = 'pointer';
            cliente.onclick = () => atenderCliente();
            ui.filaClientes.appendChild(cliente);
        }, i * 1000);
    }
}

// Atender Cliente
function atenderCliente() {
    const index = Math.floor(Math.random() * bancoDePerguntas.length);
    perguntaAtual = bancoDePerguntas[index];
    
    ui.textoPedido.innerText = `Quero uma pizza com a resposta para: ${perguntaAtual.pergunta}`;
    ui.statusTicket.innerText = "Aguardando...";
    ui.comandaFisica.style.display = 'flex'; // Mostra a comanda na mesa
}

// Pegar Comanda e ir para Montagem
function pegarComanda() {
    ui.comandaFisica.style.display = 'none';
    ui.filaClientes.innerHTML = ''; // Limpa a fila para o próximo
    irParaMontagem();
}

function irParaMontagem() {
    ui.sidebar.innerHTML = ''; // Limpa os botões antigos
    
    perguntaAtual.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.className = 'btn-ingrediente';
        btn.innerText = opcao;
        btn.onclick = () => verificarIngrediente(opcao, btn);
        ui.sidebar.appendChild(btn);
    });
    
    mudarEstacao('estacao-montagem');
}

function verificarIngrediente(opcao, btn) {
    if (opcao === perguntaAtual.correta) {
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        ui.pizzaMontagem.innerHTML = '<span style="font-size: 100px;">🍕</span>';
        
        document.querySelectorAll('.btn-ingrediente').forEach(b => b.disabled = true);
        document.getElementById('btn-montagem-feita').style.display = 'block';
    } else {
        btn.style.backgroundColor = '#d32f2f';
        btn.disabled = true;
    }
}

// Forno
function irParaForno() {
    mudarEstacao('estacao-forno');
    document.getElementById('btn-montagem-feita').style.display = 'none';
}

function acionarForno() {
    if (ui.btnForno.innerText === "Colocar no Forno") {
        ui.btnForno.innerText = "Retirar Pizza";
        tempoForno = 0;
        intervalForno = setInterval(() => {
            tempoForno += 2;
            ui.barraForno.style.width = tempoForno + '%';
            if (tempoForno < 40) ui.barraForno.style.backgroundColor = '#4CAF50';
            else if (tempoForno < 70) ui.barraForno.style.backgroundColor = '#ffeb3b';
            else ui.barraForno.style.backgroundColor = '#d32f2f';
            if (tempoForno >= 100) { clearInterval(intervalForno); finalizarForno(); }
        }, 100);
    } else {
        clearInterval(intervalForno);
        finalizarForno();
    }
}

function finalizarForno() {
    ui.btnForno.disabled = true;
    if (tempoForno >= 40 && tempoForno <= 70) ui.pizzaForno.classList.add('dourada');
    else if (tempoForno > 70) ui.pizzaForno.classList.add('queimada');
    
    setTimeout(() => { mudarEstacao('estacao-corte'); }, 1500);
}

// Entrega
function entregarPizza() {
    moedas += 10;
    ui.moedas.innerText = moedas;
    ui.textoPedido.innerText = "Pedido Entregue! +10 Moedas";
    ui.statusTicket.innerText = "Finalizado!";
    pizzariaAberta = false;
    ui.btnOpen.style.display = 'block'; // Permite abrir a pizzaria de novo
    ui.btnForno.disabled = false;
    ui.btnForno.innerText = "Colocar no Forno";
    ui.pizzaForno.className = 'pizza-area';
    ui.barraForno.style.width = '0%';
    ui.pizzaMontagem.innerHTML = '';
    
    setTimeout(() => { mudarEstacao('estacao-pedido'); }, 2000);
}

function mudarEstacao(id) {
    document.querySelectorAll('.estacao').forEach(el => el.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
}
