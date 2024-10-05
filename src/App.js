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

// Função para encontrar os passos
const encontrarPassos = (estadoInicial, estadoFinal) => {
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

  const bfs = (estadoInicial, estadoFinal) => {
    const fila = [[estadoInicial, estadoInicial.indexOf(null), []]];
    const visitados = new Set();

    while (fila.length > 0) {
      const [estadoAtual, indiceVazio, caminho] = fila.shift();

      if (JSON.stringify(estadoAtual) === JSON.stringify(estadoFinal)) {
        return caminho; // Retorna o caminho de soluções
      }

      for (const { dx, dy } of matrizMovimentos) {
        const novaPosicao = indiceVazio + dx * 3 + dy; // calcula nova posição
        // Verifica se a nova posição está dentro dos limites e é um movimento válido
        if (novaPosicao >= 0 && novaPosicao < 9) {
          const podeMover = 
            (Math.abs(indiceVazio - novaPosicao) === 1 && Math.floor(indiceVazio / 3) === Math.floor(novaPosicao / 3)) || // Movimento horizontal
            (Math.abs(indiceVazio - novaPosicao) === 3); // Movimento vertical

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
    return [];
  };

  return bfs(estadoInicial, estadoFinal);
};

const App = () => {
  const [blocosIniciaisEstado, setBlocosIniciaisEstado] = useState(() => {
    let embaralhado = embaralharArray(blocosIniciais);
    while (!ehSolucionavel(embaralhado)) {
      embaralhado = embaralharArray(blocosIniciais);
    }
    return embaralhado;
  });

  const [blocosFinaisEstado, setBlocosFinaisEstado] = useState(estadoFinalPadrao);
  const [passos, setPassos] = useState([]);
  const [passoAtual, setPassoAtual] = useState(0);
  const [resolvendo, setResolvendo] = useState(false);

  const estaResolvido = () => {
    return JSON.stringify(blocosIniciaisEstado) === JSON.stringify(blocosFinaisEstado);
  };

  const resolverPuzzle = () => {
    const novosPassos = encontrarPassos(blocosIniciaisEstado, blocosFinaisEstado);
    setPassos(novosPassos);
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
  
      <button onClick={resolverPuzzle} disabled={estaResolvido() || resolvendo}>Resolver Puzzle</button>
      <button onClick={avancarPasso} disabled={!resolvendo || passoAtual >= passos.length}>Próximo Passo</button>
  
      {estaResolvido() && <div className="mensagem">Você atingiu o estado final!</div>}
    </div>
  );  
};

export default App;