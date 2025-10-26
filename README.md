# Analisador Veicular Gemini

Um aplicativo web inteligente que utiliza o poder da API multimodal do Google Gemini para analisar imagens de veículos, realizando tarefas de visão computacional com alta precisão.

Este projeto demonstra uma abordagem robusta de duas etapas para:
1.  Extrair de forma confiável o texto da placa de um veículo (ANPR/OCR).
2.  Utilizar a IA generativa para editar a imagem original, desenhando contornos precisos tanto na placa quanto no para-brisa do veículo principal.

## Principais Funcionalidades

-   **Reconhecimento de Placa (ANPR):** Extrai o texto alfanumérico da placa do veículo com um score de confiança.
-   **Detecção de Para-brisa:** Localiza e contorna o para-brisa do veículo principal, ignorando obstruções como limpadores.
-   **Edição de Imagem por IA:** A IA desenha os contornos diretamente na imagem, garantindo um ajuste perfeito mesmo em ângulos complexos.
-   **Foco Inteligente:** O sistema é instruído a ignorar elementos distrativos, como miniaturas de imagem, reflexos e outros veículos no fundo.
-   **Interface Moderna:** Uma interface de usuário limpa e reativa construída com React e Tailwind CSS para uma experiência de uso agradável.

## Como Funciona

O sistema utiliza uma estratégia de duas chamadas à API Gemini para garantir máxima precisão e confiabilidade:

1.  **Análise de Texto (`gemini-2.5-flash`):** Uma primeira chamada é feita a um modelo otimizado para texto com um schema de resposta rigoroso. Sua única tarefa é realizar o OCR na placa e retornar um JSON com o texto e a confiança.
2.  **Análise e Edição de Imagem (`gemini-2.5-flash-image`):** Com o texto da placa em mãos, uma segunda chamada é feita a um modelo de imagem. Ele recebe uma instrução detalhada para encontrar a placa com aquele texto específico e o para-brisa do mesmo veículo, desenhando os contornos diretamente na imagem.

## Tecnologias Utilizadas

-   **IA:** Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-flash-image`)
-   **Frontend:** React com TypeScript
-   **Estilização:** Tailwind CSS
