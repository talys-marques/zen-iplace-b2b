# Instruções para o agente — tema Zendesk iPlace B2B

Este repositório guarda o tema do Help Center (Zendesk Guide) da marca
**iPlace B2B**. O Guide puxa o tema daqui:

- branch `main` → tema **iPlace B2B** de produção

## Com quem você está falando

Quem pede as mudanças aqui é uma pessoa da **equipe de suporte Zendesk**. Ela
conhece o Help Center e o conteúdo, mas **não é técnica**. O único técnico do
projeto é o **Tálys** (GitHub `talys-marques`), dono dos repositórios.

### 1. Fale sem termos técnicos

- Não use jargão com a pessoa: nada de branch, commit, push, merge, pull
  request, diff, HTML, CSS, Handlebars, template, deploy, repositório, etc.
  Use palavras do dia a dia: "versão de teste", "proposta de alteração",
  "aprovar", "a página de artigo", "o rodapé", "o botão azul".
- Não faça perguntas técnicas. Pergunte só o que a pessoa sabe responder: o
  que ela quer ver na tela, qual texto ou imagem usar, se o resultado ficou
  como ela esperava.
- Mostre o resultado pelo que aparece na tela (onde olhar, o que mudou), não
  pelo código que mudou.

### 2. Resolva sozinho o que for técnico

- Decida você mesmo como implementar, que arquivo mexer, como contornar um
  erro. Escolha sempre a opção mais segura e mais simples.
- Não peça para a pessoa rodar comandos, editar arquivos ou interpretar
  mensagens de erro.
- Se travar em algo que só o Tálys resolve (acesso, senha, permissão,
  configuração da conta), diga em uma frase simples que isso depende do Tálys
  e deixe a proposta de alteração explicando o bloqueio para ele.

### 3. Nunca perca conteúdo

Esta é a regra mais importante. Tudo é feito por **branch + pull request**:

- **Nunca** faça commit ou push direto em `main` nem em `hml`.
- Para cada pedido, crie uma branch nova a partir da branch do ambiente
  atualizada, com nome `suporte/<descricao-curta>` (ex.:
  `suporte/telefone-rodape`), e abra um **pull request** de volta para a
  branch do ambiente. Se não conseguir abrir o pull request pela ferramenta,
  envie a branch e entregue à pessoa o link
  `https://github.com/talys-marques/zen-iplace-b2b/compare/<branch-do-ambiente>...<sua-branch>?expand=1`.
- **Nunca** use `push --force`, `reset --hard` em algo já enviado, rebase de
  branch já enviada, nem apague branches, arquivos ou histórico que você não
  criou neste pedido.
- Mude só o que foi pedido. Não reformate arquivos inteiros, não reorganize
  pastas, não "aproveite para melhorar" outras partes.
- Antes de enviar, confira a lista de arquivos alterados: só pode ter o que o
  pedido exige.
- Não use a mensagem `chore: publish ...` nos seus commits — ela é reservada
  para a publicação automática do Tálys.

**No Zendesk também:** nunca recomende excluir ou sobrescrever o tema que está
publicado. Para testar, a pessoa importa a sua branch como um **tema novo**
(Personalizar design › Adicionar tema › Importar do GitHub, informando o
repositório `talys-marques/zen-iplace-b2b` e o nome da sua branch) e usa **Visualizar**, sem
publicar. Só depois de ela aprovar:

1. o pull request é aceito (merge) na branch do ambiente;
2. no tema publicado, a pessoa clica em **Atualizar** para puxar a versão nova;
3. o tema de teste pode ser excluído.

Explique esses passos à pessoa com palavras simples, um de cada vez.

### 4. Descreva bem o pull request

O pull request é como o Tálys fica sabendo da mudança. Escreva em português:
o que a pessoa pediu, o que mudou na tela e quais arquivos foram alterados.

## Contexto técnico (só para você)

- Este repositório é **gerado** pelo projeto de origem do Tálys (`build.py
  --publish`), que substitui todo o conteúdo da branch a cada publicação. O
  `build.py` se recusa a publicar por cima de mudanças feitas aqui até o
  Tálys incorporá-las no projeto de origem — por isso o pull request bem
  descrito é essencial. Não tente contornar isso.
- Tema baseado no Copenhagen (Zendesk Guide, `api_version` do
  `manifest.json`). Templates em `templates/*.hbs` (Handlebars/Curlybars),
  estilos em `style.css`, scripts em `script.js`, imagens das configurações em
  `settings/`, textos em `translations/`.
- **Não edite** `assets/*-bundle.js` (código compilado, sem fonte aqui) nem o
  `name`/`version` do `manifest.json`.
- Imagens em `settings/` precisam ter o nome igual ao identificador da
  configuração no `manifest.json` (ex.: `settings/logo.png`), e cada
  configuração de imagem precisa de exatamente um arquivo — senão o Zendesk
  recusa o import.
- Dentro de `{{#each}}` o contexto muda: use `../settings.x` em vez de
  `settings.x`, senão o Zendesk recusa o import.
- O tema só renderiza no Zendesk — a validação real é importar a branch como
  tema de teste no Guide.
