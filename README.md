# Aceite acordo Diarista Nos RH (Nós RH)

Aplicativo web profissional, intuitivo e de alta segurança jurídica desenvolvido para a **Nós RH** para coleta e formalização eletrônica de termos de adesão de trabalho autônomo (diaristas), sem necessidade de login por parte do profissional, otimizado para celulares (mobile-first), integrado ao banco de dados Supabase e pronto para deploy contínuo na Netlify.

---

## 🚀 Funcionalidades Principais

1. **Visão do Diarista (Mobile-First)**:
   - Formulário direto sem atrito ou menus complexos.
   - Validação estrita de **CPF** (máscara de digitação e validação de dígitos verificadores reais).
   - Verificação em tempo real da **Data de Nascimento / Idade**: bloqueia imediatamente menores de 18 anos com alerta em vermelho (*"Cadastro não permitido para menores de 18 anos."*).
   - Seletor de função a ser desempenhada e seleção interativa em chips para os dias pretendidos de trabalho.
   - Caixa rolável com o **Termo de Prestação de Serviços Autônomos** (Art. 442-B da CLT, sem subordinação e sem vínculo de emprego) com área demarcada para inserção do texto definitivo da empresa.
   - Checkbox obrigatório de declaração e aceite.
   - Botão de ação destacado em **Laranja Vibrante** (*"Confirmar e Assinar Acordo"*).

2. **Captura Silenciosa de Metadados Forenses (Prova Jurídica)**:
   - **Timestamp exato**: carimbo de data/hora no padrão UTC do banco de dados e horário local.
   - **Endereço de IP**: captura de IP público de conexão.
   - **Informações do Dispositivo (User Agent)**: sistema operacional, modelo do aparelho e navegador web.
   - **Geolocalização aproximada**: Cidade, Estado e coordenadas geográficas (via IP e API de geolocalização do navegador).
   - **Código de Autenticidade / Protocolo**: geração de identificador criptográfico único para cada termo assinado (ex: `NOS-2026-XXXX-XXXX`).
   - **Preservação Imutável**: gravação do texto integral do contrato no momento da assinatura.

3. **Tela de Sucesso e Recibo Digital**:
   - Selo digital de autenticidade da Nós RH.
   - Resumo completo dos dados do diarista e dos metadados probatórios.
   - Botão para **Imprimir Comprovante / Salvar em PDF** formatado para impressão.

4. **Painel Administrativo Discreto (Dashboard)**:
   - Acesso sutil no rodapé através do link neutro *"Acesso Restrito"*.
   - Senha estática de segurança: **`nosrh2026`** (não exige cadastro de administradores no Supabase).
   - Tabela dinâmica com todos os termos assinados salvos no Supabase.
   - Busca instantânea por **Nome** ou **CPF**.
   - Botão **"Visualizar Prova Jurídica"** em cada registro: abre dossiê pericial com todos os metadados técnicos e texto integral aceito, pronto para cópia ou impressão em PDF para defesa judicial.

---

## 🛠️ Configuração do Supabase (Passo a Passo)

1. Acesse seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. No menu lateral esquerdo, clique em **SQL Editor** (ícone de terminal `>_`).
3. Clique em **New Query** (Nova Consulta).
4. Abra o arquivo [`supabase_schema.sql`](./supabase_schema.sql), copie todo o seu conteúdo, cole no editor do Supabase e clique no botão **Run** (Executar).
5. O script criará:
   - A tabela `public.termos_aceite_diarista`.
   - Índices de busca por CPF, código e data.
   - Políticas de segurança (RLS) permitindo inserção anônima dos diaristas e leitura pelo painel.

---

## 🌐 Deploy na Netlify

O projeto já contém o arquivo [`netlify.toml`](./netlify.toml) e [`public/_redirects`](./public/_redirects) configurados.

### Opção 1: Deploy via GitHub / Git
1. Suba este repositório para o seu GitHub/GitLab.
2. Na Netlify, clique em **Add new site** > **Import an existing project**.
3. Selecione o repositório.
4. As configurações de build serão preenchidas automaticamente:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Em **Environment variables**, confirme ou adicione:
   - `VITE_SUPABASE_URL`: `https://creyfrztmetnnqhxaalw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZXlmcnp0bWV0bm5xaHhhYWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODczODksImV4cCI6MjEwNTE2MzM4OX0.fwOkqyaDV4HhjqRVfnpl9VDagjB6YGJNbgcgKEOujrE`
6. Clique em **Deploy site**.

### Opção 2: Deploy manual (Drag and Drop)
1. Execute localmente:
   ```bash
   npm run build
   ```
2. Arraste a pasta `dist` gerada para o painel de deploys manuais da Netlify.

---

## 💻 Execução Local

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento (Vite)
npm run dev

# Gerar build de produção
npm run build
```

---

## 🎨 Identidade Visual (Nós RH)

- **Azul Petróleo / Corporativo Profundo**: `#0B2545` e `#133B5C` (Headers, tipografia e menus).
- **Laranja Vibrante**: `#F26522` / `#FF7A00` (Botões de ação principais, badges e destaques).
- **Fundos e Cartões**: `#F8FAFC`, `#FFFFFF` e bordas sutis em `#E2E8F0`.
