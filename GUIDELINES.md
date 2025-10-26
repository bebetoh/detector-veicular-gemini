# Diretrizes de Contribuição

Obrigado pelo seu interesse em contribuir com o Analisador Veicular Gemini! Para manter a qualidade e a consistência do projeto, por favor, siga estas diretrizes.

## Estrutura do Projeto

A lógica principal está distribuída nos seguintes arquivos:

-   `App.tsx`: O componente principal da aplicação. Responsável por gerenciar o estado da UI (upload de arquivos, carregamento, erros) e renderizar a interface.
-   `services/geminiService.ts`: O coração do projeto. Contém toda a lógica para interagir com a API Gemini, incluindo a engenharia de prompts e o processamento das respostas da IA. **Qualquer alteração na lógica de detecção deve ser feita aqui.**
-   `types.ts`: Define as estruturas de dados e tipos TypeScript compartilhados pela aplicação, garantindo a consistência dos dados.
-   `index.html`: O ponto de entrada da aplicação, onde o Tailwind CSS é carregado e o contêiner do React é definido.

## Estilo de Código

-   **TypeScript:** Utilize a tipagem estática do TypeScript sempre que possível para garantir a segurança e a clareza do código.
-   **React:** Siga as melhores práticas do React, utilizando hooks para gerenciamento de estado e ciclo de vida. Mantenha os componentes funcionais e focados em uma única responsabilidade.
-   **Tailwind CSS:** Use as classes utilitárias do Tailwind CSS para estilização. Evite CSS customizado, a menos que seja estritamente necessário para animações ou estilos globais complexos.

## Realizando Alterações

### Engenharia de Prompts

A eficácia do aplicativo depende quase inteiramente da qualidade dos prompts enviados para a API Gemini em `services/geminiService.ts`. Ao modificar os prompts, siga estas regras:

1.  **Seja Explícito:** Dê instruções claras e inequívocas. A IA funciona melhor com regras diretas.
2.  **Use Restrições Negativas:** Diga à IA não apenas o que fazer, mas também o que **não** fazer (ex: "NÃO desenhe na miniatura", "NÃO toque na lataria").
3.  **Mantenha a Estratégia de Duas Etapas:** A separação entre a extração de texto e a edição de imagem é crucial para a confiabilidade. Não tente combinar tudo em uma única chamada.
4.  **Teste Iterativamente:** Teste suas alterações com uma variedade de imagens (diferentes ângulos, iluminação, veículos) para garantir que sua mudança não causou regressões.

### Modificações na Interface (UI/UX)

-   Mantenha a interface limpa, intuitiva e responsiva.
-   As cores e o design devem seguir a paleta existente (tons de cinza escuro com destaques em verde).
-   Garanta que todos os elementos interativos forneçam feedback claro ao usuário (ex: estados de carregamento, mensagens de erro).

Obrigado por ajudar a tornar este projeto ainda melhor!
