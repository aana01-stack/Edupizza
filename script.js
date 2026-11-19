const perguntas = [
    { pergunta: "Qual é o resultado de 7 x 8?", resposta: "56", opcoes: ["48", "56", "64", "72"] },
    { pergunta: "Qual é a capital da França?", resposta: "Paris", opcoes: ["Londres", "Paris", "Berlim", "Roma"] },
    { pergunta: "Quanto é 15 + 27?", resposta: "42", opcoes: ["32", "42", "52", "38"] },
    { pergunta: "Qual é o maior planeta do Sistema Solar?", resposta: "Júpiter", opcoes: ["Terra", "Marte", "Júpiter", "Saturno"] },
    { pergunta: "Quanto é 100 ÷ 4?", resposta: "25", opcoes: ["20", "25", "30", "15"] },
    { pergunta: "Qual é o rio mais extenso do mundo?", resposta: "Amazonas", opcoes: ["Nilo", "Amazonas", "Mississippi", "Yangtzé"] },
    { pergunta: "Qual é o resultado de 9 x 9?", resposta: "81", opcoes: ["72", "81", "90", "99"] },
    { pergunta: "Quem descobriu o Brasil?", resposta: "Pedro Álvares Cabral", opcoes: ["Cristóvão Colombo", "Pedro Álvares Cabral", "Dom Pedro I", "Vasco da Gama"] }
];

const avatares = ["🧑", "👩", "👨", "👧", "👦", "👵", "👴", "🧒", "👱‍♀️", "🧔"];
const coberturas = ["🍄", "🌭", "🥓", "🫒", "🌶️", "🧅", "🍍", "🫑"];

const jogo = {
    dia: 1,
    pedido: 1,
    pontos: 0,
    gorjetas: 0,
    acertos: 0,
    pergunta: null,
    tentativas: 0,
    bloqueado: false,
    tempo: 60,
    massa: false,
    molho: false,
    queijo: false,
    cobertura: false,
    assada: false,
    cortada: false,
    erro: false,
    timer: null,
    fornoAnim: null,
    animacoes: []
};

const el = id => document.getElementById(id);

function mensagem(texto, tipo = "") {
    el("mensagem").innerText = texto;
    el("mensagem").className = "mensagem " + tipo;
}

function etapa(texto) {
    el("etapa").innerText = texto;
}

function atualizaStats() {
    el("dia").innerText = jogo.dia;
    el("pedido").innerText = jogo.pedido;
    el("pontos").innerText = jogo.pontos;
    el("gorjetas").innerText = jogo.gorjetas;
}

function atualizaTempo() {
    const barra = el("tempo-bar");
    barra.style.width = Math.max(0, jogo.tempo) / 60 * 100 + "%";
    barra.style.background = jogo.tempo <= 15
        ? "linear-gradient(90deg, #d63031, #ff7675)"
        : "linear-gradient(90deg, #00b894, #55efc4)";
}

function limparTimers() {
    clearInterval(jogo.timer);
    cancelAnimationFrame(jogo.fornoAnim);
    jogo.animacoes.forEach(clearTimeout);
    jogo.animacoes = [];
    jogo.timer = null;
    jogo.fornoAnim = null;
    el("forno").classList.remove("visivel");
    el("forno-agulha").style.left = "0%";
}

function agendar(fn, ms) {
    jogo.animacoes.push(setTimeout(fn, ms));
}

function criarBotao(texto, acao, classe = "botao") {
    const botao = document.createElement("button");
    botao.className = classe;
    botao.innerText = texto;
    botao.onclick = acao;
    return botao;
}

function renderPizza() {
    el("pizza").className = "pizza"
        + (jogo.massa ? " com-massa" : "")
        + (jogo.molho ? " com-molho" : "")
        + (jogo.queijo ? " com-queijo" : "")
        + (jogo.cobertura ? " com-cobertura" : "")
        + (jogo.assada ? " assada" : "")
        + (jogo.cortada ? " cortada" : "")
        + (jogo.erro ? " com-erro" : "");
}

function gerarCobertura(opcao) {
    const indice = jogo.pergunta.opcoes.indexOf(opcao);
    const emoji = coberturas[indice % coberturas.length];
    el("cobertura").innerHTML = Array.from({ length: 9 }, (_, i) => {
        const angulo = i * 2 * Math.PI / 9;
        const raio = i % 2 === 0 ? 30 : 20;
        const x = 50 + Math.cos(angulo) * raio;
        const y = 50 + Math.sin(angulo) * raio;
        return `<span style="--x:${x}%;--y:${y}%;--r:${i * 37}deg">${emoji}</span>`;
    }).join("");
    jogo.cobertura = true;
    renderPizza();
}

function proximoPedido() {
    limparTimers();
    jogo.pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
    jogo.tentativas = 0;
    jogo.bloqueado = false;
    jogo.tempo = 60;
    jogo.massa = false;
    jogo.molho = false;
    jogo.queijo = false;
    jogo.cobertura = false;
    jogo.assada = false;
    jogo.cortada = false;
    jogo.erro = false;

    el("avatar").innerText = avatares[Math.floor(Math.random() * avatares.length)];
    el("balao").innerText = "Quero uma pizza com a resposta certa!";
    el("pergunta").innerText = "🍕 " + jogo.pergunta.pergunta;
    el("cobertura").innerHTML = "";
    el("resultado").classList.add("escondido");
    el("resultado").innerHTML = "";
    el("inicio").classList.add("escondido");

    const acoes = el("acoes");
    acoes.innerHTML = "";
    const opcoes = [...jogo.pergunta.opcoes].sort(() => Math.random() - 0.5);
    opcoes.forEach((opcao, indice) => {
        const emoji = coberturas[indice % coberturas.length];
        const botao = criarBotao(emoji + "  " + opcao, () => verificarResposta(opcao, botao), "botao ingrediente");
        acoes.appendChild(botao);
    });

    mensagem("Escolha o ingrediente que responde à pergunta.");
    etapa("1/5 · Escolhendo o ingrediente");
    renderPizza();
    atualizaStats();
    atualizaTempo();
    jogo.timer = setInterval(tick, 1000);
}

function tick() {
    jogo.tempo--;
    atualizaTempo();
    if (jogo.tempo <= 0) finalizarPedido(false, "tempo");
}

function verificarResposta(resposta, botao) {
    if (jogo.bloqueado) return;

    if (resposta === jogo.pergunta.resposta) {
        jogo.bloqueado = true;
        clearInterval(jogo.timer);
        jogo.timer = null;
        document.querySelectorAll(".ingrediente").forEach(btn => btn.disabled = true);
        botao.style.background = "#00b894";
        mensagem("✅ Ingrediente correto! Vamos assar a pizza.", "sucesso");
        montarPizza();
        return;
    }

    jogo.tentativas++;
    botao.disabled = true;
    botao.style.background = "#b2bec3";

    if (jogo.tentativas >= 2) {
        jogo.bloqueado = true;
        clearInterval(jogo.timer);
        jogo.timer = null;
        document.querySelectorAll(".ingrediente").forEach(btn => btn.disabled = true);
        jogo.erro = true;
        renderPizza();
        mensagem("❌ Você errou duas vezes. A resposta era: " + jogo.pergunta.resposta, "erro");
        etapa("Pedido perdido");
        agendar(() => finalizarPedido(false, "erro"), 1200);
    } else {
        mensagem("❌ Ingrediente errado! Tente novamente.", "erro");
    }
}

function montarPizza() {
    agendar(() => {
        jogo.massa = true;
        renderPizza();
        etapa("2/5 · Abrindo a massa");
    }, 400);

    agendar(() => {
        jogo.molho = true;
        renderPizza();
        etapa("3/5 · Espalhando o molho");
    }, 900);

    agendar(() => {
        jogo.queijo = true;
        renderPizza();
        etapa("4/5 · Polvilhando o queijo");
    }, 1400);

    agendar(() => {
        gerarCobertura(jogo.pergunta.resposta);
        etapa("5/5 · Adicionando o ingrediente");
    }, 1900);

    agendar(() => {
        el("forno").classList.add("visivel");
        etapa("5/5 · Assando no forno...");
        const inicio = performance.now();
        const passo = agora => {
            const progresso = Math.min(50, (agora - inicio) / 35);
            el("forno-agulha").style.left = progresso + "%";
            if (progresso < 50) {
                jogo.fornoAnim = requestAnimationFrame(passo);
            }
        };
        jogo.fornoAnim = requestAnimationFrame(passo);
    }, 2400);

    agendar(() => {
        cancelAnimationFrame(jogo.fornoAnim);
        el("forno").classList.remove("visivel");
        jogo.assada = true;
        renderPizza();
        etapa("5/5 · Pizza assada!");
    }, 4200);

    agendar(() => {
        jogo.cortada = true;
        renderPizza();
        finalizarPedido(true, "entrega");
    }, 4800);
}

function finalizarPedido(sucesso, motivo) {
    if (jogo.bloqueado && !el("resultado").classList.contains("escondido") && motivo !== "tempo") return;
    limparTimers();
    jogo.bloqueado = true;

    const ganho = sucesso ? 50 + 30 + Math.floor(Math.max(0, jogo.tempo) / 3) : 0;
    const gorjeta = Math.floor(ganho / 10);
    jogo.pontos += ganho;
    jogo.gorjetas += gorjeta;
    if (sucesso) jogo.acertos++;
    if (jogo.pedido % 3 === 0) jogo.dia++;
    jogo.pedido++;

    const reacao = sucesso ? "😋" : (motivo === "tempo" ? "⏰" : "😖");
    const titulo = sucesso ? "Pizza aprovada!" : (motivo === "tempo" ? "Tempo esgotado!" : "O cliente foi embora...");
    const detalhe = sucesso
        ? "Ingrediente correto: " + jogo.pergunta.resposta + "."
        : "A resposta era: " + jogo.pergunta.resposta + ".";

    el("resultado").innerHTML = `<h2>${reacao} ${titulo}</h2>
        <p>${detalhe}</p>
        <p><b>+${ganho} pontos</b> e <b>+${gorjeta} de gorjeta</b></p>
        <p>Acertos: ${jogo.acertos} · Total: ${jogo.pontos} pontos</p>`;
    el("resultado").appendChild(criarBotao("Próximo cliente", proximoPedido, "botao destaque"));
    el("resultado").appendChild(criarBotao("Jogar Novamente", iniciarJogo));
    el("resultado").classList.remove("escondido");

    el("balao").innerText = reacao + " " + titulo;
    mensagem(sucesso ? "🍕✨ Pizza assada com sucesso!" : "❌ Pedido não entregue.", sucesso ? "sucesso" : "erro");
    etapa("Pedido finalizado");
    atualizaStats();
    document.querySelectorAll(".ingrediente").forEach(btn => btn.disabled = true);
}

function iniciarJogo() {
    limparTimers();
    jogo.dia = 1;
    jogo.pedido = 1;
    jogo.pontos = 0;
    jogo.gorjetas = 0;
    jogo.acertos = 0;
    proximoPedido();
}

el("btn-comecar").onclick = iniciarJogo;
