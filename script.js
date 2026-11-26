let fases = [];
let perguntaAtual = null;
let moedas = 0;
let tempoForno = 0;
let intervalForno = null;
let pizzariaAberta = false;
let faseAtual = null;
let listaPerguntasAtual = [];
let indicePerguntaAtual = 0;

const ui = {
    sidebar: document.getElementById('sidebar-ingredientes'),
    textoPedido: document.getElementById('texto-pedido'),
    moedas: document.getElementById('moedas'),
    pizzaMontagem: document.getElementById('pizza-montagem'),
    pizzaForno: document.getElementById('pizza-forno'),
    barraForno: document.getElementById('barra-forno'),
    btnForno: document.getElementById('btn-forno'),
    statusTicket: document.getElementById('status-ticket'),
    btnOpen: document.getElementById('btn-open'),
    comandaFisica: document.getElementById('comanda-fisica'),
    clienteNaFila: document.getElementById('cliente-na-fila')
};

// 1. Carregar dados e criar menu
fetch('perguntas.json')
    .then(res => res.json())
    .then(data => {
        fases = data;
        criarMenu();
    })
    .catch(err => console.error('Erro ao carregar perguntas.json:', err));

function criarMenu() {
    const grid = document.getElementById('grid-fases');
    grid.innerHTML = '';

    fases.forEach(fase => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.onclick = () => iniciarFase(fase.id);
        
        tile.innerHTML = `
            <div class="tile__sticker" style="background-color: ${fase.cor};">${fase.icone}</div>
            <div class="tile__info">
                <span class="tile__name">${fase.nome}</span>
                <span class="tile__meta">${fase.descricao}</span>
            </div>
        `;
        grid.appendChild(tile);
    });
}

function iniciarFase(idFase) {
    faseAtual = fases.find(f => f.id === idFase);
    listaPerguntasAtual = faseAtual.perguntas;
    indicePerguntaAtual = 0;
    moedas = 0;
    ui.moedas.innerText = moedas;

    document.getElementById('tela-selecao').style.display = 'none';
    document.getElementById('jogo-container').style.display = 'flex';

    pizzariaAberta = false;
    ui.btnOpen.style.display = 'block';
    ui.clienteNaFila.style.display = 'none';
    ui.comandaFisica.style.display = 'none';
    ui.pizzaMontagem.innerHTML = '';
    ui.pizzaForno.className = 'pizza-area';
    ui.barraForno.style.width = '0%';
    ui.btnForno.disabled = false;
    ui.btnForno.innerText = "Colocar no Forno";
    ui.textoPedido.innerText = "Aguardando...";
    
    mudarEstacao('estacao-pedido');
}

function voltarAoMenu() {
    document.getElementById('tela-selecao').style.display = 'block';
    document.getElementById('jogo-container').style.display = 'none';
    if(intervalForno) clearInterval(intervalForno);
}

// 2. Lógica do Jogo
function abrirPizzaria() {
    if (pizzariaAberta) return;
    pizzariaAberta = true;
    ui.btnOpen.style.display = 'none';
    ui.clienteNaFila.style.display = 'block'; 
}

function atenderCliente() {
    if (indicePerguntaAtual >= listaPerguntasAtual.length) {
        ui.textoPedido.innerText = "Todos os pedidos de hoje foram entregues! Você concluiu a fase.";
        ui.statusTicket.innerText = "Fim da Fase!";
        ui.clienteNaFila.style.display = 'none';
        return;
    }

    perguntaAtual = listaPerguntasAtual[indicePerguntaAtual];
    
    ui.textoPedido.innerText = `Quero uma pizza com a resposta para: ${perguntaAtual.pergunta}`;
    ui.statusTicket.innerText = "Aguardando...";
    
    ui.clienteNaFila.style.display = 'none';
    ui.comandaFisica.style.display = 'flex';
}

function pegarComanda() {
    ui.comandaFisica.style.display = 'none';
    irParaMontagem();
}

function irParaMontagem() {
    ui.sidebar.innerHTML = '';
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
        
        const bolinha = document.createElement('div');
        bolinha.style.width = '30px';
        bolinha.style.height = '30px';
        bolinha.style.backgroundColor = '#d32f2f';
        bolinha.style.borderRadius = '50%';
        bolinha.style.position = 'absolute';
        bolinha.style.top = Math.random() * 150 + 'px';
        bolinha.style.left = Math.random() * 150 + 'px';
        ui.pizzaMontagem.appendChild(bolinha);

        document.querySelectorAll('.btn-ingrediente').forEach(b => b.disabled = true);
        document.getElementById('btn-montagem-feita').style.display = 'block';
    } else {
        btn.style.backgroundColor = '#d32f2f';
        btn.disabled = true;
        ui.textoPedido.innerText = "Ingrediente errado! Tente novamente.";
    }
}

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

function entregarPizza() {
    moedas += 10;
    ui.moedas.innerText = moedas;
    ui.textoPedido.innerText = "Pedido Entregue! +10 Moedas";
    ui.statusTicket.innerText = "Finalizado!";
    
    indicePerguntaAtual++;

    pizzariaAberta = false;
    ui.btnOpen.style.display = 'block';
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
