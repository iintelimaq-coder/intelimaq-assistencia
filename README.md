# Intelimaq — Assistência técnica (PWA)

Protótipo instalável para gerar mensagens de registro de atendimento e compartilhar/copiar para o WhatsApp. Não há banco de dados nem histórico.

## Arquivos
- `index.html`: interface e formulário
- `styles.css`: layout responsivo
- `app.js`: montagem da mensagem, compartilhar e copiar
- `manifest.json`: metadados de instalação
- `service-worker.js`: cache dos arquivos para uso offline
- `icons/`: ícones do app

## Testar localmente
O PWA precisa de HTTPS ou `localhost` para instalar e usar o service worker. Abrir `index.html` diretamente como `file://` permite conferir a interface, mas não habilita todos os recursos PWA.

Com Python instalado, na pasta do projeto execute:
```bash
python -m http.server 8000
```
No próprio computador, acesse `http://localhost:8000`. Para testar no celular, publique em um host HTTPS (por exemplo, GitHub Pages ou Cloudflare Pages) ou use um servidor de desenvolvimento acessível pela rede local com HTTPS.

## Publicar pelo GitHub Pages
1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. Abra **Settings → Pages**.
3. Escolha publicar a partir da branch principal (`main`) e da pasta raiz (`/root`).
4. Aguarde a URL HTTPS ficar disponível.
5. Abra a URL no Chrome do Android e use o menu ⋮ → **Instalar app** ou **Adicionar à tela inicial**.

## Privacidade e limites
- O app monta a mensagem no próprio aparelho; não envia os dados para um servidor.
- O protótipo não salva histórico. Ao atualizar ou fechar, os campos não são persistidos deliberadamente.
- A mensagem só é enviada quando o usuário escolhe um destino e confirma no WhatsApp.
- O menu de compartilhamento depende do suporte do navegador. Se não estiver disponível, o botão tenta copiar a mensagem.
- Se alterar os arquivos depois de publicar, atualize `CACHE_NAME` no `service-worker.js` (por exemplo, `v2`) para renovar o cache.

## Personalização
Os nomes dos técnicos estão no `index.html`. A mensagem padrão está na função `buildMessage()` em `app.js`.
