// Banco de dados de perguntas educativas
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

let perguntaAtual = null;
let tentativas = 0;

function iniciarJogo() {
    document.getElementById("btn-reiniciar").style.display = "none";
    document.getElementById("mensagem").innerText = "";
    document.getElementById("pizza").innerText = "🍕";
    
    // Sorteia uma pergunta aleatória
    perguntaAtual = perguntas[Math.floor(Math.random() * perguntas.length)];
    document.getElementById("pedido").innerText = "🍕 Pedido: " + perguntaAtual.pergunta;

    // Embaralha as opções
    const opcoesEmbaralhadas = [...perguntaAtual.opcoes].sort(() => Math.random() - 0.5);

    // Cria os botões de ingredientes
    const containerIngredientes = document.getElementById("ingredientes");
    containerIngredientes.innerHTML = "";
    
    opcoesEmbaralhadas.forEach(opcao => {
        const botao = document.createElement("button");
        botao.className = "ingrediente";
        botao.innerText = opcao;
        botao.onclick = () => verificarResposta(opcao, botao);
        containerIngredientes.appendChild(botao);
    });

    tentativas = 0;
}

function verificarResposta(respostaEscolhida, botao) {
    const mensagem = document.getElementById("mensagem");
    const pizza = document.getElementById("pizza");

    if (respostaEscolhida === perguntaAtual.resposta) {
        // Acertou
        mensagem.innerText = "✅ Pizza assada com sucesso! Ingrediente correto!";
        mensagem.className = "sucesso";
        pizza.innerText = "🍕✨";
        botao.style.backgroundColor = "#00b894";
        
        // Desabilita todos os botões
        document.querySelectorAll(".ingrediente").forEach(btn => btn.disabled = true);
        
        // Mostra botão de reiniciar após um tempo
        setTimeout(() => {
            document.getElementById("btn-reiniciar").style.display = "inline-block";
        }, 1000);

    } else {
        // Errou
        tentativas++;
        mensagem.innerText = "❌ Ingrediente errado! Tente novamente.";
        mensagem.className = "erro";
        pizza.innerText = "💥";
        botao.disabled = true; // Desabilita o botão errado para não clicar de novo
        botao.style.backgroundColor = "#b2bec3";

        if (tentativas >= 2) {
            mensagem.innerText = "❌ Você errou duas vezes. A resposta era: " + perguntaAtual.resposta;
            document.querySelectorAll(".ingrediente").forEach(btn => btn.disabled = true);
            setTimeout(() => {
                document.getElementById("btn-reiniciar").style.display = "inline-block";
            }, 1500);
        }
    }
}

// Inicia o jogo ao carregar a página
window.onload = iniciarJogo;
