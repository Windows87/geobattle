# :earth_africa: GeoBattle
Esse é um jogo Multi Jogador que criei para a Feira de Ciências (de 2018) com o tema de Geografia. Foi usado ReactJS, NodeJS com Socket.io e neDB (Não foi usado MongoDB porque ele precisa ser instalado, diferente do neDB que permite fazer uma versão Portable).
Obs: Para jogar, os computadores ou celulares devem estar na mesma rede.

<br>

## :wrench: Como Jogar
1. Dê um ``` git clone https://github.com/Windows87/geobattle ```
2. Vá na pasta do backend
3. Instale os módulos com o ``` npm install ```
4. Inicie com ``` npm start ```
5. Vai mostrar na tela uma mensagem como ***"Servidor Iniciado no IP 0.0.0.0"***
6. Para jogar, os computadores ou celulares devem entrar nesse IP

<br>

## :nut_and_bolt: Configurar
### Adicionar novas Perguntas
Para adicionar perguntas, pode usar o *geobattle-add-question.exe*
### Remover todas as Perguntas
Para remover todas as perguntas, remova o arquivo *question.db*
### Editar perguntas por Jogo
Edite o "maxQuestionsPerGame" que está por default "6" no arquivo *server.js*

<br>

## :construction_worker: Para Desenvolvedores
### Customizar
É possível customizar o jogo, removendo o tema de Geografia e colocando outro tema. Para fazer isso, é somente necessário mudar o background, editar o nome do jogo e o favicon e remover as perguntas antigas e colocar novas de acordo com o tema.

### API
```GET``` api/questions/ - Função: Obter a lista de Todas as Questões.

```GET``` api/questions/[id da questão] - Função: Obter uma Questão via o ID.

```POST``` api/questions/ - Criar uma Questão. Exemplo de Body do POST:
```javascript
{
  "title": "Ciência que trata dos terremotos e outras vibrações da terra",
  "answers": [
                "Sismologia",
                "Biogeografia",
                "Biologia",
                "Físiteria",
                "Biometria"
            ],
  "correct_answer": "Sismologia"
}
```

```DELETE``` - /api/questions/[id da questão] - Deletar uma Questão.

<br>

## :camera: Printscreens
<img src="https://raw.githubusercontent.com/Windows87/geobattle/master/printscreens/ps1.jpg">
<img src="https://raw.githubusercontent.com/Windows87/geobattle/master/printscreens/ps2.jpg">
<img src="https://raw.githubusercontent.com/Windows87/geobattle/master/printscreens/ps3.jpg">
