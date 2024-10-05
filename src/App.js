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
  let contagemInversões = 0;
  const arr = blocos.filter(bloco => bloco !== null);
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        contagemInversões++;
      }
    }
  }
  return contagemInversões % 2 === 0;
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

const App = () => {
  const [blocosIniciaisEstado, setBlocosIniciaisEstado] = useState(() => {
    let embaralhado = embaralharArray(blocosIniciais);
    while (!ehSolucionavel(embaralhado)) {
      embaralhado = embaralharArray(blocosIniciais);
    }
    return embaralhado;
  });

  const [blocosFinais, setBlocosFinais] = useState(estadoFinalPadrao);

  const estaResolvido = () => {
    return JSON.stringify(blocosIniciaisEstado) === JSON.stringify(blocosFinais);
  };

  return (
    <div className="App">
      
      <h1>Puzzle 8 - Estado Inicial</h1>
      <Puzzle8 blocos={blocosIniciaisEstado} setBlocos={setBlocosIniciaisEstado} podeAlterar={true} />
      
      <h1>Puzzle 8 - Estado Final</h1>
      <Puzzle8 blocos={blocosFinais} setBlocos={setBlocosFinais} podeAlterar={true} />
      
      {estaResolvido() && <div className="mensagem">Você atingiu o estado final!</div>}
    </div>
  );
};

export default App;
