const form = document.getElementById('messageForm');
const output = document.getElementById('output');
const status = document.getElementById('status');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const valueOf = id => document.getElementById(id).value.trim();
function buildMessage(){
  const treatment=valueOf('treatment'), client=valueOf('client'), machine=valueOf('machine'), serial=valueOf('serial'), description=valueOf('description'), technician=valueOf('technician');
  const clientName=[treatment,client].filter(Boolean).join(' ');
  const machineInfo=machine ? ` da máquina *${machine}*` : '';
  const serialInfo=serial ? `${machineInfo ? ' —' : ''} Nº de série: *${serial}*` : '';
  let opening;
  if(clientName) opening=`Conforme contato com ${clientName}, registramos as informações referentes ao atendimento${machineInfo}${serialInfo}.`;
  else opening=`Registramos as informações referentes ao atendimento${machineInfo}${serialInfo}.`;
  const parts=['⚙️ *_INTELIMAQ | ASSISTÊNCIA TÉCNICA_*','------------------------------------------------------------------','📋 *REGISTRO DE ATENDIMENTO TÉCNICO*','',opening];
  if(description) parts.push('','🔧 *Descrição do atendimento:*','',description);
  parts.push('',`👨‍🔧 *Técnico responsável:* ${technician}`,'------------------------------------------------------------------','🤝 Permanecemos à disposição para quaisquer esclarecimentos.','', '*Equipe de Assistência Técnica | Intelimaq*','------------------------------------------------------------------','⚠️ _Mensagem enviada para fins de registro e acompanhamento do atendimento técnico._');
  return parts.join('\n');
}
form.addEventListener('submit',e=>{e.preventDefault();output.value=buildMessage();status.textContent='Mensagem gerada';});
function ensureMessage(){if(!output.value.trim()) output.value=buildMessage();return output.value;}
copyBtn.addEventListener('click',async()=>{const message=ensureMessage();try{await navigator.clipboard.writeText(message);status.textContent='Mensagem copiada';}catch(e){output.focus();output.select();const ok=document.execCommand('copy');status.textContent=ok?'Mensagem copiada':'Selecione e copie o texto';}});
shareBtn.addEventListener('click',async()=>{const message=ensureMessage();if(navigator.share){try{await navigator.share({title:'Registro de atendimento técnico | Intelimaq',text:message});status.textContent='Compartilhamento aberto';}catch(e){if(e.name!=='AbortError')status.textContent='Não foi possível compartilhar';}}else{try{await navigator.clipboard.writeText(message);status.textContent='Compartilhamento indisponível; mensagem copiada';}catch(e){output.focus();output.select();status.textContent='Selecione e copie o texto';}}});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
