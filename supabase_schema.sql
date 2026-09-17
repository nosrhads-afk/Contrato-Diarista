-- ==============================================================================
-- SCRIPT DE CRIAÇÃO DE TABELA E POLÍTICAS DE SEGURANÇA (RLS) - SUPABASE
-- Aplicação: "Aceite acordo Diarista Nos RH" - Nós RH
-- Instruções: Copie todo este conteúdo, abra o painel do Supabase,
-- acesse o menu "SQL Editor", cole este script e clique em "Run".
-- ==============================================================================

-- 1. Criação da Tabela de Aceites dos Termos de Trabalho Autônomo / Diarista
CREATE TABLE IF NOT EXISTS public.termos_aceite_diarista (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Dados Pessoais do Profissional Diarista
    nome_completo TEXT NOT NULL,
    cpf TEXT NOT NULL,
    rg TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    idade INTEGER NOT NULL CHECK (idade >= 18),
    funcao TEXT NOT NULL,
    dias_trabalho TEXT NOT NULL,
    
    -- Evidências Jurídicas e Integridade do Contrato
    termo_versao TEXT DEFAULT '1.0' NOT NULL,
    termo_texto_integral TEXT NOT NULL,
    aceitou_termos BOOLEAN DEFAULT true NOT NULL,
    codigo_autenticidade TEXT UNIQUE NOT NULL,
    
    -- Metadados de Auditoria Forense
    ip_address TEXT,
    user_agent TEXT,
    dispositivo_resumo TEXT,
    geolocalizacao JSONB
);

-- 2. Índices de Otimização para Consultas e Auditorias
CREATE INDEX IF NOT EXISTS idx_termos_cpf 
    ON public.termos_aceite_diarista (cpf);

CREATE INDEX IF NOT EXISTS idx_termos_codigo 
    ON public.termos_aceite_diarista (codigo_autenticidade);

CREATE INDEX IF NOT EXISTS idx_termos_created_at 
    ON public.termos_aceite_diarista (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_termos_nome 
    ON public.termos_aceite_diarista (nome_completo);

-- 3. Habilitação de Segurança a Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.termos_aceite_diarista ENABLE ROW LEVEL SECURITY;

-- 4. Política para Inserção Pública (Diarista assina sem precisar de login)
DROP POLICY IF EXISTS "Permitir insercao anonima de aceite" ON public.termos_aceite_diarista;
CREATE POLICY "Permitir insercao anonima de aceite"
ON public.termos_aceite_diarista
FOR INSERT
TO anon, authenticated
WITH CHECK (
    aceitou_termos = true 
    AND idade >= 18 
    AND length(nome_completo) > 2
    AND length(cpf) >= 11
);

-- 5. Política para Leitura (Permite que o Painel Administrativo consulte os termos com a chave anon)
DROP POLICY IF EXISTS "Permitir leitura de termos para o painel" ON public.termos_aceite_diarista;
CREATE POLICY "Permitir leitura de termos para o painel"
ON public.termos_aceite_diarista
FOR SELECT
TO anon, authenticated
USING (true);

-- Comentários descritivos na tabela para documentação do banco
COMMENT ON TABLE public.termos_aceite_diarista IS 'Registros de aceite do termo de trabalho autônomo com metadados para validade jurídica da Nós RH';
COMMENT ON COLUMN public.termos_aceite_diarista.codigo_autenticidade IS 'Hash ou código único verificador de autenticidade do aceite';
COMMENT ON COLUMN public.termos_aceite_diarista.termo_texto_integral IS 'Texto contratual completo congelado no momento exato da assinatura';
COMMENT ON COLUMN public.termos_aceite_diarista.geolocalizacao IS 'Dados de geolocalização aproximada por IP e coordenadas (se autorizadas)';
