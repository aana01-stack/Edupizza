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

const FASES_PADRAO = [
    {
        id: "matematica",
        nome: "Matemática",
        descricao: "Contas e troco",
        cor: "#C42A45",
        icone: "M",
        perguntas: [
            { pergunta: "Quanto é 7 x 8?", opcoes: ["48", "56", "64", "72"], correta: "56" },
            { pergunta: "Quanto é 15 + 27?", opcoes: ["32", "42", "52", "38"], correta: "42" },
            { pergunta: "Quanto é 100 ÷ 4?", opcoes: ["20", "25", "30", "15"], correta: "25" }
        ]
    },
    {
        id: "portugues",
        nome: "Português",
        descricao: "Ortografia e gramática",
        cor: "#2E7D6B",
        icone: "P",
        perguntas: [
            { pergunta: "Como se escreve corretamente?", opcoes: ["Calabresa", "Calabreza", "Kcalabresa"], correta: "Calabresa" },
            { pergunta: "Qual palavra está correta?", opcoes: ["Pizzaria", "Pizaria", "Pitsaria"], correta: "Pizzaria" },
            { pergunta: "Qual é o plural de 'Pão'?", opcoes: ["Pãos", "Pães", "Pões"], correta: "Pães" }
        ]
    },
    {
        id: "historia",
        nome: "História",
        descricao: "Fatos e datas",
        cor: "#E9B44C",
        icone: "H",
        perguntas: [
            { pergunta: "Quem descobriu o Brasil?", opcoes: ["Cabral", "Colombo", "Dom Pedro", "Vasco"], correta: "Cabral" },
            { pergunta: "Em que ano o Brasil foi descoberto?", opcoes: ["1500", "1492", "1822", "1889"], correta: "1500" },
            { pergunta: "Quem proclamou a Independência?", opcoes: ["Dom Pedro I", "Dom Pedro II", "Tiradentes", "Getúlio Vargas"], correta: "Dom Pedro I" }
        ]
    }
];

// 1. Carregar dados e criar menu
fetch('perguntas.json')
    .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar perguntas.json');
        return res.json();
    })
    .then(data => {
        fases = Array.isArray(data) ? data : FASES_PADRAO;
        criarMenu();
    })
    .catch(err => {
        console.warn('Usando perguntas padrão:', err);
        fases = FASES_PADRAO;
        criarMenu();
    });

function criarMenu() {
    const grid = document.getElementById('grid-fases');
    grid.innerHTML = '';

    fases.forEach(fase => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.onclick = () => iniciarFase(fase.id);
        tile.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                iniciarFase(fase.id);
            }
        };

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
    if (!faseAtual) return;
    listaPerguntasAtual = Array.isArray(faseAtual.perguntas) ? faseAtual.perguntas : [];
    indicePerguntaAtual = 0;
    moedas = 0;
    ui.moedas.innerText = moedas;

    document.getElementById('tela-selecao').style.display = 'none';
    document.getElementById('jogo-container').style.display = 'flex';

    resetarRodada();
    ui.textoPedido.innerText = "Aguardando...";
    ui.statusTicket.innerText = "Aguardando...";
    mudarEstacao('estacao-pedido');
}

function voltarAoMenu() {
    if (intervalForno) {
        clearInterval(intervalForno);
        intervalForno = null;
    }
    document.getElementById('tela-selecao').style.display = 'block';
    document.getElementById('jogo-container').style.display = 'none';
    ui.sidebar.innerHTML = '';
}

function resetarRodada() {
    if (intervalForno) {
        clearInterval(intervalForno);
        intervalForno = null;
    }
    pizzariaAberta = false;
    ui.btnOpen.style.display = 'block';
    ui.clienteNaFila.style.display = 'none';
    ui.comandaFisica.style.display = 'none';
    ui.pizzaMontagem.innerHTML = '';
    ui.pizzaForno.innerHTML = '';
    ui.pizzaForno.className = 'pizza-area';
    const pizzaCorte = document.getElementById('pizza-corte');
    if (pizzaCorte) {
        pizzaCorte.innerHTML = '<div class="linha-corte"></div><div class="linha-corte horizontal"></div>';
        pizzaCorte.className = 'pizza-area';
    }
    ui.barraForno.style.width = '0%';
    ui.barraForno.style.backgroundColor = '#4CAF50';
    ui.btnForno.disabled = false;
    ui.btnForno.innerText = "Colocar no Forno";
    document.getElementById('btn-montagem-feita').style.display = 'none';
    ui.sidebar.innerHTML = '';
}

// 2. Lógica do Jogo
function abrirPizzaria() {
    if (pizzariaAberta) return;
    pizzariaAberta = true;
    ui.btnOpen.style.display = 'none';
    ui.clienteNaFila.style.display = 'block';
    ui.statusTicket.innerText = "Cliente na fila";
}

function atenderCliente() {
    if (indicePerguntaAtual >= listaPerguntasAtual.length) {
        ui.textoPedido.innerText = "Todos os pedidos de hoje foram entregues! Você concluiu a fase.";
        ui.statusTicket.innerText = "Fim da Fase!";
        ui.clienteNaFila.style.display = 'none';
        pizzariaAberta = false;
        ui.btnOpen.style.display = 'none';
        return;
    }

    perguntaAtual = listaPerguntasAtual[indicePerguntaAtual];

    ui.textoPedido.innerText = `Quero uma pizza com a resposta para: ${perguntaAtual.pergunta}`;
    ui.statusTicket.innerText = "Pedido anotado";

    ui.clienteNaFila.style.display = 'none';
    ui.comandaFisica.style.display = 'flex';
}

function pegarComanda() {
    ui.comandaFisica.style.display = 'none';
    irParaMontagem();
}

function irParaMontagem() {
    ui.sidebar.innerHTML = '';
    const opcoes = Array.isArray(perguntaAtual.opcoes) ? [...perguntaAtual.opcoes] : [];
    opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-ingrediente';
        btn.innerText = opcao;
        btn.onclick = () => verificarIngrediente(opcao, btn);
        ui.sidebar.appendChild(btn);
    });
    ui.statusTicket.innerText = "Montando";
    mudarEstacao('estacao-montagem');
}

function verificarIngrediente(opcao, btn) {
    if (opcao === perguntaAtual.correta) {
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';

        const bolinha = document.createElement('div');
        bolinha.className = 'cobertura';
        bolinha.style.top = (20 + Math.random() * 170) + 'px';
        bolinha.style.left = (20 + Math.random() * 170) + 'px';
        ui.pizzaMontagem.appendChild(bolinha);

        document.querySelectorAll('.btn-ingrediente').forEach(b => b.disabled = true);
        document.getElementById('btn-montagem-feita').style.display = 'block';
        ui.textoPedido.innerText = `Correto! ${perguntaAtual.pergunta}`;
        ui.statusTicket.innerText = "Pronta para forno";
    } else {
        btn.style.backgroundColor = '#d32f2f';
        btn.style.color = 'white';
        btn.disabled = true;
        ui.textoPedido.innerText = "Ingrediente errado! Tente novamente.";
        ui.statusTicket.innerText = "Resposta incorreta";
    }
}

function copiarCoberturas(origem, destino, manterLinhasCorte = false) {
    destino.innerHTML = '';
    if (manterLinhasCorte) {
        destino.innerHTML = '<div class="linha-corte"></div><div class="linha-corte horizontal"></div>';
    }
    origem.querySelectorAll('.cobertura').forEach(cobertura => {
        destino.appendChild(cobertura.cloneNode(true));
    });
}

function irParaForno() {
    copiarCoberturas(ui.pizzaMontagem, ui.pizzaForno);
    ui.sidebar.innerHTML = '';
    ui.statusTicket.innerText = "No forno";
    mudarEstacao('estacao-forno');
    document.getElementById('btn-montagem-feita').style.display = 'none';
}

function acionarForno() {
    if (ui.btnForno.innerText === "Colocar no Forno") {
        ui.btnForno.innerText = "Retirar Pizza";
        ui.statusTicket.innerText = "Assando...";
        tempoForno = 0;
        intervalForno = setInterval(() => {
            tempoForno += 2;
            ui.barraForno.style.width = tempoForno + '%';
            if (tempoForno < 40) ui.barraForno.style.backgroundColor = '#4CAF50';
            else if (tempoForno < 70) ui.barraForno.style.backgroundColor = '#ffeb3b';
            else ui.barraForno.style.backgroundColor = '#d32f2f';
            if (tempoForno >= 100) {
                clearInterval(intervalForno);
                intervalForno = null;
                finalizarForno();
            }
        }, 100);
    } else {
        if (intervalForno) {
            clearInterval(intervalForno);
            intervalForno = null;
        }
        finalizarForno();
    }
}

function finalizarForno() {
    if (ui.btnForno.disabled) return;
    ui.btnForno.disabled = true;
    ui.pizzaForno.classList.remove('dourada', 'queimada');
    if (tempoForno >= 40 && tempoForno <= 70) ui.pizzaForno.classList.add('dourada');
    else if (tempoForno > 70) ui.pizzaForno.classList.add('queimada');

    const pizzaCorte = document.getElementById('pizza-corte');
    if (pizzaCorte) {
        copiarCoberturas(ui.pizzaForno, pizzaCorte, true);
        pizzaCorte.classList.remove('dourada', 'queimada');
        if (ui.pizzaForno.classList.contains('dourada')) pizzaCorte.classList.add('dourada');
        if (ui.pizzaForno.classList.contains('queimada')) pizzaCorte.classList.add('queimada');
    }

    ui.statusTicket.innerText = "Pronta para cortar";
    setTimeout(() => { mudarEstacao('estacao-corte'); }, 1200);
}

function entregarPizza() {
    moedas += 10;
    ui.moedas.innerText = moedas;
    ui.textoPedido.innerText = "Pedido Entregue! +10 Moedas";
    ui.statusTicket.innerText = "Finalizado!";

    indicePerguntaAtual++;
    resetarRodada();

    setTimeout(() => { mudarEstacao('estacao-pedido'); }, 1500);
}

function mudarEstacao(id) {
    document.querySelectorAll('.estacao').forEach(el => el.classList.remove('ativa'));
    const alvo = document.getElementById(id);
    if (alvo) alvo.classList.add('ativa');
}
