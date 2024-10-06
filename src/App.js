import React, { useState } from 'react';
import './App.css';

const blocosIniciais = [1, 2, 3, 4, 5, 6, 7, 8, null];
const estadoFinalPadrao = [1, 2, 3, 4, 5, 6, 7, 8, null];

const embaralharArray = (array) => {
  let embaralhado = [...array];
  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
};

const ehSolucionavel = (blocos) => {
  let contagemInversoes = 0;
  const arr = blocos.filter(bloco => bloco !== null);
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        contagemInversoes++;
      }
    }
  }
  return contagemInversoes % 2 === 0;
};

const Puzzle8 = ({ blocos, setBlocos, podeAlterar }) => {
  const lidarComCliqueBloco = (indice) => {
    const indiceVazio = blocos.indexOf(null);
    const indicesAdjacentes = [
      indiceVazio - 1, indiceVazio + 1,
      indiceVazio - 3, indiceVazio + 3
    ];

    if (indicesAdjacentes.includes(indice) && podeAlterar) {
      const novosBlocos = [...blocos];
      novosBlocos[indiceVazio] = novosBlocos[indice];
      novosBlocos[indice] = null;
      setBlocos(novosBlocos);
    }
  };

  return (
    <div className="puzzle-container">
      {blocos.map((bloco, indice) => (
        <div
          key={indice}
          className={`tile ${bloco === null ? 'empty' : ''}`}
          onClick={() => lidarComCliqueBloco(indice)}
        >
          {bloco}
        </div>
      ))}
    </div>
  );
};

const matrizMovimentos = [
  { dx: 1, dy: 0 }, // Down
  { dx: -1, dy: 0 }, // Up
  { dx: 0, dy: 1 }, // Right
  { dx: 0, dy: -1 } // Left
];

const trocaBlocos = (blocos, indice1, indice2) => {
  const novosBlocos = [...blocos];
  [novosBlocos[indice1], novosBlocos[indice2]] = [novosBlocos[indice2], novosBlocos[indice1]];
  return novosBlocos;
};


const aStar = (estadoInicial, estadoFinal) => {
  // Inicializa a fila com o estado inicial, índice do espaço vazio, caminho percorrido até aqui e custo total (g)
  const fila = [[estadoInicial, estadoInicial.indexOf(null), [], 0]];
  const visitados = new Set(); // Conjunto para rastrear estados já visitados
  let qtdeNosVisitados = 0;
  // Enquanto houver estados a explorar na fila
  while (fila.length > 0) {
    qtdeNosVisitados++;
    // Ordena a fila pela função de custo total f(n) = g(n) + h(n)
    fila.sort((a, b) => (a[3] + calcularHeuristica(a[0], estadoFinal)) - (b[3] + calcularHeuristica(b[0], estadoFinal)));

    // Remove o primeiro estado da fila para explorar (o de menor custo)
    const [estadoAtual, indiceVazio, caminho, g] = fila.shift();

    // Verifica se o estado atual é o estado final
    if (JSON.stringify(estadoAtual) === JSON.stringify(estadoFinal)) {
      return { caminho, qtdeNosVisitados }; // Retorna o caminho de solução encontrado
    }

    // Para cada movimento possível (cima, baixo, esquerda, direita)
    for (const { dx, dy } of matrizMovimentos) {
      // Calcula a nova posição do espaço vazio após o movimento
      const novaPosicao = indiceVazio + dx * 3 + dy;

      // Verifica se a nova posição está dentro dos limites do puzzle
      if (novaPosicao >= 0 && novaPosicao < 9) {
        // Verifica se o movimento é válido (adjacente ao espaço vazio)
        const podeMover = 
          (Math.abs(indiceVazio - novaPosicao) === 1 && Math.floor(indiceVazio / 3) === Math.floor(novaPosicao / 3)) || 
          (Math.abs(indiceVazio - novaPosicao) === 3);

        // Se o movimento é válido
        if (podeMover) {
          // Executa a troca dos blocos para criar um novo estado
          const novoEstado = trocaBlocos(estadoAtual, indiceVazio, novaPosicao);
          const chave = JSON.stringify(novoEstado); // Converte o novo estado em string para usar como chave

          // Se o novo estado ainda não foi visitado
          if (!visitados.has(chave)) {
            visitados.add(chave); // Marca o novo estado como visitado
            // Adiciona o novo estado, nova posição do espaço vazio, caminho atualizado e custo atual + 1 (movimento feito)
            fila.push([novoEstado, novaPosicao, [...caminho, novoEstado], g + 1]);
          }
        }
      }
    }
  }

  return { caminho: [], qtdeNosVisitados }; // Se não encontrar solução, retorna um array vazio
};

const bestFirstSearch = (estadoInicial, estadoFinal) => {
  const fila = [[estadoInicial, estadoInicial.indexOf(null), []]];
  const visitados = new Set();
  let qtdeNosVisitados = 0;

  while (fila.length > 0) {
    fila.sort((a, b) => calcularHeuristica(a[0], estadoFinal) - calcularHeuristica(b[0], estadoFinal));
    const [estadoAtual, indiceVazio, caminho] = fila.shift();
    qtdeNosVisitados++;
    if (JSON.stringify(estadoAtual) === JSON.stringify(estadoFinal)) {
      return { caminho, qtdeNosVisitados };
    }

    for (const { dx, dy } of matrizMovimentos) {
      const novaPosicao = indiceVazio + dx * 3 + dy;

      if (novaPosicao >= 0 && novaPosicao < 9) {
        const podeMover =
          (Math.abs(indiceVazio - novaPosicao) === 1 && Math.floor(indiceVazio / 3) === Math.floor(novaPosicao / 3)) ||
          (Math.abs(indiceVazio - novaPosicao) === 3);

        if (podeMover) {
          const novoEstado = trocaBlocos(estadoAtual, indiceVazio, novaPosicao);
          const chave = JSON.stringify(novoEstado);

          if (!visitados.has(chave)) {
            visitados.add(chave);
            fila.push([novoEstado, novaPosicao, [...caminho, novoEstado]]);
          }
        }
      }
    }
  }
  return { caminho: [], qtdeNosVisitados };
};


const calcularHeuristica = (estadoAtual, estadoFinal) => {//distancia manhattan
  let somaDistancias = 0; // Inicializa uma variável para somar as distâncias de Manhattan.

  // Percorre cada bloco no estado atual.
  for (let i = 0; i < estadoAtual.length; i++) {
    const bloco = estadoAtual[i]; // Obtém o bloco atual.

    if (bloco !== null) { // Verifica se o bloco não é o espaço vazio.
      const indiceFinal = estadoFinal.indexOf(bloco); // Encontra o índice do bloco no estado final.
      
      // Calcula a posição atual do bloco (x, y) usando a largura do puzzle (3).
      const posicaoAtual = { x: i % 3, y: Math.floor(i / 3) };
      
      // Calcula a posição final do bloco (x, y) no estado final.
      const posicaoFinal = { x: indiceFinal % 3, y: Math.floor(indiceFinal / 3) };

      // Adiciona a distância de Manhattan para este bloco à soma total.
      somaDistancias += Math.abs(posicaoAtual.x - posicaoFinal.x) + Math.abs(posicaoAtual.y - posicaoFinal.y);
    }
  }

  return somaDistancias; // Retorna a soma total das distâncias de Manhattan.
};

const Caminho = ({ estados }) => {
  return (
    <div className="caminho-container">
      {estados.map((estado, index) => (
        <div key={index} className="puzzle-state">
          <Puzzle8 blocos={estado} setBlocos={() => {}} podeAlterar={false} />
        </div>
      ))}
    </div>
  );
};




const App = () => {
  const [blocosIniciaisEstado, setBlocosIniciaisEstado] = useState(() => {
    let embaralhado = embaralharArray(blocosIniciais);
    while (!ehSolucionavel(embaralhado)) {
      embaralhado = embaralharArray(blocosIniciais);
    }
    return embaralhado;
  });

  const setaPuzzleInvertido = () => {
    setBlocosIniciaisEstado([8,7,6,5,4,3,2,1,null]);
  }

  const [blocosFinaisEstado, setBlocosFinaisEstado] = useState(estadoFinalPadrao);
  const [passos, setPassos] = useState([]);
  const [passoAtual, setPassoAtual] = useState(0);
  const [resolvendo, setResolvendo] = useState(false);
  const [distanciaManhattan, setDistanciaManhattan] = useState(-1); // Estado para armazenar a distância
  const [caminho, setCaminho] = useState([]);
  const [tempoGasto, setTempoGasto] = useState(0);
  const [nosVisitados, setNosVisitados] = useState(0);

  const estaResolvido = () => {
    return JSON.stringify(blocosIniciaisEstado) === JSON.stringify(blocosFinaisEstado);
  };

  const resolverPuzzleAStar = () => {
    const inicio = performance.now();
    const { caminho, qtdeNosVisitados } = aStar(blocosIniciaisEstado, blocosFinaisEstado);
    const fim = performance.now();
    
    const tempo = fim - inicio;
    setTempoGasto(tempo);

    setCaminho(caminho);
    setPassos(caminho);
    setNosVisitados(qtdeNosVisitados);
    setPassoAtual(0);
    setResolvendo(true);
  };

  const resolverPuzzleBestFirst = () => {
    const inicio = performance.now();
    const { caminho, qtdeNosVisitados } = bestFirstSearch(blocosIniciaisEstado, blocosFinaisEstado);
    const fim = performance.now();

    const tempo = fim - inicio;
    setTempoGasto(tempo);
    setCaminho(caminho);
    setPassos(caminho);
    setNosVisitados(qtdeNosVisitados);
    setPassoAtual(0);
    setResolvendo(true);
  };

  const avancarPasso = () => {
    if (passoAtual < passos.length) {
      setBlocosIniciaisEstado(passos[passoAtual]);
      setPassoAtual(passoAtual + 1);
    }
    if (passoAtual === passos.length - 1) {
      setResolvendo(false); // Finaliza a resolução
    }
  };

  const calcularSomaDistanciasManhattan = () => {
    let somaDistancias = 0;

    for (let i = 0; i < blocosIniciaisEstado.length; i++) {
      const bloco = blocosIniciaisEstado[i];
      if (bloco !== null) { // Ignora o bloco vazio
        const indiceFinal = blocosFinaisEstado.indexOf(bloco);
        if (indiceFinal !== -1) {

          const posicaoAtual = { x: i % 3, y: Math.floor(i / 3) };
          const posicaoFinal = { x: indiceFinal % 3, y: Math.floor(indiceFinal / 3) };

          const distancia = Math.abs(posicaoAtual.x - posicaoFinal.x) + Math.abs(posicaoAtual.y - posicaoFinal.y);
          somaDistancias += distancia;
        }
      }
    }
    setDistanciaManhattan(somaDistancias); // Atualiza o estado com a soma
  };

  return (
    <div className="App">
      <h1>Puzzle 8</h1>

      <div className="puzzles-container">
        <div>
          <h2>Estado Inicial</h2>
          <Puzzle8 blocos={blocosIniciaisEstado} setBlocos={setBlocosIniciaisEstado} podeAlterar={true} />
        </div>

        <div>
          <h2>Estado Final</h2>
          <Puzzle8 blocos={blocosFinaisEstado} setBlocos={setBlocosFinaisEstado} podeAlterar={true} />
        </div>
      </div>

      
      <div className='div-botoes'>
        <button onClick={resolverPuzzleAStar} disabled={estaResolvido()}>Resolver com A*</button>
        <button onClick={resolverPuzzleBestFirst} disabled={estaResolvido()}>Resolver Best-First</button>
      </div>

      <div className='div-botoes'>
        <button onClick={setaPuzzleInvertido}>Puzzle Invertido</button>
        <button onClick={calcularSomaDistanciasManhattan}>Distância Manhattan</button>
      </div>
      
      <button onClick={avancarPasso} disabled={!resolvendo || passoAtual >= passos.length}>Próximo Passo</button>

      {distanciaManhattan >= 0 && <div className="mensagem">Distância de Manhattan: {distanciaManhattan}</div>}

      {tempoGasto >= 0 && (
        <div className="mensagem">
          Tempo gasto na resolução: {tempoGasto.toFixed(2)} ms
          {nosVisitados > 0 && <div className="mensagem">Nós visitados: {nosVisitados}</div>}
        </div>
      )}

      {estaResolvido() && <div className="mensagem">Você atingiu o estado final!</div>}

      {caminho.length > 0 && (
        <div className="caminho">
          <h2>Caminho para solução:  {caminho.length} Movimentos</h2>
          <Caminho estados={caminho} />
        </div>
      )}
    </div>
  );
};

export default App;