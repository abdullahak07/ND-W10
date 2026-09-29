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

// ===== Deep-dive flip playcards: detailed PPT content =====
const deepDivePacks={
  'ai-cti':[
    {
      title:'Why human-only analysis breaks',
      teaser:'Four pressures make manual-only CTI unreliable at scale.',
      bullets:[
        'The lecture identifies errors when analysts examine very large data volumes manually.',
        'Human interpretation can introduce bias when evidence is ambiguous or incomplete.',
        'Subtle or novel patterns may be missed without automated data-driven support.',
        'Manual triage and correlation extend processing time while threats remain active.',
        'Together, these factors can make CTI implementation ineffective and motivate AI-assisted analysis.'
      ]
    },
    {
      title:'Five benefits — the deeper version',
      teaser:'The visible labels are short; flip for what each benefit actually means.',
      bullets:[
        'Faster response: AI-enabled platforms can automate routine triage and correlation; the lecture notes standard response may move from days toward minutes.',
        'Early detection: continuous adaptation and user-behaviour analytics support anomaly detection as attacker behaviour changes.',
        'Predictive analytics: historical attack data can support hunting and non-signature-based detection against unseen or advanced threats.',
        'Bias reduction: the goal is to make analysis reflect the underlying data rather than analyst/tool stereotypes.',
        'False positives: the lecture explicitly argues that combining AI with human ability is the best way to reduce costly false alerts.'
      ]
    },
    {
      title:'Threat hunting starts before AI',
      teaser:'A mature hunting program is not created by buying a model.',
      bullets:[
        'Threat hunting is proactive: it searches for what the organisation does not yet know about, rather than only investigating known incidents.',
        'AI and modern analytics assist exploratory data analysis, but small organisations can begin with simple techniques.',
        'The lecture says a hunting journey can start with Microsoft Excel or open-source BI before moving to dedicated platforms.',
        'Threat hunting draws on incident response, forensics and CTI analytics skills, so investment in people remains essential.',
        'Illustrative platform examples in the lecture include Exabeam, Mantix4, Infocyte HUNT, Splunk, QRadar and CrowdStrike Falcon.'
      ]
    },
    {
      title:'AI is a double-edged sword',
      teaser:'The same capability strengthens defenders and adversaries.',
      bullets:[
        'The chapter frames AI and machine learning as a catalyst for a new generation of analytic systems.',
        'AI helps uncover hidden patterns across large datasets for asset protection, classification and incident response.',
        'Security and threat-intelligence vendors are integrating AI throughout their solution stacks.',
        'Adversaries can use the same technologies to improve the sophistication, adaptability and automation of attacks.',
        'The recurring theme is not “AI is good” or “AI is bad” — it is a force multiplier whose effect depends on who applies it and how.'
      ]
    }
  ],
  'maturity':[
    {
      title:'Level 1 — build the foundation',
      teaser:'Basic hunting is possible before expensive automation.',
      bullets:[
        'Deploy a centralised SOC and a basic incident-response team as the minimum foundation.',
        'Collect internal data from network elements and endpoints into a centralised system.',
        'Add open-source external data to strengthen monitoring before hunting begins.',
        'Internal analysts explore unusual events and flows using basic hunting operations.',
        'The lecture gives Excel or open-source BI, such as Grafana over HDFS data, as practical Level 1 tools.'
      ]
    },
    {
      title:'Level 2 — make hunting structured',
      teaser:'Level 2 adds formal process and AI-assisted classification.',
      bullets:[
        'Level 1 requirements remain in place; Level 2 builds on an established IR team and frequent data feeds.',
        'Processes become documented and are used across business functions as CTI matures.',
        'Analytics and AI classification help distinguish malicious from non-malicious flows and events at scale.',
        'Hunters identify indicators of compromise in collected data and act on them.',
        'An industry-specific or customised threat-hunting policy formalises procedures.'
      ]
    },
    {
      title:'Level 3 — mature and automated',
      teaser:'Automation is the defining maturity jump.',
      bullets:[
        'A mature CTI program already exists with automated data collection and modelling.',
        'The organisation invests in a skilled, purpose-built threat-hunting team.',
        'Policies are customised to threat-intelligence requirements collected across business functions.',
        'A hunting platform automates the end-to-end process and integrates with SIEM and TIP tooling.',
        'Automation extends the hunting ground beyond what manual analysis alone could sustain.'
      ]
    },
    {
      title:'How the levels differ',
      teaser:'The model is cumulative — capability is added, not replaced.',
      bullets:[
        'Each level assumes the security foundation of the previous level.',
        'Tooling escalates from Excel/open-source BI to AI classification and then to automated hunting platforms.',
        'Policy maturity increases from no formal hunting policy to industry-specific policy and then customised policy.',
        'Team investment moves from existing internal analysts to dedicated IR-linked capability and finally a skilled hunting team.',
        'Only Level 3 combines mature CTI, automated collection/modelling and a fully automated hunting process.'
      ]
    }
  ],
  'hunt':[
    {
      title:'Steps 1–2 — purpose, hypothesis, scope',
      teaser:'Before touching data, decide why you are hunting and where.',
      bullets:[
        'Map the hunting plan to concrete business objectives before the operation starts.',
        'Form a testable hypothesis using domain knowledge — for example, that attackers create command-and-control channels to exfiltrate data.',
        'MITRE ATT&CK, the Cyber Kill Chain and Diamond Model can help generate hypotheses from adversary TTPs.',
        'Define the system under test: business area, subnet, host, server or application set.',
        'Scope must be neither too broad nor too narrow, or the hunt becomes unmanageable or misses the intended threat.'
      ]
    },
    {
      title:'Step 3 — choose data that fits the task',
      teaser:'For C2 hunting, network evidence alone is not enough.',
      bullets:[
        'Network/security-element logs may include firewalls, IDS, IPS and proxies.',
        'Application logs can include HTTP, DNS, FTP, SSL and SMTP.',
        'Endpoint telemetry, data encoding and cryptographic hashes complement network evidence.',
        'VPN and other tunnelling records help build a cross-boundary view of possible command-and-control activity.',
        'Combine internal telemetry with external intelligence, and validate every source before using it.'
      ]
    },
    {
      title:'Step 4 — four foundational techniques',
      teaser:'Technique choice follows the objective and maturity level.',
      bullets:[
        'Searching: query for known indicators such as IP addresses, domains and hashes.',
        'Clustering / segmentation: group events and flows by similarity; this benefits strongly from statistical and unsupervised ML.',
        'Categorisation / classification: assign events to labelled classes, from binary malicious/benign to multi-class schemes.',
        'Stack counting: count occurrences within a source to expose rare or unusual values, such as strange firewall events.',
        'The lecture notes that machine learning extends these four foundations with additional techniques and use cases.'
      ]
    },
    {
      title:'Step 5 — report, feedback, memory',
      teaser:'A hunt is incomplete until the organisation learns from it.',
      bullets:[
        'Prepare a findings report containing the analyses performed, with material suited to technical and strategic audiences.',
        'Ask whether the selected data sources were sufficient and whether the techniques succeeded.',
        'Evaluate the hunt against explicit success criteria.',
        'Build institutional memory through a threat-hunting database or repository.',
        'The lecture also suggests creating a deep-packet-inspection signatures database so future events can trigger notifications automatically.'
      ]
    }
  ],
  'cti-hunt':[
    {
      title:'Hunting without CTI',
      teaser:'Internal intelligence works, but IOC-only hunting is brittle.',
      bullets:[
        'Hunters can search internal data for malware hashes, strings, C2 domains and IP addresses.',
        'Polymorphism and metamorphism make hash-only approaches fragile because changing a hash can be cheap.',
        'Hunters can also search host and network artefacts, protocols and abnormal perimeter traffic for lateral movement or exfiltration.',
        'Big-data analytics, ML and DL can uncover abnormal patterns but may still produce false positives.',
        'The lecture’s limitation: internal-only intelligence is good for known indicators but struggles as adversaries change their modus operandi.'
      ]
    },
    {
      title:'Why CTI frameworks strengthen hunts',
      teaser:'Move from disposable indicators toward durable adversary behaviour.',
      bullets:[
        'MITRE ATT&CK provides a practical TTP-based reference that can drive hypotheses and analytics.',
        'The Diamond Model links adversary, capability, infrastructure and victim, supporting both IOC and host-artefact hunting.',
        'The Cyber Kill Chain helps identify and anticipate threats across the attack structure.',
        'The Pyramid of Pain places TTPs at the top because responding at that level forces attackers to change more of their strategy.',
        'CTI helps identify infrastructure gaps, formulate adversary-intent hypotheses and drive collection through TIP and SIEM tooling.'
      ]
    },
    {
      title:'The left side of the V — characterization',
      teaser:'Understand the adversary before executing the hunt.',
      bullets:[
        'Develop and continually update a malicious-activity model from CTI collection, reports, analysis and research.',
        'Use ATT&CK or the Diamond Model to identify and prioritise TTPs likely to remain stable.',
        'Form hypotheses around behavioural constants — the lecture gives SMB-based lateral movement as an example.',
        'Hypotheses determine which internal and external data must be collected and contextualised.',
        'Time, attack surface and likely behaviour shape the hunt strategy and retention requirements.'
      ]
    },
    {
      title:'Build durable analytics queries',
      teaser:'Avoid overfitting hunts to one exact indicator.',
      bullets:[
        'Implementation differs by platform: QRadar and Splunk may express the same hypothesis differently.',
        'The lecture recommends building queries from high-level components such as protocol and process creation, not just exact names or IDs.',
        'A strong understanding of the attack surface is essential for durable analytics.',
        'Validate data, identify gaps and judge usability before implementing the query.',
        'General, validated queries are what make iterative threat-hunt execution sustainable.'
      ]
    },
    {
      title:'Threat-hunt execution is iterative',
      teaser:'Tune, evaluate, document, contextualise, investigate — then repeat.',
      bullets:[
        'Tune analytics so they reflect the malicious-activity events being sought.',
        'Check for outliers: too many outliers means retune; no events may mean earlier assumptions or data need revision.',
        'Classify events as malicious or non-malicious using analyst skill and expertise.',
        'Document timeline, host, user and malware details, then link events to files, processes and protocols.',
        'Investigate malicious events using models such as the Diamond Model and Cyber Kill Chain until the analytics are exhausted.'
      ]
    }
  ],
  'adversary':[
    {
      title:'Smart malware can self-evaluate',
      teaser:'Adaptive malware can learn from defender reactions.',
      bullets:[
        'Attackers can inject malicious code into legitimate files and links and let it learn target-system behaviour.',
        'Self-evaluation means the code can infer which part of its behaviour triggered the defence system.',
        'Self-actuation means it can modify behaviour to confuse defence while preserving minimum malicious capability.',
        'By learning normal system processes, smart malware can impersonate genuine applications and become harder to distinguish.',
        'The lecture also describes smart worms that check systems for vulnerabilities and exploit them automatically.'
      ]
    },
    {
      title:'Intelligent logic bombs',
      teaser:'The malicious capability can develop after implantation.',
      bullets:[
        'The lecture describes logic bombs that are not initially obviously malevolent.',
        'They can remain implanted while building or waiting for harmful capability.',
        'Triggers may depend on time, the presence of unpatched software, user counts or reaching a specific system area.',
        'These payloads may combine triggering logic with the same self-evaluating capabilities as smart malware.',
        'The defensive challenge is that the payload may remain quiet until the conditions are favourable.'
      ]
    },
    {
      title:'AI-enhanced attack vectors',
      teaser:'AI can improve the whole TTP stack, not just malware.',
      bullets:[
        'Social engineering and phishing can be enhanced with AI-generated targeting and adaptation.',
        'Vulnerability exploitation can be automated and scaled.',
        'The lecture describes AI-powered programs crawling the internet for vulnerabilities.',
        'Automated discovery can be connected to an automated full-cycle attack.',
        'This pushes defenders away from static signatures toward behavioural and TTP-aware defence.'
      ]
    },
    {
      title:'The AI vs AI arms race',
      teaser:'Static rules struggle when attacks adapt their own behaviour.',
      bullets:[
        'The same AI capability embedded in defensive TIPs and SIEM tools is also available to adversaries.',
        'Rule-based security has difficulty keeping pace with threats that alter signatures and behaviour.',
        'AI adoption is increasing on both the defensive and offensive sides.',
        'CTI analysts still need strong understanding of adversary TTPs to design defences for AI and non-AI threats.',
        'The lecture’s message is continual capability growth rather than assuming any current model creates permanent advantage.'
      ]
    }
  ],
  'stack':[
    {
      title:'First positions — SOC and incident response',
      teaser:'AI must sit inside operational processes, not beside them.',
      bullets:[
        'The SOC remains responsible for protecting networks, critical assets, endpoints, applications and cloud services.',
        'AI should integrate into the SOC so analysis supports operational protection rather than becoming a separate experiment.',
        'AI should also integrate into incident response so confirmed incidents can be identified, decided on and remediated faster.',
        'It supports internal and external threat, vulnerability, risk and security-gap identification.',
        'The lecture explicitly keeps human common sense and generalisation in the technology stack; AI is not fully autonomous.'
      ]
    },
    {
      title:'Third and fourth positions — TIP/SIEM and hunting',
      teaser:'Analytics tooling and proactive hunting complete the picture.',
      bullets:[
        'AI integration in TIPs and SIEM tools supports more objective and reliable threat-intelligence analytics.',
        'AI must also be integrated into threat-hunting programs, linking proactive hunting to the rest of security operations.',
        'Network, endpoint, data, identity, application, configuration, cloud and IoT security all feed AI engines.',
        'A central data-analytics engine performs exploratory analysis, correlation, outlier analysis, prioritisation and trend analysis.',
        'Compliance obligations still apply while the organisation protects critical data and assets.'
      ]
    },
    {
      title:'Figure 9.5 — source → engine → outcome',
      teaser:'The lecture’s stack is a flow, not a list of AI products.',
      bullets:[
        'Security sources include network, endpoint, data, identity/access, threat, application, configuration, cloud, IoT and external data.',
        'AI engines include machine learning, NLP, cognitive functions, bias reduction and unstructured-data analytics.',
        'The analytics layer performs exploratory analysis, correlation, outliers, prioritisation and trend analysis.',
        'Security-operations outcomes include threat, vulnerability, risk and security-gap identification.',
        'Incident-response outcomes include faster response, quicker identification and faster decisions/remediations.'
      ]
    },
    {
      title:'Cost, maturity and practical starting points',
      teaser:'Not every organisation should buy Level 3 tooling first.',
      bullets:[
        'AI-enabled security platforms can be expensive for small and medium organisations.',
        'The lecture suggests open-source AI models as an accessible initial step for Level 1 and Level 2 organisations.',
        'First decide where the AI program should focus; then identify critical use cases while considering integration complexity.',
        'Behavioural analysis, fraud detection and intrusion detection are presented as high-benefit, lower-complexity starting points.',
        'Level 3 organisations are more likely to invest in dedicated tools and platforms with embedded AI capabilities.'
      ]
    }
  ],
  'qradar':[
    {
      title:'QRadar benefits I — automation and analytics',
      teaser:'Five reasons the lecture uses QRadar as an AI-enabled reference point.',
      bullets:[
        'Automates routine security-operations tasks to maximise analyst effort and accelerate detection.',
        'Correlates data from multiple internal and external sources to provide actionable threat and asset insight.',
        'Maps threat events and flows to MITRE ATT&CK phases, categories or TTPs for root-cause analysis.',
        'Supports pre-built use cases for anomaly detection and offence prioritisation, while allowing custom policies.',
        'Provides a GUI with menus, gadgets and graph visualisations connecting assets, users and IOCs.'
      ]
    },
    {
      title:'QRadar benefits II — hunting and compliance',
      teaser:'The second half of the lecture’s ten documented benefits.',
      bullets:[
        'AI integration through the Watson app plus automation is presented as reducing dwell time for investigation and response.',
        'Embedded analytics and automation support threat hunting.',
        'Compliance packages include examples such as HIPAA, GDPR and PCI DSS.',
        'Modular purchasing allows organisations to add capabilities as business needs develop.',
        'IBM support and maintenance are part of the reference solution described in the lecture.'
      ]
    },
    {
      title:'Figure 9.6 — simplified architecture',
      teaser:'Collection, processing, then human-readable applications.',
      bullets:[
        'Event and flow collectors parse, preprocess and normalise incoming data into structured form.',
        'Event and flow processing engines contain the rule engine and generate threat information, alerts and priorities.',
        'The application layer exposes graphs, reports, searches and coloured alerts for analysts.',
        'Events and flows are processed separately before other modules build on the processing layer.',
        'The architecture is centralised and designed to integrate with existing security tools.'
      ]
    },
    {
      title:'Five QRadar modules',
      teaser:'The platform is modular rather than one monolithic capability.',
      bullets:[
        'Risk Manager: organisational risk analysis, assessment and control.',
        'Vulnerability Manager: vulnerability assessment and remediation workflow support.',
        'Incident Forensics: detailed investigation and incident-response capability.',
        'Advisor with Watson: AI and machine-learning integration as the cognitive engine.',
        'Security Analytics: automated and proactive analytics across collected security data.'
      ]
    },
    {
      title:'Sizing and licensing',
      teaser:'Architecture choice depends on size, topology and data rate.',
      bullets:[
        'Single-host deployment places the solution on one system and is described as suitable for smaller organisations with lower public exposure.',
        'Multi-host deployment distributes components and scales as enterprise needs grow.',
        'The lecture describes licensing in terms of events per second and flows per minute.',
        'Storage capacity determines how long historical data can be retained for analytics and investigation.',
        'Capacity planning therefore links ingestion rate, architecture and retention.'
      ]
    },
    {
      title:'Deployment models + evaluation',
      teaser:'On-prem, managed, cloud or hybrid — then evaluate alternatives the same way.',
      bullets:[
        'Deployment models in the lecture: on-premises, managed service/SaaS, cloud and hybrid.',
        'The right model balances licensing, storage, compliance and existing infrastructure.',
        'QRadar is presented as a reference point, not a mandatory product choice.',
        'Understanding its capabilities gives analysts a benchmark for evaluating other AI-enabled SIEM, SOC, IR and hunting platforms.',
        'Alternative examples in the lecture include Securonix, Splunk and AlienVault USM; the same evaluation principles should be applied to each.'
      ]
    }
  ]
};

function buildDeepDive(zoneId,cards){
  const zone=document.getElementById(zoneId);
  if(!zone||zone.querySelector('.deep-dive'))return;
  const wrap=document.createElement('section');
  wrap.className='deep-dive';
  wrap.innerHTML='<div class="deep-dive-head"><div><span>PPT DEEP DIVE</span><h3>Flip for the detail behind the short classroom summary</h3></div><div class="deep-dive-tools"><button type="button" class="flip-pack">Flip all</button><button type="button" class="front-pack">Fronts</button></div></div><div class="deep-dive-grid"></div>';
  const grid=wrap.querySelector('.deep-dive-grid');
  cards.forEach((card,index)=>{
    const btn=document.createElement('button');
    btn.type='button';btn.className='deep-flip';btn.setAttribute('aria-pressed','false');
    btn.innerHTML='<span class="deep-flip-inner"><span class="deep-face deep-front"><span class="deep-index">DEEP '+String(index+1).padStart(2,'0')+'</span><h4>'+card.title+'</h4><p>'+card.teaser+'</p><span class="flip-hint">CLICK TO FLIP ↻</span></span><span class="deep-face deep-back"><h4>'+card.title+'</h4><ul>'+card.bullets.map(x=>'<li>'+x+'</li>').join('')+'</ul></span></span>';
    btn.onclick=()=>{const on=!btn.classList.contains('flipped');btn.classList.toggle('flipped',on);btn.setAttribute('aria-pressed',on?'true':'false')};
    grid.appendChild(btn);
  });
  const insertion=zone.querySelector('.game')||zone.querySelector('.remember')||null;
  if(insertion)zone.insertBefore(wrap,insertion);else zone.appendChild(wrap);
  wrap.querySelector('.flip-pack').onclick=()=>grid.querySelectorAll('.deep-flip').forEach(c=>{c.classList.add('flipped');c.setAttribute('aria-pressed','true')});
  wrap.querySelector('.front-pack').onclick=()=>grid.querySelectorAll('.deep-flip').forEach(c=>{c.classList.remove('flipped');c.setAttribute('aria-pressed','false')});
}
Object.entries(deepDivePacks).forEach(([zone,cards])=>buildDeepDive(zone,cards));
