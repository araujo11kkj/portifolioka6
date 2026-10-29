const formDiario = document.getElementById("formDiario");
const tituloEntrada = document.getElementById("tituloEntrada");
const humorEntrada = document.getElementById("humorEntrada");
const textoEntrada = document.getElementById("textoEntrada");
const listaEntradas = document.getElementById("listaEntradas");
const contadorEntradas = document.getElementById("contadorEntradas");
const aviso = document.getElementById("aviso");
const dataHoje = document.getElementById("dataHoje");
const botoesModo = document.querySelectorAll(".modo");
const tempoElemento = document.getElementById("tempo");
const tipoTimer = document.getElementById("tipoTimer");
const estadoTimer = document.getElementById("estadoTimer");
const progresso = document.getElementById("progresso");
const botaoIniciar = document.getElementById("iniciarTimer");
const botaoReiniciar = document.getElementById("reiniciarTimer");

const chaveDiario = "meuDiarioEntradas";
let entradas = carregarEntradas();
let intervalo = null;
let modoAtual = "Foco";
let duracaoTotal = 25 * 60;
let segundosRestantes = duracaoTotal;
let rodando = false;
const circunferencia = 2 * Math.PI * 96;

dataHoje.textContent = new Date().toLocaleDateString("pt-BR", {
  weekday: "long", day: "numeric", month: "long"
});

function carregarEntradas() {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveDiario));
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    return [];
  }
}

function salvarEntradas() {
  try {
    localStorage.setItem(chaveDiario, JSON.stringify(entradas));
    return true;
  } catch (erro) {
    aviso.textContent = "Não foi possível salvar. Verifique as configurações do navegador.";
    return false;
  }
}

formDiario.addEventListener("submit", function(evento) {
  evento.preventDefault();
  const texto = textoEntrada.value.trim();

  if (!texto) {
    aviso.textContent = "Escreva alguma coisa antes de salvar ♡";
    textoEntrada.focus();
    return;
  }

  const entrada = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    titulo: tituloEntrada.value.trim() || "Um momento do meu dia",
    humor: humorEntrada.value,
    texto: texto,
    data: new Date().toISOString()
  };

  entradas.unshift(entrada);
  if (salvarEntradas()) {
    renderizarEntradas();
    formDiario.reset();
    aviso.textContent = "Entrada salva com carinho! ♡";
  } else {
    entradas.shift();
  }
});

function formatarData(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Data não disponível";
  return data.toLocaleString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function renderizarEntradas() {
  contadorEntradas.textContent = entradas.length + (entradas.length === 1 ? " entrada" : " entradas");
  listaEntradas.replaceChildren();

  if (entradas.length === 0) {
    const vazio = document.createElement("div");
    vazio.className = "vazio";
    const flor = document.createElement("span");
    flor.textContent = "🌷";
    const texto = document.createElement("p");
    texto.textContent = "Seu histórico aparecerá aqui.";
    const dica = document.createElement("small");
    dica.textContent = "Salve sua primeira entrada para começar.";
    vazio.append(flor, texto, dica);
    listaEntradas.appendChild(vazio);
    return;
  }

  entradas.forEach(function(entrada) {
    const cartao = document.createElement("article");
    cartao.className = "entrada";
    const cabecalho = document.createElement("div");
    cabecalho.className = "entrada-cabecalho";
    const informacoes = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = entrada.titulo;
    const meta = document.createElement("div");
    meta.className = "entrada-meta";
    meta.textContent = entrada.humor + " · " + formatarData(entrada.data);
    informacoes.append(titulo, meta);

    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.className = "excluir-entrada";
    excluir.textContent = "Excluir";
    excluir.setAttribute("aria-label", "Excluir entrada: " + entrada.titulo);
    excluir.addEventListener("click", function() {
      if (!window.confirm("Quer mesmo excluir esta entrada do diário?")) return;
      entradas = entradas.filter(function(item) { return item.id !== entrada.id; });
      salvarEntradas();
      renderizarEntradas();
      aviso.textContent = "Entrada excluída.";
    });

    cabecalho.append(informacoes, excluir);
    const conteudo = document.createElement("p");
    conteudo.className = "entrada-texto";
    conteudo.textContent = entrada.texto;
    cartao.append(cabecalho, conteudo);
    listaEntradas.appendChild(cartao);
  });
}

function mostrarTempo() {
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  tempoElemento.textContent = String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0");
  const restante = duracaoTotal > 0 ? segundosRestantes / duracaoTotal : 0;
  progresso.style.strokeDasharray = String(circunferencia);
  progresso.style.strokeDashoffset = String(circunferencia * (1 - restante));
}

function pararTimer() {
  if (intervalo !== null) {
    clearInterval(intervalo);
    intervalo = null;
  }
  rodando = false;
  botaoIniciar.textContent = "Começar";
}

function selecionarModo(botao) {
  pararTimer();
  modoAtual = botao.dataset.tipo;
  duracaoTotal = Number(botao.dataset.minutos) * 60;
  segundosRestantes = duracaoTotal;
  botoesModo.forEach(function(item) {
    item.classList.toggle("ativo", item === botao);
  });
  tipoTimer.textContent = modoAtual;
  estadoTimer.textContent = "Pronto quando você estiver ♡";
  mostrarTempo();
}

botoesModo.forEach(function(botao) {
  botao.addEventListener("click", function() {
    selecionarModo(botao);
  });
});

botaoIniciar.addEventListener("click", function() {
  if (rodando) {
    pararTimer();
    estadoTimer.textContent = "Timer pausado";
    return;
  }
  if (segundosRestantes <= 0) {
    segundosRestantes = duracaoTotal;
    mostrarTempo();
  }
  rodando = true;
  botaoIniciar.textContent = "Pausar";
  estadoTimer.textContent = modoAtual === "Foco" ? "Você consegue! ♡" : "Aproveite a pausa ♡";

  intervalo = setInterval(function() {
    segundosRestantes -= 1;
    mostrarTempo();
    if (segundosRestantes <= 0) {
      pararTimer();
      estadoTimer.textContent = "Tempo concluído! ✿";
      window.alert(modoAtual + " concluído! Hora de conferir como você está. ♡");
    }
  }, 1000);
});

botaoReiniciar.addEventListener("click", function() {
  pararTimer();
  segundosRestantes = duracaoTotal;
  estadoTimer.textContent = "Timer reiniciado ♡";
  mostrarTempo();
});

renderizarEntradas();
mostrarTempo();
