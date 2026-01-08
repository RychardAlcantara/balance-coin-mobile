# Balance Coin

Aplicativo mobile desenvolvido em **React Native com Expo**, utilizando **Firebase** como backend, com o objetivo de realizar o **controle financeiro pessoal**, permitindo registrar, visualizar, filtrar e editar transações financeiras de forma simples e intuitiva.

---

## 🚀 Funcionalidades

### 🏠 Home (Dashboard)

* Exibe **saldo atual** com animação
* Cards de **entradas** e **saídas**
* Gráfico de barras (Entradas x Saídas)
* Gráfico de pizza (Distribuição financeira)
* Análise financeira automática:

  * Total de entradas
  * Total de saídas
  * Percentual de gastos
  * Situação financeira
* Lista das **últimas transações**
* Botão para **criar nova transação**
* Botão de **logout**

---

### ➕ Criar Transação

* Cadastro de nova transação financeira
* Campos:

  * Descrição *(obrigatório)*
  * Valor *(obrigatório)*
  * Tipo: **Entrada** ou **Saída**
  * Upload de **comprovante (imagem opcional)**
* Validação de campos obrigatórios
* Upload da imagem para **Firebase Storage**
* Armazenamento dos dados no **Firestore**
* Data e hora automáticas da transação

---

### 📋 Listagem de Transações

* Lista completa de todas as transações do usuário
* Exibição de:

  * Descrição
  * Data da transação
  * Valor (cores diferentes para entrada e saída)
  * Miniatura da imagem (quando houver)
* **Filtros avançados**:

  * Busca por descrição
  * Filtro por período (data início e fim com calendário)
  * Filtro por tipo (todos, entradas ou saídas)
* **Paginação** para melhor desempenho
* Botão para limpar filtros
* Navegação para edição da transação

---

### ✏️ Editar Transação

* Edição dos dados da transação:

  * Descrição
  * Valor
  * Imagem (visualização e troca)
* Validação dos campos obrigatórios
* Atualização dos dados no Firestore
* Opção para **excluir transação**
* Confirmação antes da exclusão

---

## 🧠 Tecnologias Utilizadas

* **React Native**
* **Expo**
* **Expo Router**
* **Firebase Authentication**
* **Firebase Firestore**
* **Firebase Storage**
* **Expo Image Picker**
* **React Native Chart Kit**
* **TypeScript**

---

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── dashboard/
│   │   ├── index.tsx          # Home / Dashboard
│   │   ├── lista.tsx          # Listagem de transações
│   │   |── [id].tsx           # Editar transação
|   |   └── transacoes.tsx     # Criação da transação
│   ├── _layout.tsx            # Separado as rotas dos usuarios logados e usuario deslogado
│   |── index.tsx              # Login
|   └── register.tsx           # Criação de login
│
├── contexts/
│   └── AuthContext.tsx        # Autenticação
│
├── firebase/
│   └── firebaseConfig.ts      # Configuração Firebase
│
├── types/
│   └── Transacao.ts           # Tipagem de transações
|
├── components/
│   └── AnimatedBalance.tsx    # Animações com o saldo usando o Animated
|
├── utils/
│   └── firebaseErrors.ts      # Erros retornados do firebase traduzidos

```

---

## 🔐 Autenticação

* Login com **Firebase Authentication**
* Cada usuário possui suas próprias transações
* Dados organizados por:

```
users/{userId}/transacoes
```

---

## 🖼️ Upload de Imagens

* As imagens são armazenadas no **Firebase Storage**
* Organização por usuário:

```
transacoes/{userId}/{timestamp}.jpg
```

* URL salva no Firestore e exibida no app

---

## 📱 Experiência Mobile

* Interface responsiva
* Uso de **KeyboardAvoidingView**
* Dismiss automático do teclado ao tocar fora
* DatePicker otimizado para iOS e Android
* UX focada em simplicidade e clareza

---

## ▶️ Como Rodar o Projeto

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Iniciar o projeto

```bash
npx expo start
```

---

## 👨‍💻 Desenvolvedor

**Rychard Gabriell Santana de Alcantara**
📍 São Paulo - SP
💼 Desenvolvedor Full Stack
🔗 [GitHub](https://github.com/RychardAlcantara)
🔗 [LinkedIn](https://www.linkedin.com/in/rychard-alcantara-2870121b1)

---

## ⭐ Considerações Finais

Este projeto foi desenvolvido com foco em **boas práticas**, **UX mobile**, **performance** e **organização de código**, servindo como um excelente portfólio para aplicações mobile modernas com React Native e Firebase.

