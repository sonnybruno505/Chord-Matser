# 🎸 Guitar Chord Master

Aplicação web interativa para consulta e estudo de acordes, visualização do braço da guitarra, escalas musicais e progressões harmônicas. O projeto também inclui um afinador que utiliza o microfone do dispositivo para analisar o som tocado.

## Objetivo

O Guitar Chord Master foi desenvolvido para apoiar o estudo de guitarra, reunindo em uma única interface recursos de consulta musical e visualização prática.

## Funcionalidades implementadas

- **Busca de acordes:** pesquisa por cifras como `C`, `Am`, `G7` e outras cadastradas.
- **Detalhes dos acordes:** exibe nome, classificação, notas que compõem o acorde e uma explicação.
- **Diagramas de acordes:** desenho em SVG com cordas, casas, indicação de cordas abafadas/soltas e numeração dos dedos. Há tratamento visual para pestanas.
- **Braço interativo:** apresenta seis cordas e casas de 0 a 12; ao selecionar uma posição, mostra a corda, a casa e a nota.
- **Escalas musicais:** permite selecionar escalas maiores e menores naturais disponíveis no seletor e destaca suas notas no braço.
- **Acordes da escala:** apresenta os acordes associados aos graus da escala selecionada.
- **Progressões:** apresenta três sequências harmônicas; clicar em um acorde da progressão envia a cifra para a busca.
- **Afinador:** solicita acesso ao microfone, analisa o áudio e mostra a nota detectada, frequência aproximada, diferença em cents e indicação de afinação.

## Tecnologias

- HTML5 — estrutura e conteúdo da página.
- CSS3 — identidade visual, cartões, diagramas e adaptação a telas menores.
- JavaScript — lógica de busca, desenho dos diagramas, interação com o braço, escalas, progressões e processamento de áudio no navegador.
- JSON — armazenamento dos dados dos acordes.
- Web Audio API — captura e análise do áudio do microfone.
- SVG — renderização dos diagramas dos acordes.

## Estrutura de pastas

```text
chord-matser/
├── index.html
├── css/
│   ├── style.css
│   ├── guitar-bg.png
│   ├── Guitarra Elétrica em Luz Cinematográfica.png
│   └── img/
│       └── guitar-bg.png
├── data/
│   └── chords.json
├── js/
│   └── app.js
└── .vscode/
    └── launch.json
```

> Observação: o nome da pasta recebido no arquivo compactado é `chord-matser`. Se desejar, ele pode ser renomeado futuramente para `guitar-chord-master`, atualizando apenas referências externas que dependam do caminho.

## Como executar localmente

Como os acordes são carregados com `fetch()` a partir de `data/chords.json` e o afinador usa o microfone, execute o projeto por um servidor local em vez de abrir o HTML diretamente pelo caminho `file://`.

Uma opção é usar o VS Code com a extensão Live Server. Outra opção, com Node.js instalado, é abrir o terminal na pasta do projeto e executar:

```bash
npx http-server .
```

Depois, abra no navegador o endereço local apresentado pelo servidor.

Para usar o afinador, permita o acesso ao microfone quando o navegador solicitar. Em geral, o acesso ao microfone exige uma origem segura: `localhost` é aceito para desenvolvimento local; em publicação, use HTTPS.

## Como os dados funcionam

Os acordes ficam em `data/chords.json`. Cada entrada contém campos como:

- `nome`: nome legível do acorde;
- `tipo`: classificação (maior, menor, sétima ou menor com sétima);
- `notas`: notas que formam o acorde;
- `posicao`: casas/posições das seis cordas;
- `dedos`: dedos sugeridos para a execução;
- `explicacao`: texto explicativo.

O arquivo `js/app.js` carrega esse JSON, interpreta os dados e atualiza os elementos da página.

## Organização do JavaScript

O arquivo `js/app.js` concentra as principais rotinas:

1. `carregarAcordes()` — busca e carrega `data/chords.json`.
2. `buscarAcorde()` — valida a cifra digitada e mostra as informações.
3. `criarDiagrama()` — monta o diagrama SVG do acorde.
4. Rotina do braço interativo — cria as seis cordas e as posições até a 12ª casa.
5. `calcularAcordesEscala()` — calcula os acordes por grau para a escala selecionada.
6. `calcularProgressoes()` — monta três progressões a partir dos acordes da escala.
7. Rotina do afinador — solicita o microfone, obtém amostras com `AnalyserNode`, estima a frequência e identifica a nota musical.

## Afinador: funcionamento geral

O afinador utiliza `navigator.mediaDevices.getUserMedia()` para solicitar o microfone e a Web Audio API para analisar o sinal. A frequência estimada é convertida em nota musical usando a referência de 440 Hz (Lá/A4). A diferença entre a frequência captada e a frequência ideal da nota é apresentada em cents.

A indicação visual usa uma margem de aproximadamente ±5 cents para mostrar `AFINADO!`; valores abaixo ou acima desse intervalo são classificados como graves ou agudos.

## Responsividade

O CSS contém regras `@media` para ajustar a apresentação em telas menores, incluindo cabeçalho, navegação, cartões e áreas de conteúdo. A interface foi estruturada para uso em computador e celular. Recomenda-se testar os principais recursos em diferentes larguras de tela antes de cada publicação.

## Pontos de atenção para uma próxima versão

Esta documentação descreve o código recebido. Durante a revisão do pacote, foram identificados alguns itens que podem ser aprimorados antes de considerar o afinador finalizado:

- adicionar um botão para parar o afinador e encerrar as faixas do microfone;
- fechar o `AudioContext` ao interromper o afinador;
- impedir inicializações repetidas do microfone ao clicar várias vezes;
- melhorar a estimativa de frequência e validar a leitura com diferentes guitarras, ruídos e ambientes;
- revisar a lista de escalas para garantir que as notas estejam escritas de forma consistente com a nomenclatura musical adotada;
- testar a experiência completa em celular e em navegadores diferentes.

Esses itens são sugestões de evolução, não funcionalidades que esta versão já oferece.

## Publicação

O projeto é composto por arquivos estáticos e pode ser hospedado em serviços de páginas estáticas, como GitHub Pages ou Netlify. Para publicar, envie a estrutura completa de pastas, preservando os caminhos relativos. A funcionalidade de microfone deve ser testada no endereço HTTPS publicado.

## Autor

**Jessé Bruno dos Santos**

Projeto pessoal desenvolvido para estudo e prática de HTML, CSS e JavaScript.

---
