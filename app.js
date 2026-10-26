const form=document.getElementById('messageForm');
const output=document.getElementById('output');
const statusEl=document.getElementById('status');
const companySelect=document.getElementById('companySelect');
const historyEl=document.getElementById('history');
const valueOf=id=>document.getElementById(id).value.trim();
let supabaseClient=null;
let editingId=null;
const configured=window.SUPABASE_URL && !window.SUPABASE_URL.startsWith('COLE_AQUI') && window.SUPABASE_PUBLISHABLE_KEY && !window.SUPABASE_PUBLISHABLE_KEY.startsWith('COLE_AQUI');
if(configured && window.supabase) supabaseClient=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
function setStatus(msg){statusEl.textContent=msg;}
function buildMessage(){
 const company=companySelect.selectedOptions[0]?.textContent||'', contact=valueOf('contact'), machine=valueOf('machine'), serial=valueOf('serial'), description=valueOf('description'), technician=valueOf('technician');
 const machineInfo=machine?` da máquina *${machine}*`:'';
 const serialInfo=serial?`${machineInfo?' —':''} Nº de série: *${serial}*`:'';
 let opening=contact?`Conforme contato com *${contact}*, da empresa *${company}*, registramos as informações referentes ao atendimento${machineInfo}${serialInfo}.`:`Registramos as informações referentes ao atendimento da empresa *${company}*${machineInfo}${serialInfo}.`;
 const parts=['⚙️ *_INTELIMAQ | ASSISTÊNCIA TÉCNICA_*','________________________________','📋 *REGISTRO DE ATENDIMENTO TÉCNICO*','',opening];
 if(description)parts.push('','🔧 *Descrição do atendimento:*','',description);
 parts.push('',`👨‍🔧 *Técnico responsável:* ${technician}`,'________________________________','🤝 Permanecemos à disposição para quaisquer esclarecimentos.','', '*Equipe de Assistência Técnica | Intelimaq*','________________________________','⚠️ _Mensagem enviada para fins de registro e acompanhamento do atendimento técnico._');
 return parts.join('\n');
}
async function loadCompanies(selectedId=''){
 if(!supabaseClient){companySelect.innerHTML='<option value="">Configure o Supabase primeiro</option>';return;}
 const {data,error}=await supabaseClient.from('empresas').select('id,nome').order('nome');
 if(error){companySelect.innerHTML='<option value="">Erro ao carregar empresas</option>';setStatus('Erro nas empresas: '+error.message);return;}
 companySelect.innerHTML='<option value="">Selecione uma empresa</option>'+data.map(c=>`<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');
 if(selectedId)companySelect.value=String(selectedId);
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function addCompany(){
 const name=prompt('Nome da empresa cliente:'); if(name===null)return; const nome=name.trim(); if(!nome){setStatus('Informe o nome da empresa.');return;}
 if(!supabaseClient){setStatus('Configure o Supabase no arquivo supabase-config.js.');return;}
 const {data,error}=await supabaseClient.from('empresas').insert({nome}).select('id').single();
 if(error){if(error.code==='23505')setStatus('Essa empresa já está cadastrada.');else setStatus('Não foi possível cadastrar: '+error.message);await loadCompanies();return;}
 await loadCompanies(data.id);setStatus('Empresa cadastrada.');
}
form.addEventListener('submit',async e=>{e.preventDefault();if(!supabaseClient){setStatus('Configure o Supabase no arquivo supabase-config.js.');return;} const empresaId=companySelect.value;if(!empresaId){setStatus('Selecione uma empresa.');return;}
 const companyName=companySelect.selectedOptions[0].textContent;
 const record={empresa_id:Number(empresaId),cliente:companyName,contato:valueOf('contact')||null,tratamento:null,modelo_maquina:valueOf('machine')||null,numero_serie:valueOf('serial')||null,descricao:valueOf('description')||null,tecnico:valueOf('technician')};
 let result;if(editingId)result=await supabaseClient.from('atendimentos').update(record).eq('id',editingId);else result=await supabaseClient.from('atendimentos').insert(record);
 if(result.error){setStatus('Erro ao salvar: '+result.error.message);return;}
 output.value=buildMessage();setStatus(editingId?'Atendimento atualizado com sucesso.':'Atendimento salvo com sucesso.');editingId=null;form.querySelector('button[type="submit"]').textContent='Salvar atendimento';await loadHistory();
});
document.getElementById('generateBtn').addEventListener('click',()=>{if(!companySelect.value){setStatus('Selecione uma empresa para gerar a mensagem.');return;}output.value=buildMessage();setStatus('Mensagem gerada.');});
document.getElementById('addCompanyBtn').addEventListener('click',addCompany);
document.getElementById('copyBtn').addEventListener('click',async()=>{if(!output.value.trim())output.value=buildMessage();try{await navigator.clipboard.writeText(output.value);setStatus('Mensagem copiada.');}catch(e){output.focus();output.select();setStatus('Selecione e copie o texto.');}});
document.getElementById('shareBtn').addEventListener('click',async()=>{if(!output.value.trim())output.value=buildMessage();if(navigator.share){try{await navigator.share({title:'Registro de atendimento técnico | Intelimaq',text:output.value});}catch(e){if(e.name!=='AbortError')setStatus('Não foi possível compartilhar.');}}else{try{await navigator.clipboard.writeText(output.value);setStatus('Mensagem copiada para compartilhar.');}catch(e){output.focus();output.select();setStatus('Selecione e copie o texto.');}}});
document.getElementById('refreshHistoryBtn').addEventListener('click',loadHistory);
document.getElementById('searchHistory').addEventListener('input',loadHistory);
async function loadHistory(){
 if(!supabaseClient){historyEl.innerHTML='<p class="muted">Configure a API URL e a Publishable key no arquivo supabase-config.js e publique os arquivos.</p>';return;}
 const {data,error}=await supabaseClient.from('atendimentos').select('id,criado_em,cliente,contato,modelo_maquina,numero_serie,descricao,tecnico,empresa_id,empresas(nome)').order('criado_em',{ascending:false}).limit(200);
 if(error){historyEl.innerHTML=`<p class="muted">Erro ao carregar histórico: ${escapeHtml(error.message)}</p>`;return;}
 const q=valueOf('searchHistory').toLocaleLowerCase('pt-BR');const rows=(data||[]).filter(r=>[r.empresas?.nome,r.cliente,r.contato,r.modelo_maquina,r.numero_serie,r.descricao].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(q)));
 if(!rows.length){historyEl.innerHTML='<p class="muted">Nenhum atendimento encontrado.</p>';return;}
 historyEl.innerHTML=rows.map(r=>`<article class="history-item"><div class="history-top"><strong>${escapeHtml(r.empresas?.nome||r.cliente||'Empresa não informada')}</strong><span>${escapeHtml(new Date(r.criado_em).toLocaleString('pt-BR'))}</span></div><p>${r.contato?'<b>Contato:</b> '+escapeHtml(r.contato)+' · ':''}${r.modelo_maquina?'<b>Máquina:</b> '+escapeHtml(r.modelo_maquina)+' · ':''}${r.numero_serie?'<b>Série:</b> '+escapeHtml(r.numero_serie):''}</p><p>${escapeHtml(r.descricao||'Sem descrição')}</p><small>Técnico: ${escapeHtml(r.tecnico||'—')}</small><div class="actions"><button class="secondary" data-edit="${r.id}">Editar</button><button class="secondary" data-message="${r.id}">Gerar mensagem</button><button class="danger" data-delete="${r.id}">Excluir</button></div></article>`).join('');
 historyEl.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editRecord(rows.find(r=>String(r.id)===b.dataset.edit))));
 historyEl.querySelectorAll('[data-message]').forEach(b=>b.addEventListener('click',()=>{const r=rows.find(r=>String(r.id)===b.dataset.message);loadRecordIntoForm(r);output.value=buildMessage();setStatus('Mensagem montada a partir do histórico.');window.scrollTo({top:0,behavior:'smooth'});}));
 historyEl.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteRecord(b.dataset.delete)));
}
async function deleteRecord(id){
 const confirmed=confirm('Tem certeza de que deseja excluir permanentemente este atendimento? Esta ação não pode ser desfeita.');
 if(!confirmed)return;
 if(!supabaseClient){setStatus('Supabase não está configurado.');return;}
 setStatus('Excluindo atendimento...');
 const {error}=await supabaseClient.from('atendimentos').delete().eq('id',id);
 if(error){setStatus('Não foi possível excluir. Verifique a política de DELETE no Supabase: '+error.message);return;}
 if(String(editingId)===String(id)){editingId=null;form.reset();form.querySelector('button[type="submit"]').textContent='Salvar atendimento';}
 setStatus('Atendimento excluído com sucesso.');
 await loadHistory();
}
function loadRecordIntoForm(r){companySelect.value=String(r.empresa_id||'');document.getElementById('contact').value=r.contato||'';document.getElementById('machine').value=r.modelo_maquina||'';document.getElementById('serial').value=r.numero_serie||'';document.getElementById('description').value=r.descricao||'';document.getElementById('technician').value=r.tecnico||'Alison Moura';}
function editRecord(r){if(!r)return;loadRecordIntoForm(r);editingId=r.id;form.querySelector('button[type="submit"]').textContent='Salvar alterações';setStatus('Editando atendimento #'+r.id);window.scrollTo({top:0,behavior:'smooth'});}
if(!configured){setStatus('Falta configurar o Supabase no arquivo supabase-config.js.');historyEl.innerHTML='<p class="muted">Antes de usar, coloque sua API URL e Publishable key no arquivo supabase-config.js.</p>';companySelect.innerHTML='<option value="">Configure o Supabase</option>';}
else {loadCompanies().then(loadHistory);}
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
