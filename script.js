const bancoDePerguntas = [
    { pergunta: "Qual é a capital da França?", opcoes: ["Paris", "Londres", "Berlim", "Roma"], correta: "Paris" },
    { pergunta: "Quanto é 7 x 8?", opcoes: ["48", "56", "64", "72"], correta: "56" },
    { pergunta: "Quem descobriu o Brasil?", opcoes: ["Pedro Álvares Cabral", "Cristóvão Colombo", "Dom Pedro I", "Vasco da Gama"], correta: "Pedro Álvares Cabral" },
    { pergunta: "Qual é o maior planeta do Sistema Solar?", opcoes: ["Terra", "Marte", "Júpiter", "Saturno"], correta: "Júpiter" }
];

let perguntaAtual = null;
let moedas = 0;
let tempoForno = 0;
let intervaloForno = null;

// Elementos DOM
const ui = {
    textoPedido: document.getElementById('texto-pedido'),
    moedas: document.getElementById('moedas'),
    opcoes: document.getElementById('opcoes-ingredientes'),
    pizzaMontagem: document.getElementById('pizza-montagem'),
    pizzaForno: document.getElementById('pizza-forno'),
    pizzaCorte: document.getElementById('pizza-corte'),
    barraForno: document.getElementById('barra-forno'),
    btnAnotar: document.getElementById('btn-anotar'),
    btnAssar: document.getElementById('btn-assar'),
    btnCortar: document.getElementById('btn-cortar'),
    btnEntregar: document.getElementById('btn-entregar')
};

// Funções de Navegação
function mudarEstacao(id) {
    document.querySelectorAll('.estacao').forEach(el => el.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
}

function iniciarJogo() {
    const index = Math.floor(Math.random() * bancoDePerguntas.length);
    perguntaAtual = bancoDePerguntas[index];
    ui.textoPedido.innerText = `Quero uma pizza com a resposta para: ${perguntaAtual.pergunta}`;
    
    // Resetar visuais
    ui.pizzaMontagem.innerHTML = '';
    ui.pizzaMontagem.className = 'pizza';
    ui.pizzaForno.className = 'pizza';
    ui.pizzaCorte.className = 'pizza';
    ui.barraForno.style.width = '0%';
    ui.btnAssar.disabled = false;
    ui.btnAssar.innerText = "Colocar no Forno";
    
    mudarEstacao('estacao-pedido');
}

// Estação 1 -> 2
ui.btnAnotar.addEventListener('click', () => {
    ui.opcoes.innerHTML = '';
    perguntaAtual.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.className = 'opcao-btn';
        btn.innerText = opcao;
        btn.onclick = () => verificarResposta(opcao, btn);
        ui.opcoes.appendChild(btn);
    });
    mudarEstacao('estacao-montagem');
});

// Estação 2: Verificar Resposta
function verificarResposta(opcao, btn) {
    if (opcao === perguntaAtual.correta) {
        btn.style.backgroundColor = '#388e3c';
        btn.style.color = 'white';
        ui.pizzaMontagem.innerHTML = '<span style="font-size: 5em; line-height: 200px;">🍕</span>'; // Ingrediente simbólico
        
        setTimeout(() => {
            mudarEstacao('estacao-forno');
        }, 1000);
    } else {
        btn.style.backgroundColor = '#d32f2f';
        btn.disabled = true;
        ui.textoPedido.innerText = "Ops! Ingrediente errado. Tente outro.";
    }
}

// Estação 3: Forno (Timing)
ui.btnAssar.addEventListener('click', () => {
    ui.btnAssar.innerText = "Assando...";
    ui.btnAssar.disabled = true;
    tempoForno = 0;
    
    intervaloForno = setInterval(() => {
        tempoForno += 2;
        ui.barraForno.style.width = tempoForno + '%';
        
        if (tempoForno < 40) ui.barraForno.style.backgroundColor = '#388e3c'; // Verde
        else if (tempoForno < 70) ui.barraForno.style.backgroundColor = '#fbc02d'; // Amarelo
        else ui.barraForno.style.backgroundColor = '#d32f2f'; // Vermelho

        if (tempoForno >= 100) {
            clearInterval(intervaloForno);
            finalizarForno();
        }
    }, 100);
    
    // Simulando o clique do jogador para retirar (Aqui ele clica no botão novamente)
    ui.btnAssar.innerText = "Retirar do Forno";
    ui.btnAssar.disabled = false;
    ui.btnAssar.onclick = () => {
        clearInterval(intervaloForno);
        finalizarForno();
    };
});

function finalizarForno() {
    ui.btnAssar.disabled = true;
    if (tempoForno >= 40 && tempoForno <= 70) {
        ui.pizzaForno.classList.add('dourada');
        ui.textoPedido.innerText = "Perfeito! A pizza está no ponto.";
    } else if (tempoForno > 70) {
        ui.pizzaForno.classList.add('queimada');
        ui.textoPedido.innerText = "Eita, queimou a pizza!";
    } else {
        ui.textoPedido.innerText = "A pizza está crua!";
    }

    setTimeout(() => {
        mudarEstacao('estacao-corte');
    }, 1500);
}

// Estação 4 -> 5
ui.btnCortar.addEventListener('click', () => {
    ui.pizzaCorte.classList.add('cortada');
    ui.btnCortar.innerText = "Pizza Cortada!";
    ui.btnCortar.disabled = true;
    
    setTimeout(() => {
        mudarEstacao('estacao-entrega');
    }, 1000);
});

// Estação 5: Entrega
ui.btnEntregar.addEventListener('click', () => {
    moedas += 10;
    ui.moedas.innerText = moedas;
    ui.textoPedido.innerText = "Hmm, delicioso! Obrigado! +10 Moedas";
    
    setTimeout(() => {
        ui.btnCortar.innerText = "Cortar Pizza";
        ui.btnCortar.disabled = false;
        iniciarJogo();
    }, 2000);
});

// Iniciar o Jogo
iniciarJogo();
