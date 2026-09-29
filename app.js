const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const $=s=>document.querySelector(s);

let xp=0;
const earned=new Set();
function addXP(key,amount=10){
  if(earned.has(key))return;
  earned.add(key);xp+=amount;$('#xp').textContent=xp;
}
function resetButtonStates(container){
  $$('button',container).forEach(b=>b.classList.remove('correct','wrong'));
}
function lockRound(container,lock=true){
  $$('button',container).forEach(b=>b.disabled=lock);
}
function nextLabel(current,total){return 'Round '+current+' of '+total}

$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>{
  const target=$(b.dataset.jump);if(target)target.scrollIntoView({behavior:'smooth'});
}));

// GAME 1 — Benefit Blitz
const benefitRounds=[
  {s:'A SOC receives millions of events every day. An AI engine correlates them and cuts routine triage from hours to minutes.',a:'Faster response'},
  {s:'A user usually logs in from Perth during office hours. A new model flags a 3 a.m. login from another geography.',a:'Earlier detection'},
  {s:'A model trained on historical attacks identifies suspicious behaviour that does not match a fixed signature.',a:'Predictive analytics'},
  {s:'Analysts reach different conclusions from the same ambiguous evidence. A data-driven model helps standardise the first-pass analysis.',a:'Bias reduction'},
  {s:'An AI engine prioritises alerts, but an analyst reviews the context before escalation so harmless anomalies do not disrupt the business.',a:'Fewer false positives'}
];
const benefitLabels=['Faster response','Earlier detection','Predictive analytics','Bias reduction','Fewer false positives'];
let benefitIndex=0;
function renderBenefit(){
  const r=benefitRounds[benefitIndex];$('#benefitScenario').textContent=r.s;
  const host=$('#benefitChoices');host.innerHTML='';
  benefitLabels.forEach(label=>{
    const b=document.createElement('button');b.textContent=label;
    b.onclick=()=>{
      if(host.dataset.locked)return;host.dataset.locked='1';
      if(label===r.a){b.classList.add('correct');$('#benefitFeedback').textContent='Correct — '+r.a+'.';addXP('benefit-'+benefitIndex,8)}
      else{b.classList.add('wrong');[...host.children].find(x=>x.textContent===r.a)?.classList.add('correct');$('#benefitFeedback').textContent='Best answer: '+r.a+'.'}
      setTimeout(()=>{benefitIndex=(benefitIndex+1)%benefitRounds.length;host.dataset.locked='';renderBenefit()},900);
    };host.appendChild(b);
  });
  $('#benefitFeedback').textContent=nextLabel(benefitIndex+1,benefitRounds.length);
}
renderBenefit();

// GAME 2 — Maturity Matcher
const maturityRounds=[
  {s:'The organisation has a SOC and basic IR. Analysts use Excel to inspect unusual flows, but there is no formal hunting policy.',a:'1',why:'Level 1: basic foundation, internal team and simple analytics tools.'},
  {s:'The organisation has an established IR team, frequent data feeds, AI classification and an industry-specific threat hunting policy.',a:'2',why:'Level 2: structured, policy-driven hunting with analytics and AI classification.'},
  {s:'A mature CTI program uses a skilled hunting team, automated collection/modelling and an integrated hunting platform.',a:'3',why:'Level 3: mature, automated hunting.'}
];
let maturityIndex=0;
function renderMaturity(){
  $('#maturityScenario').textContent=maturityRounds[maturityIndex].s;
  $('#maturityFeedback').textContent=nextLabel(maturityIndex+1,maturityRounds.length);
  $$('[data-maturity]').forEach(b=>{b.disabled=false;b.classList.remove('correct','wrong')});
}
$$('[data-maturity]').forEach(b=>b.addEventListener('click',()=>{
  const r=maturityRounds[maturityIndex];
  $$('[data-maturity]').forEach(x=>x.disabled=true);
  if(b.dataset.maturity===r.a){b.classList.add('correct');$('#maturityFeedback').textContent='Correct. '+r.why;addXP('maturity-'+maturityIndex,10)}
  else{b.classList.add('wrong');$('[data-maturity="'+r.a+'"]').classList.add('correct');$('#maturityFeedback').textContent=r.why}
  setTimeout(()=>{maturityIndex=(maturityIndex+1)%maturityRounds.length;renderMaturity()},1100);
}));
renderMaturity();

// Shared order-board helper
function shuffled(arr){return [...arr].sort(()=>Math.random()-.5)}
function makeOrderBoard(hostId,items){
  const host=$(hostId);
  function draw(list){
    host.innerHTML='';
    list.forEach((item,index)=>{
      const row=document.createElement('div');row.className='order-item';row.dataset.id=item.id;
      row.innerHTML='<span class="handle">'+String(index+1).padStart(2,'0')+'</span><b>'+item.label+'</b><div class="order-actions"><button aria-label="move up">↑</button><button aria-label="move down">↓</button></div>';
      const [up,down]=$$('button',row);
      up.disabled=index===0;down.disabled=index===list.length-1;
      up.onclick=()=>{if(index>0){[list[index-1],list[index]]=[list[index],list[index-1]];draw(list)}};
      down.onclick=()=>{if(index<list.length-1){[list[index+1],list[index]]=[list[index],list[index+1]];draw(list)}};
      host.appendChild(row);
    });
  }
  let list=shuffled(items);
  draw(list);
  return {
    check:()=>list.map(x=>x.id).join(',')===items.map(x=>x.id).join(','),
    shuffle:()=>{list=shuffled(items);draw(list)},
    reveal:()=>{list=[...items];draw(list)}
  };
}

// GAME 3 — Hunt sequence
const huntItems=[
  {id:1,label:'Objectives & purpose'},
  {id:2,label:'Scope definition'},
  {id:3,label:'Data selection'},
  {id:4,label:'Technique selection'},
  {id:5,label:'Report & feedback'}
];
const huntBoard=makeOrderBoard('#huntOrder',huntItems);
$('#checkHunt').onclick=()=>{
  if(huntBoard.check()){$('#huntFeedback').textContent='Correct: purpose → scope → data → technique → report & feedback.';addXP('hunt-order',15)}
  else{$('#huntFeedback').textContent='Not yet. Start with why you are hunting, then define where.'}
};
$('#shuffleHunt').onclick=()=>{huntBoard.shuffle();$('#huntFeedback').textContent='Sequence shuffled.'};

// GAME 4 — Technique Picker
const techRounds=[
  {s:'You have a list of known malicious domains and want to find them in DNS logs.',a:'Searching'},
  {s:'You want to group millions of flows by similarity without pre-labelled malicious/benign classes.',a:'Clustering'},
  {s:'You have labelled training examples and want to assign each event to malicious or non-malicious.',a:'Classification'},
  {s:'You want to count firewall event values and spot unusually rare or frequent elements.',a:'Stack counting'}
];
const techLabels=['Searching','Clustering','Classification','Stack counting'];
let techIndex=0;
function renderTech(){
  const r=techRounds[techIndex];$('#techScenario').textContent=r.s;
  const host=$('#techChoices');host.innerHTML='';
  techLabels.forEach(label=>{
    const b=document.createElement('button');b.textContent=label;
    b.onclick=()=>{
      if(host.dataset.locked)return;host.dataset.locked='1';
      if(label===r.a){b.classList.add('correct');$('#techFeedback').textContent='Correct — '+r.a+'.';addXP('tech-'+techIndex,8)}
      else{b.classList.add('wrong');[...host.children].find(x=>x.textContent===r.a)?.classList.add('correct');$('#techFeedback').textContent='Best fit: '+r.a+'.'}
      setTimeout(()=>{techIndex=(techIndex+1)%techRounds.length;host.dataset.locked='';renderTech()},900);
    };host.appendChild(b);
  });$('#techFeedback').textContent=nextLabel(techIndex+1,techRounds.length);
}
renderTech();

// GAME 5 — IOC or TTP
const ttpRounds=[
  {s:'SHA-256: 9d7f…',a:'IOC'},
  {s:'203.0.113.48 used as a C2 address',a:'IOC'},
  {s:'Lateral movement using SMB / Windows Admin Shares',a:'TTP'},
  {s:'malicious-example[.]com',a:'IOC'},
  {s:'Credential dumping from operating-system memory',a:'TTP'},
  {s:'Spearphishing attachment used for initial access',a:'TTP'}
];
let ttpIndex=0;
function renderTTP(){
  $('#ttpScenario').textContent=ttpRounds[ttpIndex].s;$('#ttpFeedback').textContent=nextLabel(ttpIndex+1,ttpRounds.length);
  $$('[data-ttp]').forEach(b=>{b.disabled=false;b.classList.remove('correct','wrong')});
}
$$('[data-ttp]').forEach(b=>b.addEventListener('click',()=>{
  const r=ttpRounds[ttpIndex];$$('[data-ttp]').forEach(x=>x.disabled=true);
  if(b.dataset.ttp===r.a){b.classList.add('correct');$('#ttpFeedback').textContent='Correct — '+r.a+'.';addXP('ttp-'+ttpIndex,8)}
  else{b.classList.add('wrong');$('[data-ttp="'+r.a+'"]').classList.add('correct');$('#ttpFeedback').textContent='This is a '+r.a+'.'}
  setTimeout(()=>{ttpIndex=(ttpIndex+1)%ttpRounds.length;renderTTP()},900);
}));
renderTTP();

// GAME 6 — Defender or adversary
const edgeRounds=[
  {s:'A model learns normal user behaviour and flags anomalous login activity.',a:'DEFENDER'},
  {s:'Malware learns which behaviour triggered an alert, then changes its execution pattern.',a:'ADVERSARY'},
  {s:'A SOC model correlates events from network, endpoint and identity sources to prioritise an incident.',a:'DEFENDER'},
  {s:'A crawler automatically finds exposed vulnerable services and starts exploitation.',a:'ADVERSARY'},
  {s:'Analytics map suspicious events to ATT&CK techniques for investigation.',a:'DEFENDER'},
  {s:'An AI-enhanced phishing system personalises messages using target behaviour.',a:'ADVERSARY'}
];
let edgeIndex=0;
function renderEdge(){
  $('#edgeScenario').textContent=edgeRounds[edgeIndex].s;$('#edgeFeedback').textContent=nextLabel(edgeIndex+1,edgeRounds.length);
  $$('[data-edge]').forEach(b=>{b.disabled=false;b.classList.remove('correct','wrong')});
}
$$('[data-edge]').forEach(b=>b.addEventListener('click',()=>{
  const r=edgeRounds[edgeIndex];$$('[data-edge]').forEach(x=>x.disabled=true);
  if(b.dataset.edge===r.a){b.classList.add('correct');$('#edgeFeedback').textContent='Correct — '+r.a.toLowerCase()+' use.';addXP('edge-'+edgeIndex,8)}
  else{b.classList.add('wrong');$('[data-edge="'+r.a+'"]').classList.add('correct');$('#edgeFeedback').textContent='This is an '+r.a.toLowerCase()+' use of AI.'}
  setTimeout(()=>{edgeIndex=(edgeIndex+1)%edgeRounds.length;renderEdge()},900);
}));
renderEdge();

// GAME 7 — Stack placement
const stackRounds=[
  {s:'DNS logs',a:'SOURCE'},
  {s:'Endpoint telemetry',a:'SOURCE'},
  {s:'Outlier analysis',a:'ENGINE'},
  {s:'Data correlation',a:'ENGINE'},
  {s:'Vulnerability identification',a:'OUTPUT'},
  {s:'Faster incident response',a:'OUTPUT'}
];
let stackIndex=0;
function renderStack(){
  $('#stackScenario').textContent=stackRounds[stackIndex].s;$('#stackFeedback').textContent=nextLabel(stackIndex+1,stackRounds.length);
  $$('[data-stack]').forEach(b=>{b.disabled=false;b.classList.remove('correct','wrong')});
}
$$('[data-stack]').forEach(b=>b.addEventListener('click',()=>{
  const r=stackRounds[stackIndex];$$('[data-stack]').forEach(x=>x.disabled=true);
  if(b.dataset.stack===r.a){b.classList.add('correct');$('#stackFeedback').textContent='Correct.';addXP('stack-'+stackIndex,8)}
  else{b.classList.add('wrong');$('[data-stack="'+r.a+'"]').classList.add('correct');$('#stackFeedback').textContent='Correct placement highlighted.'}
  setTimeout(()=>{stackIndex=(stackIndex+1)%stackRounds.length;renderStack()},900);
}));
renderStack();

// GAME 8 — QRadar order
const qradarItems=[
  {id:1,label:'Data collection — event + flow collectors'},
  {id:2,label:'Data processing — event + flow processing / rule engine'},
  {id:3,label:'Data search & applications — search, reports, graphs, alerts'}
];
const qradarBoard=makeOrderBoard('#qradarOrder',qradarItems);
$('#checkQradar').onclick=()=>{
  if(qradarBoard.check()){$('#qradarFeedback').textContent='Correct: collect → process → search/apps.';addXP('qradar-order',15)}
  else{$('#qradarFeedback').textContent='Not yet. Raw events and flows must be collected before they are processed.'}
};
$('#shuffleQradar').onclick=()=>{qradarBoard.shuffle();$('#qradarFeedback').textContent='Pipeline shuffled.'};

// FINAL QUIZ
const finalQuestions=[
  ['Which statement best captures the lecture’s position on AI in CTI?',['AI replaces analysts once enough data exists','AI is a force multiplier, but human expertise remains part of the stack','AI should only be used for malware signatures'],1],
  ['What is the defining trait of a Level 3 threat hunting program?',['Excel-based manual exploration','A hunting policy only','Mature CTI with automated collection/modelling and an automated hunting platform'],2],
  ['What comes immediately after defining hunting scope in the five-step process?',['Select relevant hunting data','Write the final report','Buy a SIEM'],0],
  ['Why is TTP-level hunting often more durable than IOC-only hunting?',['TTPs are cheaper for attackers to change','TTPs are harder for attackers to replace than hashes, IPs or domains','TTPs eliminate false positives'],1],
  ['Which is an adversarial use of AI described in the lecture?',['Behavioural anomaly detection','Automated vulnerability crawling and self-adapting malware','Correlation of security events'],1],
  ['Where does the lecture position AI in an organisation?',['Only inside the SIEM','Across SOC, incident response, TIP/SIEM and threat hunting','Only inside endpoint security'],1],
  ['What is the QRadar architecture order used in the lecture?',['Search/apps → processing → collection','Processing → collection → search/apps','Collection → processing → search/apps'],2]
];
const finalHost=$('#finalQuiz');let answered=0,score=0;
finalQuestions.forEach((q,i)=>{
  const card=document.createElement('article');card.className='final-q';card.innerHTML='<h3>'+(i+1)+'. '+q[0]+'</h3>';
  q[1].forEach((option,j)=>{
    const b=document.createElement('button');b.textContent=option;
    b.onclick=()=>{
      if(card.dataset.done)return;card.dataset.done='1';answered++;
      const buttons=$$('button',card);buttons.forEach(x=>x.disabled=true);
      if(j===q[2]){score++;b.classList.add('correct');addXP('final-'+i,10)}
      else{b.classList.add('wrong');buttons[q[2]].classList.add('correct')}
      updateFinal();
    };card.appendChild(b);
  });finalHost.appendChild(card);
});
const finalResult=document.createElement('div');finalResult.className='final-result';finalResult.textContent='Complete all 7 questions to see your score.';finalHost.appendChild(finalResult);
function updateFinal(){
  if(answered<finalQuestions.length){finalResult.textContent=answered+'/7 complete · current score '+score;return}
  const pct=Math.round(score/finalQuestions.length*100);
  finalResult.innerHTML='Final score: '+score+'/7 ('+pct+'%) · XP '+xp+'<br><span style="font-weight:600">'+(pct>=85?'Strong Week 10 understanding.':pct>=60?'Good base — revisit the highlighted answers.':'Review the mission zones and replay the games before class ends.')+'</span>';
}

// Progress + nav
const zones=$$('.zone');const nav=$$('.topbar nav a');
addEventListener('scroll',()=>{
  const root=document.documentElement,max=root.scrollHeight-root.clientHeight;
  $('#readProgress').style.width=(max?root.scrollTop/max*100:0)+'%';
  let active='';
  zones.forEach(z=>{if(scrollY>=z.offsetTop-120)active=z.id});
  nav.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+active));
},{passive:true});
