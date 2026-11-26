const bancoDePerguntas = [
    { pergunta: 'Qual é a capital da França?', opcoes: ['Paris', 'Londres', 'Berlim', 'Roma'], correta: 'Paris' },
    { pergunta: 'Quanto é 7 x 8?', opcoes: ['48', '56', '64', '72'], correta: '56' },
    { pergunta: 'Quem descobriu o Brasil?', opcoes: ['Cabral', 'Colombo', 'Dom Pedro', 'Vasco'], correta: 'Cabral' },
    { pergunta: 'Maior planeta do Sistema Solar?', opcoes: ['Terra', 'Marte', 'Júpiter', 'Saturno'], correta: 'Júpiter' },
    { pergunta: 'Uma pizza custa R$ 32,00 e um suco R$ 8,00. Quanto é a total?', opcoes: ['R$ 38,00', 'R$ 40,00', 'R$ 42,00', 'R$ 48,00'], correta: 'R$ 40,00' },
    { pergunta: 'Cada fatia custa R$ 6,00. Quanto custam 5 fatias?', opcoes: ['R$ 25,00', 'R$ 30,00', 'R$ 35,00', 'R$ 36,00'], correta: 'R$ 30,00' },
    { pergunta: 'Qual palavra está escrita corretamente?', opcoes: ['Delicíoso', 'Delicioso', 'Deliciozo', 'Delisioso'], correta: 'Delicioso' },
    { pergunta: 'Complete: "Eu quero um ___ de laranja."', opcoes: ['suco', 'súco', 'suqo', 'ssuco'], correta: 'suco' }
];

const ingredientes = {
    tomate: { emoji: '🍅', nome: 'tomate' },
    queijo: { emoji: '🧀', nome: 'queijo' },
    bacon: { emoji: '🥓', nome: 'bacon' },
    cogumelo: { emoji: '🍄', nome: 'cogumelo' }
};

const chavesIngredientes = Object.keys(ingredientes);

const modelosClientes = [
    { nome: 'Ana', emoji: '👩‍🦰', fala: 'Quero uma pizza caprichada!' },
    { nome: 'Bia', emoji: '👧', fala: 'Tem queijo e pepperoni?' },
    { nome: 'Carlos', emoji: '🧔', fala: 'Estou com fome!' },
    { nome: 'Duda', emoji: '👩', fala: 'Uma pizza para mim, por favor!' },
    { nome: 'João', emoji: '👨‍🍳', fala: 'Faz igualzinho à comanda!' },
    { nome: 'Léo', emoji: '👦', fala: 'Mal posso esperar!' }
];

const imagensClientes = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia'
];

const ui = {
    telaInicial: document.getElementById('tela-inicial'),
    modal: document.getElementById('modal-info'),
    modalTitulo: document.getElementById('modal-titulo'),
    modalTexto: document.getElementById('modal-texto'),
    jogo: document.getElementById('jogo'),
    lobby: document.getElementById('lobby'),
    cozinha: document.getElementById('cozinha'),
    btnStart: document.getElementById('btn-start'),
    btnHelp: document.getElementById('btn-help'),
    btnCredits: document.getElementById('btn-credits'),
    btnFecharModal: document.getElementById('btn-fechar-modal'),
    btnMenu: document.getElementById('btn-menu'),
    moedas: document.getElementById('moedas'),
    pontos: document.getElementById('pontos'),
    btnOpen: document.getElementById('btn-open'),
    fila: document.getElementById('fila-clientes'),
    mensagemLobby: document.getElementById('mensagem-lobby'),
    sidebar: document.getElementById('sidebar-ingredientes'),
    comandaMontagem: document.getElementById('comanda-montagem'),
    estacaoMontagem: document.getElementById('estacao-montagem'),
    pizzaMontagem: document.getElementById('pizza-montagem'),
    btnMontagemFeita: document.getElementById('btn-montagem-feita'),
    pizzaForno: document.getElementById('pizza-forno'),
    barraForno: document.getElementById('barra-forno'),
    btnForno: document.getElementById('btn-forno'),
    pizzaCorte: document.getElementById('pizza-corte'),
    btnCorte: document.getElementById('btn-corte'),
    perguntaEntrega: document.getElementById('pergunta-entrega'),
    opcoesEntrega: document.getElementById('opcoes-entrega'),
    resultadoEntrega: document.getElementById('resultado-entrega'),
    btnProximo: document.getElementById('btn-proximo'),
    textoPedido: document.getElementById('texto-pedido'),
    progressoPedido: document.getElementById('progresso-pedido'),
    statusTicket: document.getElementById('status-ticket')
};

let perguntaAtual = null;
let pedidoAtual = null;
let moedas = 0;
let pontos = 0;
let tempoForno = 0;
let intervalForno = null;
let fila = [];
let filaAtiva = false;
let intervalFila = null;
let proximoClienteId = 1;
let respostaDada = false;
let indicePerguntaAnterior = -1;

function atualizarPlacar() {
    ui.moedas.innerText = moedas;
    ui.pontos.innerText = pontos;
}

function alterarPontos(valor) {
    pontos = Math.max(0, pontos + valor);
    atualizarPlacar();
}

function definirStatus(texto) {
    ui.statusTicket.innerText = texto;
}

function mudarEstacao(id) {
    document.querySelectorAll('.estacao').forEach(el => el.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
}

function abrirModal(titulo, texto) {
    ui.modalTitulo.innerText = titulo;
    ui.modalTexto.innerText = texto;
    ui.modal.classList.remove('escondido');
}

function sortearPergunta() {
    let indice;
    do {
        indice = Math.floor(Math.random() * bancoDePerguntas.length);
    } while (bancoDePerguntas.length > 1 && indice === indicePerguntaAnterior);
    indicePerguntaAnterior = indice;
    return bancoDePerguntas[indice];
}

function gerarReceita() {
    const sorteados = [...chavesIngredientes].sort(() => Math.random() - 0.5);
    return [
        ...Array(3).fill(sorteados[0]),
        ...Array(2).fill(sorteados[1]),
        sorteados[2]
    ];
}

function iniciarJogo() {
    ui.telaInicial.classList.add('escondida');
    ui.jogo.classList.remove('escondido');
    ui.lobby.classList.add('ativa');
    ui.cozinha.classList.add('escondido');
}

function voltarMenu() {
    pararForno();
    clearInterval(intervalFila);
    filaAtiva = false;
    fila = [];
    pedidoAtual = null;
    renderizarFila();
    ui.btnOpen.innerText = 'OPEN';
    ui.btnOpen.classList.remove('fechado');
    ui.cozinha.classList.add('escondido');
    ui.lobby.classList.remove('ativa');
    ui.jogo.classList.add('escondido');
    ui.telaInicial.classList.remove('escondida');
}

function alternarAbertura() {
    if (!filaAtiva) {
        filaAtiva = true;
        ui.btnOpen.innerText = 'ABERTO';
        ui.btnOpen.classList.remove('fechado');
        ui.mensagemLobby.innerText = 'A pizzaria está aberta! Clique em um cliente da fila.';
        adicionarCliente();
        intervalFila = setInterval(adicionarCliente, 6000);
    } else {
        filaAtiva = false;
        clearInterval(intervalFila);
        ui.btnOpen.innerText = 'CLOSED';
        ui.btnOpen.classList.add('fechado');
        ui.mensagemLobby.innerText = 'Pizzaria fechada. Clique em CLOSED para reabrir.';
    }
}

function adicionarCliente() {
    if (!filaAtiva || fila.length >= 4) return;
    const modelo = modelosClientes[Math.floor(Math.random() * modelosClientes.length)];
    fila.push({ ...modelo, id: proximoClienteId++ });
    renderizarFila();
    ui.mensagemLobby.innerText = `${fila.length} cliente(s) esperando. Clique em um para anotar o pedido!`;
}

function renderizarFila() {
    ui.fila.innerHTML = '';
    fila.forEach(cliente => {
        const btn = document.createElement('button');
        const emoji = document.createElement('span');
        const avatar = document.createElement('img');

        btn.className = 'cliente';
        btn.dataset.fala = cliente.fala;
        btn.title = `Atender ${cliente.nome}`;
        btn.setAttribute('aria-label', `Atender ${cliente.nome}`);
        btn.onclick = () => atenderCliente(cliente.id);

        emoji.className = 'cliente-emoji';
        emoji.innerText = cliente.emoji;

        avatar.className = 'cliente-avatar';
        avatar.src = imagensClientes[cliente.id % imagensClientes.length];
        avatar.alt = cliente.nome;
        avatar.onload = () => { emoji.style.display = 'none'; };
        avatar.onerror = () => { avatar.remove(); };

        btn.append(emoji, avatar);
        ui.fila.appendChild(btn);
    });
}

function pararForno() {
    if (intervalForno) {
        clearInterval(intervalForno);
        intervalForno = null;
    }
}

function limparVisuais() {
    pararForno();
    tempoForno = 0;
    ui.pizzaMontagem.innerHTML = '';
    ui.pizzaMontagem.className = 'pizza-area';
    ui.pizzaForno.innerHTML = '';
    ui.pizzaForno.className = 'pizza-area';
    ui.pizzaCorte.innerHTML = '<div class="linha-corte"></div><div class="linha-corte horizontal"></div>';
    ui.pizzaCorte.className = 'pizza-area';
    ui.barraForno.style.width = '0%';
    ui.barraForno.style.backgroundColor = '#4caf50';
    ui.btnForno.disabled = false;
    ui.btnForno.innerText = 'Colocar no Forno';
    ui.btnMontagemFeita.disabled = true;
    ui.opcoesEntrega.innerHTML = '';
    ui.resultadoEntrega.innerText = '';
    ui.btnProximo.disabled = true;
}

function atenderCliente(id) {
    const indice = fila.findIndex(cliente => cliente.id === id);
    if (indice < 0) return;

    const cliente = fila.splice(indice, 1)[0];
    renderizarFila();

    perguntaAtual = sortearPergunta();
    pedidoAtual = { cliente, etapas: gerarReceita(), indice: 0, estragada: false };
    respostaDada = false;
    limparVisuais();

    ui.lobby.classList.remove('ativa');
    ui.cozinha.classList.remove('escondido');
    mudarEstacao('estacao-montagem');
    renderizarComanda();
    renderizarIngredientes();

    ui.textoPedido.innerHTML = `Pedido de ${cliente.nome}<span>Desafio: ${perguntaAtual.pergunta}</span>`;
    definirStatus('Montando...');

    if (fila.length === 0) {
        ui.mensagemLobby.innerText = 'Aguardando o próximo cliente...';
    }
}

function renderizarComanda() {
    if (!pedidoAtual) return;
    const chips = pedidoAtual.etapas.map((chave, i) => {
        const feito = i < pedidoAtual.indice ? ' feito' : '';
        return `<span class="chip-pedido${feito}">${i + 1}. ${ingredientes[chave].emoji} ${ingredientes[chave].nome}</span>`;
    }).join('');
    ui.comandaMontagem.innerHTML = `<strong>Comanda de ${pedidoAtual.cliente.nome}:</strong>${chips}`;

    ui.progressoPedido.innerHTML = pedidoAtual.etapas.map((_, i) => {
        const feito = i < pedidoAtual.indice ? ' feita' : '';
        return `<span class="etapa${feito}">${i + 1}</span>`;
    }).join('');
}

function renderizarIngredientes() {
    ui.sidebar.innerHTML = '<p class="sidebar-titulo">Ingredientes</p>';
    chavesIngredientes.forEach(chave => {
        const btn = document.createElement('button');
        btn.className = 'btn-ingrediente';
        btn.dataset.ingrediente = chave;
        btn.innerHTML = `${ingredientes[chave].emoji}<small>${ingredientes[chave].nome}</small>`;
        btn.onclick = () => clicarIngrediente(chave);
        ui.sidebar.appendChild(btn);
    });
    atualizarBotoesIngredientes();
}

function atualizarBotoesIngredientes() {
    const podeClicar = pedidoAtual && !pedidoAtual.estragada &&
        pedidoAtual.indice < pedidoAtual.etapas.length &&
        ui.estacaoMontagem.classList.contains('ativa');
    document.querySelectorAll('.btn-ingrediente').forEach(btn => {
        btn.disabled = !podeClicar;
    });
}

function adicionarCobertura(chave) {
    const cobertura = document.createElement('span');
    cobertura.className = `cobertura cobertura-${chave}`;
    cobertura.innerText = ingredientes[chave].emoji;
    cobertura.style.left = `${18 + Math.random() * 64}%`;
    cobertura.style.top = `${18 + Math.random() * 64}%`;
    cobertura.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 60 - 30}deg)`;
    ui.pizzaMontagem.appendChild(cobertura);
}

function clicarIngrediente(chave) {
    if (!pedidoAtual || pedidoAtual.estragada || pedidoAtual.indice >= pedidoAtual.etapas.length) return;

    const esperado = pedidoAtual.etapas[pedidoAtual.indice];
    if (chave === esperado) {
        adicionarCobertura(chave);
        pedidoAtual.indice++;
        renderizarComanda();
        if (pedidoAtual.indice === pedidoAtual.etapas.length) {
            definirStatus('Pizza pronta! Leve ao forno.');
            ui.btnMontagemFeita.disabled = false;
        } else {
            definirStatus(`Faltam ${pedidoAtual.etapas.length - pedidoAtual.indice} ingrediente(s).`);
        }
        atualizarBotoesIngredientes();
        return;
    }

    pedidoAtual.estragada = true;
    ui.pizzaMontagem.classList.add('estragada');
    ui.comandaMontagem.insertAdjacentHTML('beforeend', '<strong class="aviso-estragada">Pizza estragada! -5 pontos</strong>');
    alterarPontos(-5);
    definirStatus(`Errou! O próximo era ${ingredientes[esperado].nome}. Pizza estragada.`);
    ui.btnMontagemFeita.disabled = false;
    atualizarBotoesIngredientes();
}

function irParaForno() {
    if (!pedidoAtual || pedidoAtual.indice < pedidoAtual.etapas.length) return;
    ui.btnMontagemFeita.disabled = true;
    ui.pizzaForno.innerHTML = ui.pizzaMontagem.innerHTML;
    ui.pizzaForno.className = `pizza-area${pedidoAtual.estragada ? ' estragada' : ''}`;
    mudarEstacao('estacao-forno');
    definirStatus('Assando...');
}

function acionarForno() {
    if (!pedidoAtual) return;
    if (ui.btnForno.innerText === 'Colocar no Forno') {
        ui.btnForno.innerText = 'Retirar Pizza';
        tempoForno = 0;
        intervalForno = setInterval(() => {
            tempoForno += 2;
            ui.barraForno.style.width = `${Math.min(tempoForno, 100)}%`;
            if (tempoForno < 40) ui.barraForno.style.backgroundColor = '#4caf50';
            else if (tempoForno < 70) ui.barraForno.style.backgroundColor = '#ffeb3b';
            else ui.barraForno.style.backgroundColor = '#d32f2f';
            if (tempoForno >= 100) finalizarForno();
        }, 100);
    } else {
        finalizarForno();
    }
}

function finalizarForno() {
    pararForno();
    if (!pedidoAtual) return;
    ui.btnForno.disabled = true;

    if (tempoForno >= 40 && tempoForno <= 70) {
        ui.pizzaForno.classList.add('dourada');
        definirStatus('Pizza no ponto!');
    } else if (tempoForno > 70) {
        ui.pizzaForno.classList.add('queimada');
        definirStatus('Pizza queimada! -3 pontos');
        alterarPontos(-3);
    } else {
        definirStatus('Pizza crua! -3 pontos');
        alterarPontos(-3);
    }

    setTimeout(() => {
        if (pedidoAtual) irParaCorte();
    }, 1200);
}

function irParaCorte() {
    const coberturas = ui.pizzaForno.innerHTML;
    ui.pizzaCorte.innerHTML = `${coberturas}<div class="linha-corte"></div><div class="linha-corte horizontal"></div>`;
    ui.pizzaCorte.className = ui.pizzaForno.className;
    mudarEstacao('estacao-corte');
    definirStatus('Cortando...');
}

function prepararEntrega() {
    if (!perguntaAtual) return;
    ui.perguntaEntrega.innerText = perguntaAtual.pergunta;
    ui.opcoesEntrega.innerHTML = '';
    perguntaAtual.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.innerText = opcao;
        btn.onclick = () => responderDesafio(opcao, btn);
        ui.opcoesEntrega.appendChild(btn);
    });
    ui.resultadoEntrega.innerText = '';
    ui.btnProximo.disabled = true;
    mudarEstacao('estacao-entrega');
    definirStatus('Responda ao desafio!');
}

function responderDesafio(opcao, btn) {
    if (respostaDada) return;
    respostaDada = true;
    const acertou = opcao === perguntaAtual.correta;

    document.querySelectorAll('#opcoes-entrega button').forEach(botao => {
        botao.disabled = true;
    });
    btn.classList.add(acertou ? 'correta' : 'errada');

    if (!acertou) {
        const correto = Array.from(document.querySelectorAll('#opcoes-entrega button'))
            .find(botao => botao.innerText === perguntaAtual.correta);
        if (correto) correto.classList.add('correta');
    }

    const ganho = acertou ? 15 : 5;
    moedas += ganho;
    atualizarPlacar();
    alterarPontos(acertou ? 10 : -5);

    ui.resultadoEntrega.innerText = acertou
        ? `Acertou! +${ganho} moedas e +10 pontos.`
        : `Resposta certa: ${perguntaAtual.correta}. +${ganho} moedas e -5 pontos.`;
    definirStatus(acertou ? `Pedido entregue! +${ganho} moedas` : 'Pedido entregue com aviso.');
    ui.btnProximo.disabled = false;
}

function voltarAoBalcao() {
    pararForno();
    pedidoAtual = null;
    ui.cozinha.classList.add('escondido');
    ui.lobby.classList.add('ativa');
    ui.textoPedido.innerText = 'Clique em um cliente na fila.';
    ui.progressoPedido.innerHTML = '';
    definirStatus('Aguardando...');

    if (!filaAtiva) {
        ui.mensagemLobby.innerText = 'Clique em OPEN para abrir a pizzaria!';
    } else if (fila.length > 0) {
        ui.mensagemLobby.innerText = `${fila.length} cliente(s) esperando. Clique em um para anotar o pedido!`;
    } else {
        ui.mensagemLobby.innerText = 'Aguardando o próximo cliente...';
    }
}

function inicializar() {
    ui.btnStart.addEventListener('click', iniciarJogo);
    ui.btnHelp.addEventListener('click', () => abrirModal(
        'Como jogar',
        'Clique em OPEN, escolha um cliente e siga a comanda na ordem certa. Depois é só assar no ponto, cortar e responder ao desafio para ganhar mais moedas.'
    ));
    ui.btnCredits.addEventListener('click', () => abrirModal(
        'Créditos',
        'EduPizzaria: uma pizzaria educativa feita com CSS, emojis e muito carinho para praticar Matemática e Português.'
    ));
    ui.btnFecharModal.addEventListener('click', () => ui.modal.classList.add('escondido'));
    ui.btnMenu.addEventListener('click', voltarMenu);
    ui.btnOpen.addEventListener('click', alternarAbertura);
    ui.btnMontagemFeita.addEventListener('click', irParaForno);
    ui.btnForno.addEventListener('click', acionarForno);
    ui.btnCorte.addEventListener('click', prepararEntrega);
    ui.btnProximo.addEventListener('click', voltarAoBalcao);
    atualizarPlacar();
}

inicializar();
