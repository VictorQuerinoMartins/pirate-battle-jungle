# Arquitetura

## 1. Visão geral
Regra de ouro: `src/game` nunca importa de `src/ui`. TODO: diagrama.

## 2. Integração React/PixiJS
Montagem e desmontagem do app Pixi (useEffect, useRef, Strict Mode),
comunicação React <-> jogo (eventos/store). TODO.

## 3. Ciclo da simulação
Game loop, delta time, limite de dt, pausa, RNG com seed. TODO.

## 4. Colisões
AABB, o que colide com o quê, ordem de resolução. TODO.

## 5. Gerenciamento de recursos
Carregamento de assets, destruição de texturas/sprites, pool de projéteis. TODO.

## 6. Persistência local
Chaves do localStorage, formato, versionamento, falha de leitura. TODO.

## 7. Ranking e histórico
- Contratos (tipos da API)
- Cache (TanStack Query: chaves, staleTime, invalidação)
- Registros pendentes (fila local, reenvio, idempotência)
TODO.

## 8. Decisões de balanceamento
Por que cada valor da config. TODO.

## 9. Limitações conhecidas
TODO.