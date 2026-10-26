# Intelimaq | Assistência Técnica — versão com Supabase

## Arquivos
- `index.html`, `styles.css`, `app.js`: aplicativo.
- `supabase-config.js`: configure com a API URL e a Publishable key do seu projeto.
- `supabase-setup.sql`: execute no SQL Editor do Supabase uma única vez.

## Configuração
1. No Supabase, abra **SQL Editor**, crie uma consulta, cole o conteúdo de `supabase-setup.sql` e execute.
2. Abra `supabase-config.js` e substitua `COLE_AQUI_A_API_URL` pela API URL e `COLE_AQUI_A_PUBLISHABLE_KEY` pela Publishable key.
3. Publique todos os arquivos no repositório GitHub Pages.

**Segurança:** esta versão usa acesso sem login e políticas públicas para leitura, inclusão e edição, conforme a opção escolhida. A URL e a Publishable key ficam visíveis no navegador; isso é esperado. Nunca use uma Secret key ou service_role key no site. Não armazene dados sensíveis. Para uso empresarial seguro, recomenda-se adicionar autenticação e restringir as políticas RLS.

O histórico carrega até 200 atendimentos mais recentes e permite pesquisar por empresa, contato, modelo, série ou descrição.


## Botão Excluir atendimento
Para habilitar a exclusão, execute `supabase-delete-policy.sql` no SQL Editor do Supabase. Atenção: a política atual concede permissão pública de exclusão a visitantes anônimos; antes de usar com dados reais, implemente autenticação e restrinja as políticas RLS.
