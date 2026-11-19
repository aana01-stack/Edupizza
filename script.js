const bancoDePerguntas = [
    { pergunta: "Qual é a capital da França?", opcoes: ["Paris", "Londres", "Berlim", "Roma"], correta: "Paris" },
    { pergunta: "Quanto é 7 x 8?", opcoes: ["48", "56", "64", "72"], correta: "56" },
    { pergunta: "Quem descobriu o Brasil?", opcoes: ["Cabral", "Colombo", "Dom Pedro", "Vasco"], correta: "Cabral" },
    { pergunta: "Maior planeta do Sistema Solar?", opcoes: ["Terra", "Marte", "Júpiter", "Saturno"], correta: "Júpiter" }
];

let perguntaAtual = null;
let moedas = 0;
let tempoForno = 0;
let intervalForno = null;

// Elementos DOM
const ui = {
    sidebar: document.getElementById('sidebar-ingredientes'),
    textoPedido: document.getElementById('texto-pedido'),
    moedas: document.getElementById('moedas'),
    pizzaMontagem: document.getElementById('pizza-montagem'),
    pizzaForno: document.getElementById('pizza-forno'),
    barraForno: document.getElementById('barra-forno'),
    btnForno: document.getElementById('btn-forno'),
    statusTicket: document.getElementById('status-ticket')
};

// 1. Iniciar Jogo
function novoCliente() {
    const index = Math.floor(Math.random() * bancoDePerguntas.length);
    perguntaAtual = bancoDePerguntas[index];
    ui.textoPedido.innerText = `Quero uma pizza com a resposta para: ${perguntaAtual.pergunta}`;
    ui.statusTicket.innerText = "Aguardando...";
    
    // Limpar visuais
    ui.sidebar.innerHTML = '';
    ui.pizzaMontagem.innerHTML = '';
    ui.pizzaMontagem.className = 'pizza-area';
    ui.pizzaForno.className = 'pizza-area';
    ui.barraForno.style.width = '0%';
    ui.btnForno.disabled = false;
    ui.btnForno.innerText = "Colocar no Forno";
    
    mudarEstacao('estacao-pedido');
}

// 2. Mudar de Estação
function mudarEstacao(id) {
    document.querySelectorAll('.estacao').forEach(el => el.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
}

// 3. Ir para Montagem
function irParaMontagem() {
    ui.sidebar.innerHTML = ''; // Limpa os botões antigos
    ui.statusTicket.innerText = "Montando...";
    
    perguntaAtual.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.className = 'btn-ingrediente';
        btn.innerText = opcao;
        btn.onclick = () => verificarIngrediente(opcao, btn);
        ui.sidebar.appendChild(btn);
    });
    
    mudarEstacao('estacao-montagem');
}

// 4. Verificar Resposta
function verificarIngrediente(opcao, btn) {
    if (opcao === perguntaAtual.correta) {
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        ui.pizzaMontagem.innerHTML = '<span style="font-size: 100px;">🍕</span>';
        ui.textoPedido.innerText = "Ingrediente correto!";
        
        document.querySelectorAll('.btn-ingrediente').forEach(b => b.disabled = true);
        document.getElementById('btn-montagem-feita').style.display = 'block';
    } else {
        btn.style.backgroundColor = '#d32f2f';
        btn.disabled = true;
        ui.textoPedido.innerText = "Ops! Ingrediente errado. Tente outro.";
    }
}

// 5. Forno
function irParaForno() {
    document.getElementById('btn-montagem-feita').style.display = 'none'; // Esconde o botão anterior
    mudarEstacao('estacao-forno');
    ui.statusTicket.innerText = "Assando...";
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

            if (tempoForno >= 100) {
                clearInterval(intervalForno);
                finalizarForno();
            }
        }, 100);
    } else {
        clearInterval(intervalForno);
        finalizarForno();
    }
}

function finalizarForno() {
    ui.btnForno.disabled = true;
    if (tempoForno >= 40 && tempoForno <= 70) {
        ui.pizzaForno.classList.add('dourada');
        ui.statusTicket.innerText = "Pizza no ponto!";
    } else if (tempoForno > 70) {
        ui.pizzaForno.classList.add('queimada');
        ui.statusTicket.innerText = "Pizza queimada!";
    } else {
        ui.statusTicket.innerText = "Pizza crua!";
    }

    setTimeout(() => {
        mudarEstacao('estacao-corte');
    }, 1500);
}

// 6. Entrega
function irParaEntrega() {
    mudarEstacao('estacao-entrega');
}

function entregarPizza() {
    moedas += 10;
    ui.moedas.innerText = moedas;
    ui.textoPedido.innerText = "Pedido Entregue com Sucesso!";
    ui.statusTicket.innerText = "Finalizado! +10 Moedas";
    setTimeout(novoCliente, 2000);
}

// Inicia o jogo ao carregar
novoCliente();

// Adiciona o evento do botão de entrega
document.getElementById('estacao-entrega').querySelector('.btn-acao').onclick = entregarPizza;
