
let acordes = {};

const campoBusca = document.getElementById("busca");
const botaoBuscar = document.getElementById("botao-buscar");
const resultado = document.getElementById("resultado");
const areaDiagrama = document.getElementById("diagrama-acorde");

// ========================================
// CARREGAR ACORDES
// ========================================

async function carregarAcordes() {
    try {
        const resposta = await fetch("data/chords.json");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        acordes = await resposta.json();

        console.log("Acordes carregados:", acordes);

    } catch (erro) {
        console.error("Erro ao carregar os acordes:", erro);

        if (resultado) {
            resultado.textContent =
                "Não foi possível carregar os acordes. Verifique o servidor e o arquivo chords.json.";
        }
    }
}

// ========================================
// CRIAR DIAGRAMA DO ACORDE
// ========================================

function criarDiagrama(nomeAcorde) {
    const acorde = acordes[nomeAcorde];

    if (!acorde || !areaDiagrama) {
        if (areaDiagrama) areaDiagrama.replaceChildren();
        return;
    }

    const casas = acorde.posicao;
    const dedos = acorde.dedos || [];
    const ns = "http://www.w3.org/2000/svg";

    const pestanas = [];

    if (nomeAcorde === "B") {
        pestanas.push({
            dedo: 1,
            casa: 2,
            primeiraCorda: 1,
            ultimaCorda: 5
        });
    }

    if (nomeAcorde === "A#m") {
        pestanas.push({
            dedo: 1,
            casa: 1,
            primeiraCorda: 1,
            ultimaCorda: 5
        });
    }

    if (nomeAcorde === "D#m") {
        pestanas.push({
            dedo: 1,
            casa: 6,
            primeiraCorda: 1,
            ultimaCorda: 5
        });
    }

    // Identificar pestanas pelos dedos

    for (let dedo = 1; dedo <= 4; dedo++) {
        const cordasComDedo = [];

        casas.forEach((casa, indice) => {
            if (dedos[indice] === dedo && casa > 0) {
                cordasComDedo.push({ indice, casa });
            }
        });

        if (cordasComDedo.length >= 3) {
            const casasUsadas = cordasComDedo.map(item => item.casa);

            const mesmaCasa = casasUsadas.every(
                casa => casa === casasUsadas[0]
            );

            if (mesmaCasa) {
                const jaExiste = pestanas.some(p =>
                    p.dedo === dedo &&
                    p.casa === casasUsadas[0]
                );

                if (!jaExiste) {
                    pestanas.push({
                        dedo,
                        casa: casasUsadas[0],
                        primeiraCorda: Math.min(
                            ...cordasComDedo.map(item => item.indice)
                        ),
                        ultimaCorda: Math.max(
                            ...cordasComDedo.map(item => item.indice)
                        )
                    });
                }
            }
        }
    }

    const svg = document.createElementNS(ns, "svg");

    svg.setAttribute("viewBox", "0 0 260 245");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Diagrama do acorde ${nomeAcorde}`);

    const xInicial = 48;
    const yInicial = 65;
    const espacoHorizontal = 32;
    const espacoVertical = 32;
    const quantidadeCordas = 6;
    const quantidadeCasas = 4;

    const maioresCasas = casas.filter(casa => casa > 0);
    const maiorCasa = Math.max(...maioresCasas, 1);

    const primeiraCasa =
        maiorCasa <= quantidadeCasas
            ? 1
            : Math.max(1, maiorCasa - quantidadeCasas + 1);

    const ultimaCasa = primeiraCasa + quantidadeCasas - 1;

    // Indicador da posição do braço

    if (primeiraCasa > 1) {
        const indicador = document.createElementNS(ns, "text");

        indicador.setAttribute("x", "27");
        indicador.setAttribute("y", String(yInicial - 28));
        indicador.setAttribute("text-anchor", "middle");
        indicador.setAttribute("fill", "#aeb6c5");
        indicador.setAttribute("font-size", "12");
        indicador.textContent = `${primeiraCasa}ª`;

        svg.appendChild(indicador);

    } else {
        const textoCasa = document.createElementNS(ns, "text");

        textoCasa.setAttribute("x", "27");
        textoCasa.setAttribute("y", "20");
        textoCasa.setAttribute("text-anchor", "middle");
        textoCasa.setAttribute("fill", "#aeb6c5");
        textoCasa.setAttribute("font-size", "12");
        textoCasa.textContent = "Casa";

        svg.appendChild(textoCasa);
    }

    // Desenhar cordas

    for (let i = 0; i < quantidadeCordas; i++) {
        const linha = document.createElementNS(ns, "line");
        const x = xInicial + i * espacoHorizontal;

        linha.setAttribute("x1", x);
        linha.setAttribute("y1", yInicial);
        linha.setAttribute("x2", x);
        linha.setAttribute(
            "y2",
            yInicial + quantidadeCasas * espacoVertical
        );
        linha.setAttribute("stroke", "#aeb6c5");
        linha.setAttribute("stroke-width", "1.5");

        svg.appendChild(linha);
    }

    // Desenhar casas

    for (let i = 0; i <= quantidadeCasas; i++) {
        const linha = document.createElementNS(ns, "line");
        const y = yInicial + i * espacoVertical;

        linha.setAttribute("x1", xInicial);
        linha.setAttribute("y1", y);
        linha.setAttribute(
            "x2",
            xInicial + (quantidadeCordas - 1) * espacoHorizontal
        );
        linha.setAttribute("y2", y);

        linha.setAttribute(
            "stroke",
            i === 0 && primeiraCasa === 1
                ? "#f5f5f5"
                : "#aeb6c5"
        );

        linha.setAttribute(
            "stroke-width",
            i === 0 && primeiraCasa === 1 ? "3" : "1.5"
        );

        svg.appendChild(linha);

        if (i < quantidadeCasas) {
            const numero = document.createElementNS(ns, "text");

            numero.setAttribute("x", "27");
            numero.setAttribute(
                "y",
                y + espacoVertical / 2 + 4
            );
            numero.setAttribute("text-anchor", "middle");
            numero.setAttribute("fill", "#aeb6c5");
            numero.setAttribute("font-size", "12");
            numero.textContent = String(primeiraCasa + i);

            svg.appendChild(numero);
        }
    }

    // Desenhar pestanas

    pestanas.forEach(pestana => {
        if (
            pestana.casa < primeiraCasa ||
            pestana.casa > ultimaCasa
        ) {
            return;
        }

        const casaRelativa = pestana.casa - primeiraCasa + 1;

        const y =
            yInicial +
            (casaRelativa - 0.5) * espacoVertical;

        const x1 =
            xInicial +
            pestana.primeiraCorda * espacoHorizontal;

        const x2 =
            xInicial +
            pestana.ultimaCorda * espacoHorizontal;

        const barra = document.createElementNS(ns, "rect");

        barra.setAttribute("x", x1 - 9);
        barra.setAttribute("y", y - 9);
        barra.setAttribute("width", x2 - x1 + 18);
        barra.setAttribute("height", "18");
        barra.setAttribute("rx", "9");
        barra.setAttribute("fill", "#2196f3");

        svg.appendChild(barra);

        const numero = document.createElementNS(ns, "text");

        numero.setAttribute("x", (x1 + x2) / 2);
        numero.setAttribute("y", y + 5);
        numero.setAttribute("text-anchor", "middle");
        numero.setAttribute("fill", "#ffffff");
        numero.setAttribute("font-size", "13");
        numero.setAttribute("font-weight", "900");
        numero.textContent = String(pestana.dedo);

        svg.appendChild(numero);
    });

    // Desenhar símbolos e dedos

    casas.forEach((casa, i) => {
        const x = xInicial + i * espacoHorizontal;
        const simbolo = document.createElementNS(ns, "text");

        simbolo.setAttribute("x", x);
        simbolo.setAttribute("y", yInicial - 12);
        simbolo.setAttribute("text-anchor", "middle");
        simbolo.setAttribute("fill", "#f5f5f5");
        simbolo.setAttribute("font-size", "17");

        if (casa === -1) {
            simbolo.textContent = "×";
            simbolo.setAttribute("fill", "#ff6b6b");
            simbolo.setAttribute("font-weight", "bold");

        } else if (casa === 0) {
            simbolo.textContent = "○";
            simbolo.setAttribute("fill", "#69dbb0");
            simbolo.setAttribute("font-weight", "bold");
        }

        svg.appendChild(simbolo);

        if (casa >= primeiraCasa && casa <= ultimaCasa) {
            const casaRelativa = casa - primeiraCasa + 1;

            const y =
                yInicial +
                (casaRelativa - 0.5) * espacoVertical;

            const ponto = document.createElementNS(ns, "circle");

            ponto.setAttribute("cx", x);
            ponto.setAttribute("cy", y);
            ponto.setAttribute("r", "10");
            ponto.setAttribute("fill", "#2196f3");

            svg.appendChild(ponto);

            const dedo = dedos[i];

            const fazParteDaPestana = pestanas.some(pestana =>
                pestana.dedo === dedo &&
                pestana.casa === casa &&
                i >= pestana.primeiraCorda &&
                i <= pestana.ultimaCorda
            );

            if (
                Number.isInteger(dedo) &&
                dedo >= 1 &&
                dedo <= 4 &&
                !fazParteDaPestana
            ) {
                const numeroDedo =
                    document.createElementNS(ns, "text");

                numeroDedo.setAttribute("x", x);
                numeroDedo.setAttribute("y", y + 5);
                numeroDedo.setAttribute("text-anchor", "middle");
                numeroDedo.setAttribute("fill", "#ffffff");
                numeroDedo.setAttribute("font-size", "15");
                numeroDedo.setAttribute("font-weight", "900");
                numeroDedo.setAttribute("stroke", "#12304a");
                numeroDedo.setAttribute("stroke-width", "0.6");
                numeroDedo.setAttribute("paint-order", "stroke");
                numeroDedo.textContent = String(dedo);

                svg.appendChild(numeroDedo);
            }
        }
    });

    // Cartão do diagrama

    const cartao = document.createElement("div");
    cartao.className = "diagrama";

    const titulo = document.createElement("h3");
    titulo.textContent = `Acorde ${nomeAcorde}`;

    const legenda = document.createElement("p");
    legenda.className = "legenda";
    legenda.textContent =
        "× = abafada | ○ = corda solta | Números = dedos";

    const legendaDedos = document.createElement("p");
    legendaDedos.className = "legenda";
    legendaDedos.textContent =
        "1 = Indicador | 2 = Médio | 3 = Anelar | 4 = Mínimo";

    cartao.appendChild(titulo);
    cartao.appendChild(svg);
    cartao.appendChild(legenda);
    cartao.appendChild(legendaDedos);

    areaDiagrama.replaceChildren(cartao);
}

// ========================================
// BUSCAR ACORDES
// ========================================

function buscarAcorde() {
    const pesquisa = campoBusca.value.trim().toLowerCase();

    if (Object.keys(acordes).length === 0) {
        resultado.textContent =
            "Os acordes ainda estão carregando. Tente novamente em instantes.";

        return;
    }

    const chave = Object.keys(acordes).find(
        nome => nome.toLowerCase() === pesquisa
    );

    if (!chave) {
        resultado.textContent =
            "Acorde não encontrado. Tente C, Am, Em, G7, D, E, A, Dm, G ou D7.";

        areaDiagrama.replaceChildren();

        return;
    }

    const acorde = acordes[chave];

    resultado.replaceChildren();

    const titulo = document.createElement("strong");
    titulo.textContent = acorde.nome;

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-acorde";
    etiqueta.textContent = acorde.tipo.toUpperCase();

    resultado.appendChild(titulo);
    resultado.appendChild(etiqueta);

    const detalhes = document.createElement("p");

    detalhes.textContent =
        `Notas: ${acorde.notas.join(" - ")}`;

    resultado.appendChild(detalhes);

    if (acorde.explicacao) {
        const explicacao = document.createElement("p");

        explicacao.textContent = acorde.explicacao;

        resultado.appendChild(explicacao);
    }

    criarDiagrama(chave);
}

if (botaoBuscar && campoBusca) {
    botaoBuscar.addEventListener("click", buscarAcorde);

    campoBusca.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            buscarAcorde();
        }
    });
}

// ========================================
// BRAÇO INTERATIVO
// ========================================

const braco = document.getElementById("braco-guitarra");

if (braco) {
    const cordas = [
        { nome: "E", numero: 6 },
        { nome: "A", numero: 5 },
        { nome: "D", numero: 4 },
        { nome: "G", numero: 3 },
        { nome: "B", numero: 2 },
        { nome: "E", numero: 1 }
    ];

    const notas = [
        "C", "C#", "D", "D#", "E", "F",
        "F#", "G", "G#", "A", "A#", "B"
    ];

    const bracoNotas = document.createElement("div");
    bracoNotas.className = "braco-notas";

    cordas.forEach(corda => {
        const linha = document.createElement("div");
        linha.className = "linha-corda";

        const nomeCorda = document.createElement("span");
        nomeCorda.className = "nome-corda";
        nomeCorda.textContent = corda.nome;

        linha.appendChild(nomeCorda);

        for (let casa = 0; casa <= 12; casa++) {
            const posicao = document.createElement("button");

            posicao.className = "posicao-nota";
            posicao.type = "button";

            const indiceInicial = notas.indexOf(corda.nome);
            const indiceNota = (indiceInicial + casa) % 12;
            const nota = notas[indiceNota];

            posicao.textContent = nota;
            posicao.dataset.nota = nota;

            posicao.addEventListener("click", () => {

                braco.querySelectorAll(".posicao-nota").forEach(botao => {
                    botao.classList.toggle(
                        "nota-destacada",
                        botao.dataset.nota === nota
                    );
                });

                const informacao =
                    document.getElementById("nota-selecionada");

                if (informacao) {
                    informacao.textContent =
                        `Corda ${corda.numero}, casa ${casa}: nota ${nota}`;
                }
            });

            linha.appendChild(posicao);
        }

        bracoNotas.appendChild(linha);
    });

    braco.appendChild(bracoNotas);
}

// ========================================
// ESCALAS MUSICAIS
// ========================================

const seletorEscala = document.getElementById("seletor-escala");
const informacaoEscala = document.getElementById("informacao-escala");
const areaAcordesEscala = document.getElementById("acordes-da-escala");
const areaProgressoes = document.getElementById("lista-progressoes");
// ========================================
// CLIQUE NOS ACORDES DAS PROGRESSÕES
// ========================================

if (areaProgressoes) {

    areaProgressoes.addEventListener("click", evento => {

        const botao = evento.target.closest(".botao-acorde-progressao");

        if (!botao) return;

        campoBusca.value = botao.dataset.acorde;

        buscarAcorde();
    });

}
const escalas = {

    C: {
        nome: "Dó maior",
        tonica: "C",
        notas: ["C", "D", "E", "F", "G", "A", "B"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    G: {
        nome: "Sol maior",
        tonica: "G",
        notas: ["G", "A", "B", "C", "D", "E", "F#"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    D: {
        nome: "Ré maior",
        tonica: "D",
        notas: ["D", "E", "F#", "G", "A", "B", "C#"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    A: {
        nome: "Lá maior",
        tonica: "A",
        notas: ["A", "B", "C#", "D", "E", "F#", "G#"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    E: {
        nome: "Mi maior",
        tonica: "E",
        notas: ["E", "F#", "G#", "A", "B", "C#", "D#"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    B: {
        nome: "Si maior",
        tonica: "B",
        notas: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    F: {
        nome: "Fá maior",
        tonica: "F",
        notas: ["F", "G", "A", "A#", "C", "D", "E"],
        formula: "Tom – Tom – Semitom – Tom – Tom – Tom – Semitom"
    },

    Am: {
        nome: "Lá menor natural",
        tonica: "A",
        notas: ["A", "B", "C", "D", "E", "F", "G"],
        formula: "Tom – Semitom – Tom – Tom – Semitom – Tom – Tom"
    },

    Em: {
        nome: "Mi menor natural",
        tonica: "E",
        notas: ["E", "F#", "G", "A", "B", "C", "D"],
        formula: "Tom – Semitom – Tom – Tom – Semitom – Tom – Tom"
    },

    Dm: {
        nome: "Ré menor natural",
        tonica: "D",
        notas: ["D", "E", "F", "G", "A", "A#", "C"],
        formula: "Tom – Semitom – Tom – Tom – Semitom – Tom – Tom"
    },

    Bm: {
        nome: "Si menor natural",
        tonica: "B",
        notas: ["B", "C#", "D", "E", "F#", "G", "A"],
        formula: "Tom – Semitom – Tom – Tom – Semitom – Tom – Tom"
    },

    "F#m": {
        nome: "Fá sustenido menor natural",
        tonica: "F#",
        notas: ["F#", "G#", "A", "B", "C#", "D", "E"],
        formula: "Tom – Semitom – Tom – Tom – Semitom – Tom – Tom"
    }
};

// ========================================
// CALCULAR ACORDES DA ESCALA
// ========================================

// ========================================
// CALCULAR ACORDES DA ESCALA
// ========================================

function calcularAcordesEscala(escala) {

    const escalaMenor = escala.nome.includes("menor");

    const graus = ["I", "II", "III", "IV", "V", "VI", "VII"];

    const tipos = escalaMenor
        ? ["m", "dim", "", "m", "m", "", ""]
        : ["", "m", "m", "", "", "m", "dim"];

    return escala.notas.map((nota, indice) => {
        return {
            grau: graus[indice],
            acorde: nota + tipos[indice]
        };
    });
}

// ========================================
// PROGRESSÕES DE ACORDES
// ========================================

function calcularProgressoes(acordes) {

    const progressoes = [
        {
            nome: "Progressão I - V - VI - IV",
            graus: [0, 4, 5, 3]
        },
        {
            nome: "Progressão I - VI - IV - V",
            graus: [0, 5, 3, 4]
        },
        {
            nome: "Progressão VI - IV - I - V",
            graus: [5, 3, 0, 4]
        }
    ];

    return progressoes.map(progressao => ({
        nome: progressao.nome,
        acordes: progressao.graus.map(indice =>
            acordes[indice].acorde
        )
    }));
}

// ========================================
// ATIVAR SELETOR DE ESCALAS
// ========================================

if (seletorEscala && informacaoEscala && braco) {

    seletorEscala.addEventListener("change", () => {

        const escalaEscolhida = seletorEscala.value;

        // Limpar destaques anteriores

        braco.querySelectorAll(".posicao-nota").forEach(posicao => {
            posicao.classList.remove("nota-escala", "nota-tonica");
        });

        if (!escalaEscolhida) {
            informacaoEscala.innerHTML =
                "<p>As informações da escala aparecerão aqui.</p>";

            if (areaAcordesEscala) {
                areaAcordesEscala.innerHTML =
                    "<h4>Acordes desta escala</h4><p>Selecione uma escala para visualizar seus acordes.</p>";
            }

            return;
        }

        const escala = escalas[escalaEscolhida];

        if (!escala) return;

        // Destacar notas da escala

        braco.querySelectorAll(".posicao-nota").forEach(posicao => {

            if (escala.notas.includes(posicao.dataset.nota)) {
                posicao.classList.add("nota-escala");
            }

            if (posicao.dataset.nota === escala.tonica) {
                posicao.classList.add("nota-tonica");
            }

        });

        // Mostrar informações da escala

        informacaoEscala.innerHTML = `
            <h4>${escala.nome}</h4>
            <p><strong>Notas:</strong> ${escala.notas.join(" - ")}</p>
            <p><strong>Fórmula:</strong> ${escala.formula}</p>
        `;

        // Mostrar acordes da escala

        if (areaAcordesEscala) {

            const acordesEscala = calcularAcordesEscala(escala);

            areaAcordesEscala.innerHTML = `
                <h4>Acordes desta escala</h4>

                <div class="lista-acordes-escala">
                    ${acordesEscala.map(item => `
                        <div class="acorde-escala">
                            <strong>${item.grau}</strong>
                            <span>${item.acorde}</span>
                        </div>
                    `).join("")}
                </div>
            `;

               if (areaProgressoes) {
    const progressões = calcularProgressoes(
        calcularAcordesEscala(escala)
    );

    areaProgressoes.innerHTML = `
        ${progressões.map(progressao => `
            <div class="progressao-acorde">
                <h4>${progressao.nome}</h4>
                <div class="botoes-acordes">
    ${progressao.acordes.map(acorde => `
        <button
            type="button"
            class="botao-acorde-progressao"
            data-acorde="${acorde}">
            ${acorde}
        </button>
    `).join("")}
</div>
            </div>
        `).join("")}
    `;
        }
        }

    });
                     
}

// ========================================
// INICIAR PROJETO
// ========================================

carregarAcordes();
// ========================================
// AFINADOR DE GUITARRA
// ========================================

const botaoAfinador = document.getElementById("iniciar-afinador");
const resultadoAfinador = document.getElementById("resultado-afinador");

let microfoneAtivo = false;
let contextoAudio;
let analisadorAudio;
let dadosAudio;
let fluxoMicrofone;

botaoAfinador.addEventListener("click", async () => {
    try {
       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Navegador sem suporte ao acesso ao microfone nesta página.");
}

fluxoMicrofone = await navigator.mediaDevices.getUserMedia({
    audio: true
});

contextoAudio = new AudioContext();

analisadorAudio = contextoAudio.createAnalyser();
analisadorAudio.fftSize = 4096;

const entradaAudio = contextoAudio.createMediaStreamSource(
    fluxoMicrofone
);

entradaAudio.connect(analisadorAudio);

dadosAudio = new Float32Array(analisadorAudio.fftSize);
        microfoneAtivo = true;
        requestAnimationFrame(atualizarAfinador);

        resultadoAfinador.innerHTML = `
            <h2>Microfone conectado!</h2>
            <p>O afinador está pronto para receber o som.</p>
        `;

        botaoAfinador.textContent = "Microfone Ativo";

        console.log("Microfone conectado:", fluxoMicrofone);

    } catch (erro) {
        resultadoAfinador.innerHTML = `
            <h2>Erro</h2>
            <p>Não foi possível acessar o microfone.</p>
        `;

        console.error("Erro ao acessar microfone:", erro);
    }
});
// ========================================
// IDENTIFICAÇÃO DAS NOTAS MUSICAIS
// ========================================

function identificarNota(frequencia) {
    const notas = [
        "C", "C#", "D", "D#", "E", "F",
        "F#", "G", "G#", "A", "A#", "B"
    ];

    const numeroNota = Math.round(
        12 * Math.log2(frequencia / 440) + 69
    );

    const nomeNota = notas[numeroNota % 12];
    const oitava = Math.floor(numeroNota / 12) - 1;

    const frequenciaIdeal = 440 * Math.pow(
        2,
        (numeroNota - 69) / 12
    );

    const diferenca = 1200 * Math.log2(
        frequencia / frequenciaIdeal
    );

    return {
        nome: nomeNota,
        oitava: oitava,
        frequencia: frequenciaIdeal,
        diferenca: diferenca
    };
}
// ========================================
// DETECÇÃO DA FREQUÊNCIA DO MICROFONE
// ========================================

function detectarFrequencia() {
    if (!analisadorAudio || !dadosAudio) return 0;

    analisadorAudio.getFloatTimeDomainData(dadosAudio);

    const tamanho = dadosAudio.length;

    let soma = 0;

    for (let i = 0; i < tamanho; i++) {
        soma += dadosAudio[i] * dadosAudio[i];
    }

    const volume = Math.sqrt(soma / tamanho);

    if (volume < 0.005) return 0;

    const taxa = contextoAudio.sampleRate;

    const atrasoMinimo = Math.floor(taxa / 400);
    const atrasoMaximo = Math.floor(taxa / 70);

    let melhorAtraso = -1;
    let melhorResultado = 0;

    for (
        let atraso = atrasoMinimo;
        atraso <= atrasoMaximo;
        atraso++
    ) {
        let correlacao = 0;

        for (let i = 0; i < tamanho - atraso; i++) {
            correlacao += dadosAudio[i] * dadosAudio[i + atraso];
        }

        if (correlacao > melhorResultado) {
            melhorResultado = correlacao;
            melhorAtraso = atraso;
        }
    }

    if (melhorAtraso === -1) return 0;

    return taxa / melhorAtraso;
}
// ========================================
// ATUALIZAR A TELA DO AFINADOR
// ========================================

function atualizarAfinador() {
    if (!microfoneAtivo) return;

    const frequencia = detectarFrequencia();

    if (frequencia === 0) {
        resultadoAfinador.innerHTML = `
            <h2>--</h2>
            <p>Toque uma corda...</p>
        `;

        requestAnimationFrame(atualizarAfinador);
        return;
    }

    const nota = identificarNota(frequencia);

      let statusAfinacao = "";

if (nota.diferenca < -5) {
    statusAfinacao = "Muito grave ↓";
} else if (nota.diferenca > 5) {
    statusAfinacao = "Muito aguda ↑";
} else {
    statusAfinacao = "AFINADO!";
}

resultadoAfinador.innerHTML = `
    <h2>${nota.nome}${nota.oitava}</h2>
    <p>Frequência: ${frequencia.toFixed(2)} Hz</p>
    <p>Diferença: ${nota.diferenca.toFixed(1)} cents</p>
    <h3>${statusAfinacao}</h3>
`;
    requestAnimationFrame(atualizarAfinador);
}