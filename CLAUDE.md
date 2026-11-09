# Instruções para o agente — tema Zendesk iPlace B2B

Este repositório guarda o tema do Help Center (Zendesk Guide) da marca
**iPlace B2B**. O Guide puxa o tema daqui:

- branch `main` → tema **iPlace B2B** de produção

## Com quem você está falando

Quem pede as mudanças aqui é uma pessoa da **equipe de suporte Zendesk**. Ela
conhece o Help Center e o conteúdo, mas **não é técnica**. O único técnico do
projeto é o **Tálys** (GitHub `talys-marques`), dono dos repositórios.

**A pessoa do suporte é autônoma**: as edições dela vão para o ar sem
aprovação nem revisão do Tálys. Você conduz o pedido do começo ao fim,
inclusive aceitar a mudança na branch do ambiente, sem esperar por ninguém.

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
- Não espere o Tálys para nada que você mesmo consiga fazer. Só se travar em
  algo que exige a conta dele (acesso, senha, permissão no GitHub ou no
  Zendesk), diga em uma frase simples que isso depende do Tálys e deixe a
  proposta de alteração explicando o bloqueio para ele.

### 3. Nunca perca conteúdo

Esta é a regra mais importante. Tudo é feito por **branch + pull request com
merge automático, sem aprovador**:

1. Atualize a branch do ambiente (`main`, ou `hml` para homologação) e crie
   a partir dela uma branch nova `suporte/<descricao-curta>` (ex.:
   `suporte/telefone-rodape`).
2. Faça a mudança, **suba a versão do tema** (veja abaixo), faça o commit
   nessa branch e envie (push) a branch.
3. Abra um **pull request** dela para a branch do ambiente.
4. **Faça você mesmo o merge** do pull request, sem pedir revisão ou
   aprovação de ninguém. Use merge comum (merge commit), não squash nem
   rebase, para o histórico ficar completo.
5. Se o pull request tiver conflito porque a branch do ambiente mudou nesse
   meio tempo, traga a branch do ambiente para a sua com `merge` (não rebase),
   resolva o conflito preservando as duas mudanças e tente de novo.

Se a sua ferramenta não conseguir abrir ou fazer o merge do pull request, não
pare: entregue à pessoa o link
`https://github.com/talys-marques/zen-iplace-b2b/compare/<branch-do-ambiente>...<sua-branch>?expand=1`
e guie em passos simples: clicar no botão verde **Create pull request**, depois
em **Merge pull request** e em **Confirm merge**.

#### Versão do tema: suba em toda mudança

O Zendesk só aceita o **Atualizar** quando o tema chega com uma versão
**maior** que a do tema publicado. Sem isso aparece o erro "Número de versão do
tema incorreto". Então, em todo pedido que mexe no tema, você mesmo sobe a
versão no `manifest.json`, sem pedir a ninguém:

- Campo `version`, no padrão `MAJOR.MINOR.PATCH`:
  - **PATCH** (`1.12.1` → `1.12.2`): correção, texto, telefone, imagem, ajuste
    visual pequeno;
  - **MINOR** (`1.12.2` → `1.13.0`): recurso novo, como um formulário, uma
    seção ou um botão novo;
  - **MAJOR**: não use. Mudança desse tamanho é com o Tálys.
- Campo `name`: atualize o número entre colchetes para a mesma versão, sem
  mudar o resto (ex.: `"iPlace B2B [v1.12.1]"` → `"iPlace B2B [v1.12.2]"`).
- A versão nova tem de ser maior que a que está **agora** na branch do
  ambiente. Se ela mudou enquanto você trabalhava (outra publicação entrou
  antes), ao trazer a branch do ambiente para a sua, pegue a maior das duas e
  suba de novo a partir dela.
- Mudança que só mexe no `CLAUDE.md` ou no `README.md` não precisa de versão
  nova, porque o tema em si não mudou.

Diga à pessoa, em palavras simples, qual é o número da versão nova. É ele que
vai aparecer no Guide depois do **Atualizar**.

Além disso:

- **Nunca** faça commit ou push direto em `main` nem em `hml`. A mudança só
  chega lá pelo merge do pull request.
- **Nunca** use `push --force`, `reset --hard` em algo já enviado, rebase de
  branch já enviada, nem apague branches, arquivos ou histórico que você não
  criou neste pedido. Pode deixar as branches `suporte/...` existindo depois
  do merge.
- Mude só o que foi pedido. Não reformate arquivos inteiros, não reorganize
  pastas, não "aproveite para melhorar" outras partes.
- Antes de enviar, confira a lista de arquivos alterados: só pode ter o que o
  pedido exige.
- Não use a mensagem `chore: publish ...` nos seus commits — ela é reservada
  para a publicação automática do Tálys.

**No Zendesk também:** o merge não muda o Help Center sozinho. A versão nova
só vai para o ar quando a pessoa clica em **Atualizar** no tema publicado
(Personalizar design › menu do tema › Atualizar). Depois do merge, explique
esse passo em palavras simples.

- Nunca recomende excluir ou sobrescrever o tema que está publicado.
- Para mudanças grandes ou arriscadas (layout, várias páginas), ofereça
  testar antes do merge: a pessoa importa a sua branch como um **tema novo**
  (Personalizar design › Adicionar tema › Importar do GitHub, repositório
  `talys-marques/zen-iplace-b2b`, branch `suporte/...`) e usa **Visualizar**, sem publicar.
  Depois o tema de teste pode ser excluído. Para ajustes pequenos (um texto,
  um telefone, uma imagem), siga direto para o merge.

### 4. Descreva bem o pull request

O pull request é o registro da mudança, e é por ele que o Tálys fica sabendo
dela depois. Escreva em português o que a pessoa pediu, o que mudou na tela e
quais arquivos foram alterados.

## Contexto técnico (só para você)

- Este repositório é **gerado** pelo projeto de origem do Tálys (`build.py
  --publish`), que substitui todo o conteúdo da branch a cada publicação. O
  `build.py` se recusa a publicar por cima de mudanças feitas aqui até o
  Tálys incorporá-las no projeto de origem, então as edições do suporte não
  se perdem — por isso o pull request bem descrito é essencial. Isso não
  bloqueia você: siga fazendo merge normalmente.
- Commits com a mensagem `chore: publish ...` na branch do ambiente são
  publicações do Tálys. Trate-os como qualquer outra mudança: nunca desfaça.
- Tema baseado no Copenhagen (Zendesk Guide, `api_version` do
  `manifest.json`). Templates em `templates/*.hbs` (Handlebars/Curlybars),
  estilos em `style.css`, scripts em `script.js`, imagens das configurações em
  `settings/`, textos em `translations/`.
- **Não edite** `assets/*-bundle.js`: é código compilado e a fonte não está
  aqui. No `manifest.json`, mexa só em `version` e no número do `name`, como
  descrito acima, e nas configurações que o pedido exigir.
- Imagens em `settings/` precisam ter o nome igual ao identificador da
  configuração no `manifest.json` (ex.: `settings/logo.png`), e cada
  configuração de imagem precisa de exatamente um arquivo — senão o Zendesk
  recusa o import.
- Dentro de `{{#each}}` o contexto muda: use `../settings.x` em vez de
  `settings.x`, senão o Zendesk recusa o import.
- O tema só renderiza no Zendesk — a validação real é importar a branch como
  tema de teste no Guide.
