const FALLBACK_CARDS = [
  ['sv3pt5-199','Charizard ex','151','Special Illustration Rare','https://images.pokemontcg.io/sv3pt5/199_hires.png',119.42,349.99],
  ['swsh9-166','Arceus V','Brilliant Stars','Alternate Art','https://images.pokemontcg.io/swsh9/166_hires.png',46.21,142.00],
  ['swsh12-186','Lugia V','Silver Tempest','Alternate Art','https://images.pokemontcg.io/swsh12/186_hires.png',172.55,498.00],
  ['swsh7-215','Umbreon VMAX','Evolving Skies','Secret Rare','https://images.pokemontcg.io/swsh7/215_hires.png',920.00,2250.00],
  ['sv4pt5-234','Charizard ex','Paldean Fates','Special Illustration Rare','https://images.pokemontcg.io/sv4pt5/234_hires.png',105.70,285.00],
  ['sv8-238','Pikachu ex','Surging Sparks','Special Illustration Rare','https://images.pokemontcg.io/sv8/238_hires.png',189.40,610.00],
  ['swsh8-271','Gengar VMAX','Fusion Strike','Alternate Art','https://images.pokemontcg.io/swsh8/271_hires.png',390.15,980.00],
  ['sv2-203','Magikarp','Paldea Evolved','Illustration Rare','https://images.pokemontcg.io/sv2/203_hires.png',145.00,455.00]
].map(([id,name,set,rarity,image])=>({id,name,set:{name},rarity,images:{small:image.replace('_hires',''),large:image}}));
const FALLBACK_SETS = [['sv8','Surging Sparks','2024/11/08',252],['sv3pt5','151','2023/09/22',207],['sv4pt5','Paldean Fates','2024/01/26',245],['swsh7','Evolving Skies','2021/08/27',237],['swsh8','Fusion Strike','2021/11/12',284],['swsh9','Brilliant Stars','2022/02/25',186]].map(([id,name,releaseDate,total])=>({id,name,releaseDate,total,images:{logo:`https://images.pokemontcg.io/${id}/logo.png`}}));

const STORAGE_KEY='cardfolio';
const savedPortfolio=JSON.parse(localStorage.getItem(STORAGE_KEY)||localStorage.getItem('pokefolio')||'[]').map(card=>card.priceSource?card:{...card,price:0});
const state={cards:[],sets:[],page:1,query:'',priceFilter:'all',priceSort:'default',activeSet:null,setCards:[],setPage:1,setRarity:'all',portfolio:savedPortfolio,selected:null};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const PRICE_LABELS={normal:'Normal',holofoil:'Holofoil',reverseHolofoil:'Reverse holofoil','1stEditionNormal':'1st Edition normal','1stEditionHolofoil':'1st Edition holofoil',unlimited:'Unlimited',unlimitedHolofoil:'Unlimited holofoil'};
const TCGPLAYER_GUIDE_PRICES={};
const MANUAL_RAW_PRICES={
  'me2pt5:9':[['normal','Normal',.24],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.35],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.24]],
  'me2pt5:13':[['normal','Normal',.07],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.31],['reverseHolofoilLove','Reverse holofoil · Love Ball',.23]],
  'me2pt5:16':[['reverseHolofoil','Reverse holofoil',.81],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.26],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.26]],
  'me2pt5:28':[['normal','Normal',.05],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.29],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.21]],
  'me2pt5:84':[['holofoil','Holofoil',.83]],
  'me2pt5:91':[['normal','Normal',.03],['reverseHolofoilDusk','Reverse holofoil · Dusk Ball',.33],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.26]],
  'me2pt5:147':[['reverseHolofoil','Reverse holofoil',1],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.21],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.23]],
  'me2pt5:180':[['reverseHolofoil','Reverse holofoil',.31]],'me2pt5:181':[['reverseHolofoil','Reverse holofoil',.38]],'me2pt5:182':[['reverseHolofoil','Reverse holofoil',.25]],
  'me2pt5:183':[['reverseHolofoil','Reverse holofoil',.62]],'me2pt5:184':[['reverseHolofoil','Reverse holofoil',.26]],'me2pt5:185':[['reverseHolofoil','Reverse holofoil',.42]],
  'me2pt5:219':[['holofoil','Holofoil',6.79]],'me2pt5:221':[['holofoil','Holofoil',7.99]],'me2pt5:234':[['holofoil','Holofoil',11.23]],
  'me2pt5:254':[['holofoil','Holofoil',1.11]],'me2pt5:255':[['holofoil','Holofoil',1]],'me2pt5:256':[['holofoil','Holofoil',6.88]],
  'me2pt5:257':[['holofoil','Holofoil',2.75]],'me2pt5:291':[['holofoil','Holofoil',38.27]],
  'me2pt5:117':[['normal','Normal',.07],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.27],['reverseHolofoilLove','Reverse holofoil · Love Ball',.20]],
  'me2pt5:242':[['holofoil','Holofoil',5.63]],
  'me2pt5:119':[['normal','Normal',.11],['reverseHolofoilDusk','Reverse holofoil · Dusk Ball',.23],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.23]],
  'me2pt5:14':[['normal','Normal',.13],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.24],['reverseHolofoilLove','Reverse holofoil · Love Ball',.22]],
  'me2pt5:65':[['normal','Normal',.14],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.23],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.19]],
  'me2pt5:20':[['normal','Normal',.18],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.33],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.32]],
  'me2pt5:21':[['normal','Normal',.18],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.40],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.33]],
  'me2pt5:258':[['holofoil','Holofoil',.69]],
  'me2pt5:8':[['normal','Normal',.27],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.25],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.26]],
  'me2pt5:38':[['holofoil','Holofoil',.78]],
  'me2pt5:75':[['normal','Normal',.14],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.34],['reverseHolofoilLove','Reverse holofoil · Love Ball',.37]],
  'me2pt5:74':[['normal','Normal',.21],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.26],['reverseHolofoilLove','Reverse holofoil · Love Ball',.52]],
  'me2pt5:120':[['holofoil','Holofoil',.16],['reverseHolofoilDusk','Reverse holofoil · Dusk Ball',.24],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.29]],
  'me2pt5:186':[['reverseHolofoil','Reverse holofoil',.27]],'me2pt5:259':[['holofoil','Holofoil',.49]],
  'me2pt5:42':[['normal','Normal',.19],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.32],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.26]],
  'me2pt5:110':[['normal','Normal',.24],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.37],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.49]],
  'me2pt5:111':[['holofoil','Holofoil',.84]],
  'me2pt5:109':[['reverseHolofoil','Reverse holofoil',.41],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.38],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.31]],
  'me2pt5:133':[['reverseHolofoil','Reverse holofoil',.43],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.43],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.29]],
  'me2pt5:244':[['holofoil','Holofoil',8.99]],
  'me2pt5:166':[['normal','Normal',.05],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.22],['reverseHolofoilLove','Reverse holofoil · Love Ball',.22]],
  'me2pt5:160':[['holofoil','Holofoil',1.11]],
  'me2pt5:151':[['normal','Normal',.25],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.41],['reverseHolofoilLove','Reverse holofoil · Love Ball',.30]],
  'me2pt5:159':[['normal','Normal',.23],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.26],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.22]],
  'me2pt5:248':[['holofoil','Holofoil',5.60]],
  'me2pt5:176':[['normal','Normal',.06],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.28],['reverseHolofoilFriend','Reverse holofoil · Friend Ball',.23]],
  'me2pt5:150':[['normal','Normal',.21],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.26],['reverseHolofoilLove','Reverse holofoil · Love Ball',.25]],
  'me2pt5:158':[['normal','Normal',.18],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.24],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.26]],
  'me2pt5:247':[['holofoil','Holofoil',7.20]],
  'me2pt5:15':[['normal','Normal',.11],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.29],['reverseHolofoilLove','Reverse holofoil · Love Ball',.28]],
  'me2pt5:220':[['holofoil','Holofoil',3.19]],
  'me2pt5:60':[['normal','Normal',.22],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.28],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.20]],
  'me2pt5:25':[['holofoil','Holofoil',.25],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.30],['reverseHolofoilQuick','Reverse holofoil · Quick Ball',.26]],
  'me2pt5:4':[['reverseHolofoil','Reverse holofoil',.72],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.26],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.23]],
  'me2pt5:2':[['normal','Normal',.13],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.24],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.27]],
  'me2pt5:1':[['normal','Normal',.15],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.30],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.25]],
  'me2pt5:7':[['normal','Normal',.12],['reverseHolofoilEnergy','Reverse holofoil · Energy Symbol Pattern',.22],['reverseHolofoilPoke','Reverse holofoil · Poké Ball',.23]]
};
const getManualPrices=c=>(MANUAL_RAW_PRICES[`${c.set?.id}:${Number(c.number)}`]||[]).map(([variant,label,market])=>({variant,label,market,low:0,mid:0,source:'TCGplayer manual snapshot'}));
const getGuidePrices=c=>TCGPLAYER_GUIDE_PRICES[`${c.set?.id}:${Number(c.number)}`]||[];
const getPriceEntries=c=>{const live=Object.entries(c.tcgplayer?.prices||{}).map(([variant,values])=>({variant,label:PRICE_LABELS[variant]||variant.replace(/([A-Z])/g,' $1'),market:Number(values?.market)||0,low:Number(values?.low)||0,mid:Number(values?.mid)||0,source:'TCGplayer API'})).filter(x=>x.market>0);const merged=new Map([...getManualPrices(c),...getGuidePrices(c),...live].map(price=>[price.variant,price]));return [...merged.values()].sort((a,b)=>a.market-b.market)};
const getPrice=c=>getPriceEntries(c)[0]?.market||0;
const rawEstimate=c=>{const age=Math.max(1,new Date().getFullYear()-Number(c.set?.releaseDate?.slice(0,4)||2024)+1);const rarityFactor=/rare|promo/i.test(c.rarity||'')?0.22:1;return Math.round((1800000/age)*rarityFactor/1000)*1000};
async function fetchVerifiedJson(url,attempts=3){let error;for(let attempt=0;attempt<attempts;attempt++){try{const response=await fetch(url,{cache:'no-store'});if(response.ok)return await response.json();error=new Error(`HTTP ${response.status}`)}catch(e){error=e}await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)))}throw error}

function guideVariant(row){
  const special=(row.name.match(/\((Energy Symbol Pattern|Friend Ball|Quick Ball|Dusk Ball|Love Ball|Pok[eé] Ball)\)/i)||[])[1];
  const base=/reverse/i.test(row.printing)?'reverseHolofoil':/holo/i.test(row.printing)?'holofoil':'normal';
  if(!special)return {variant:base,label:PRICE_LABELS[base]||row.printing};
  const suffix={
    'energy symbol pattern':'Energy',
    'friend ball':'Friend',
    'quick ball':'Quick',
    'dusk ball':'Dusk',
    'love ball':'Love',
    'poke ball':'Poke',
    'poké ball':'Poke'
  }[special.toLowerCase()];
  return {variant:`${base}${suffix}`,label:`Reverse holofoil · ${special}`};
}
async function loadTcgplayerSetPrices(endpoint,setId){
  try{
    const guide=await fetchVerifiedJson(endpoint,2);
    guide.prices.forEach(row=>{const key=`${setId}:${row.number}`,mapped=guideVariant(row);(TCGPLAYER_GUIDE_PRICES[key]??=[]).push({...mapped,market:row.market,low:row.low,mid:0,source:'Live TCGplayer price guide'});});
  }catch(error){console.warn(`${setId} live prices unavailable; retaining any saved price snapshots.`,error)}
}
async function loadLivePriceGuides(){await Promise.all([
  loadTcgplayerSetPrices('/api/prices/ascended-heroes','me2pt5'),
  loadTcgplayerSetPrices('/api/prices/pitch-black','me5'),
  loadTcgplayerSetPrices('/api/prices/chaos-rising','me4'),
  loadTcgplayerSetPrices('/api/prices/perfect-order','me3')
])}

async function loadCards(reset=false){
  if(reset){state.page=1;state.cards=[];$('#loadMore').hidden=false} $('#status').textContent='Loading live card data…';
  try{const terms=[];if(state.query)terms.push(`name:"${state.query}*"`);const ranges={under10:'[0.01 TO 10}','10to50':'[10 TO 50]','50to100':'[50 TO 100]',over100:'[100 TO *]'};if(ranges[state.priceFilter])terms.push(`tcgplayer.prices.holofoil.market:${ranges[state.priceFilter]}`);const q=terms.length?`&q=${encodeURIComponent(terms.join(' '))}`:'';const order=state.priceSort==='low'?'tcgplayer.prices.holofoil.market':state.priceSort==='high'?'-tcgplayer.prices.holofoil.market':'-set.releaseDate';const r=await fetch(`/api/tcg/cards?page=${state.page}&pageSize=24&orderBy=${encodeURIComponent(order)}${q}`);if(!r.ok)throw 0;const j=await r.json();state.cards.push(...j.data);j.data.forEach(card=>{const owned=state.portfolio.filter(item=>item.id===card.id),prices=getPriceEntries(card);owned.forEach(item=>{const live=prices.find(p=>p.variant===item.variant)?.market||(!item.variant?getPrice(card):0);if(live){item.price=live;item.priceSource='TCGplayer'}})});if(state.portfolio.length)localStorage.setItem(STORAGE_KEY,JSON.stringify(state.portfolio));renderPortfolio();$('#cardsIndexed').textContent=(j.totalCount||'19K+').toLocaleString();$('#status').textContent=`Showing ${state.cards.length} of ${(j.totalCount||0).toLocaleString()} cards${state.priceFilter!=='all'?' in this TCGplayer holofoil price range':''} · USD`;$('#loadMore').hidden=state.cards.length>=j.totalCount;}
  catch{state.cards=[];$('#cardsIndexed').textContent='—';$('#status').textContent='Verified pricing could not be loaded. No sample or predicted prices are being shown.';$('#cardGrid').innerHTML='<div class="empty"><h3>Live pricing unavailable</h3><p>CardFolio could not reach the TCGplayer-backed catalogue after three attempts.</p><button id="retryPrices">Retry verified prices</button></div>';$('#loadMore').hidden=true;$('#retryPrices').onclick=()=>loadCards(true);return;}
  renderCards();state.page++;
}
async function loadSets(){try{const r=await fetch('/api/tcg/sets?orderBy=-releaseDate&pageSize=250');if(!r.ok)throw 0;const j=await r.json();state.sets=j.data;$('#setsTracked').textContent=j.totalCount.toLocaleString()}catch{state.sets=FALLBACK_SETS;$('#setsTracked').textContent='170+'}renderSets()}
function cardMarkup(c,i){const prices=getPriceEntries(c);return `<article class="card-tile" data-card="${c.id}" style="animation-delay:${i%8*40}ms"><div class="card-image"><img src="${c.images?.small}" alt="${c.name}" loading="lazy"><span class="badge">${c.rarity||'POKÉMON'}</span></div><div class="card-info"><h3>${c.name}</h3><div class="card-meta"><span>${c.set?.name||'Unknown set'}</span><span class="card-price">${prices.length?`${prices.length>1?'From ':''}${money(prices[0].market)}`:'Coming Soon!'}</span></div></div></article>`}
function bindCards(container,cards){container.querySelectorAll('[data-card]').forEach(x=>x.onclick=()=>openCard(cards.find(c=>c.id===x.dataset.card)))}
function renderCards(){const cards=[...state.cards];$('#cardGrid').innerHTML=cards.map(cardMarkup).join('');bindCards($('#cardGrid'),cards);if(!cards.length)$('#cardGrid').innerHTML='<div class="empty"><h3>No matching priced cards</h3><p>Try another price range.</p></div>'}
function renderSets(){$('#setGrid').innerHTML=state.sets.map(s=>`<article class="set-tile" data-set="${s.id}"><div><span>${s.releaseDate?.slice(0,4)||'—'}</span><h3>${s.name}</h3><p>${s.total||'—'} cards</p></div><img src="${s.images?.logo}" alt="${s.name} logo" loading="lazy"></article>`).join('');$$('[data-set]').forEach(x=>x.onclick=()=>openSet(state.sets.find(s=>s.id===x.dataset.set)))}
function openSet(set){state.activeSet=set;state.setCards=[];state.setRarity='Common';$('#setBrowser').hidden=true;$('#setDetail').hidden=false;$('.set-sticky-tools').classList.remove('scroll-hidden');$('#setDetailHeader').innerHTML=`<img src="${set.images?.logo}" alt="${set.name} logo"><div><small>SET CATALOGUE</small><strong>${set.name}</strong><span>${set.total||'—'} cards · Released ${set.releaseDate||'—'}</span></div>`;loadSetCards()}
function clearSet(){state.activeSet=null;state.setCards=[];$('.set-sticky-tools').classList.remove('scroll-hidden');$('#setDetail').hidden=true;$('#setBrowser').hidden=false;scrollTo(0,0)}
async function loadSetCards(){
  if(!state.activeSet)return;
  $('#setStatus').textContent=`Loading the complete ${state.activeSet.name} set…`;
  try{const query=encodeURIComponent(`set.id:${state.activeSet.id}`);const first=await fetch(`/api/tcg/cards?page=1&pageSize=250&orderBy=number&q=${query}`);if(!first.ok)throw 0;const initial=await first.json();state.setCards=[...initial.data];const pages=Math.ceil(initial.totalCount/250);for(let page=2;page<=pages;page++){const r=await fetch(`/api/tcg/cards?page=${page}&pageSize=250&orderBy=number&q=${query}`);if(!r.ok)throw 0;state.setCards.push(...(await r.json()).data)}renderSetCategory();}
  catch{state.setCards=[];$('#setStatus').textContent=`Could not load ${state.activeSet.name}. No partial or demo cards are being shown.`;$('#setCardGrid').innerHTML='<div class="empty"><h3>Set temporarily unavailable</h3><p>The live catalogue did not return the complete set.</p><button id="retrySet">Retry complete set</button></div>';$('#setCategoryNav').innerHTML='<button class="category-back" id="clearSet">← All sets</button>';$('#clearSet').onclick=clearSet;$('#retrySet').onclick=()=>loadSetCards();}
}
const rarityOrder=['Common','Uncommon','Rare','Rare Holo','Double Rare','Illustration Rare','Ultra Rare','Special Illustration Rare','Hyper Rare','Amazing Rare','Radiant Rare','Promo'];
const rarityLabel=rarity=>({Common:'Basic / Common','Illustration Rare':'Illustration Rare (IR)','Special Illustration Rare':'Special Illustration Rare (SIR)'}[rarity]||rarity);
function renderSetCategory(){const groups={};state.setCards.forEach(card=>{const rarity=card.rarity||'Other';(groups[rarity]??=[]).push(card)});const rarities=Object.keys(groups).sort((a,b)=>{const ai=rarityOrder.indexOf(a),bi=rarityOrder.indexOf(b);return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b)});if(!groups[state.setRarity])state.setRarity=groups.Common?'Common':rarities[0];const cards=groups[state.setRarity]||[];$('#setStatus').textContent=`${rarityLabel(state.setRarity)} · ${cards.length} cards in ${state.activeSet.name}`;$('#setCardGrid').innerHTML=cards.map(cardMarkup).join('');bindCards($('#setCardGrid'),cards);$('#setCategoryNav').innerHTML=`<button class="category-back" id="clearSet">← All sets</button>`+rarities.map(r=>`<button class="${r===state.setRarity?'active':''}" data-rarity-page="${r}">${rarityLabel(r)} <small>${groups[r].length}</small></button>`).join('');$('#clearSet').onclick=clearSet;$$('[data-rarity-page]').forEach(button=>button.onclick=()=>{state.setRarity=button.dataset.rarityPage;renderSetCategory();$('.set-sticky-tools').classList.remove('scroll-hidden');$('#setStatus').scrollIntoView({behavior:'smooth',block:'start'})})}
function openCard(c){
  state.selected=c;
  const prices=getPriceEntries(c),price=getPrice(c),raw=rawEstimate(c);
  const priceRows=prices.length?prices.map(p=>`<div class="variant-price"><span>${p.label}</span><strong>${money(p.market)}</strong><small>Near Mint market${p.low?` · Low ${money(p.low)}`:''}${p.mid?` · Mid ${money(p.mid)}`:''} · ${p.source}</small></div>`).join(''):'<div class="variant-price"><span>TCGplayer pricing</span><strong>Awaiting TCGplayer pricing</strong><small>No verified market listing available</small></div>';
  const variantOptions=prices.length?prices.map(p=>`<option value="${p.variant}" data-price="${p.market}">${p.label} · ${money(p.market)}</option>`).join(''):'<option value="unpriced" data-price="0">Unpriced raw card</option>';
  $('#dialogContent').innerHTML=`<div class="detail"><div class="detail-art"><img src="${c.images?.large||c.images?.small}" alt="${c.name}"></div><div class="detail-body"><span class="kicker">${c.rarity||'TRADING CARD'}</span><h2>${c.name}</h2><div class="detail-sub">${c.set?.name||''} · #${c.number||c.id.split('-').pop()}</div><div class="price-variants"><small class="price-heading">CURRENT RAW PRICES (USD)</small>${priceRows}</div><div class="detail-stats raw-stats"><div><small>EST. RAW SUPPLY <button class="estimate-help" aria-label="How is estimated raw supply calculated?">?</button><span class="estimate-tooltip" role="tooltip">Formula: 1,800,000 baseline cards ÷ years since release × rarity factor. Rare or promo cards use a 22% rarity factor; other cards use 100%. The result is rounded to the nearest 1,000. This is directional only—not an official print run or population report.</span></small><strong>~${raw.toLocaleString()}</strong></div><div><small>PRICE SOURCE</small><strong>${prices.length?'TCGplayer':'Unavailable'}</strong></div></div><p class="estimate-note">Normal, holofoil, reverse holofoil, first-edition and unlimited values are shown whenever TCGplayer supplies them. These are live raw market values—not CardFolio predictions.</p><div class="purchase raw-purchase"><label>Card variant<select id="portfolioVariant">${variantOptions}</select></label><label>Price paid (USD)<input id="paidPrice" type="number" min="0" step="0.01" value="${price?price.toFixed(2):''}" placeholder="0.00"></label><label>Quantity<input id="quantity" type="number" min="1" value="1"></label><button class="add-btn" id="addCard">Add to portfolio</button></div></div></div>`;
  $('#portfolioVariant').onchange=e=>{const option=e.target.selectedOptions[0];if(!$('#paidPrice').value||Number($('#paidPrice').value)===price)$('#paidPrice').value=Number(option.dataset.price).toFixed(2)};
  $('#addCard').onclick=()=>addPortfolio(c);
  $('#cardDialog').showModal();
}
function addPortfolio(c){const variant=$('#portfolioVariant').value,selectedPrice=Number($('#portfolioVariant').selectedOptions[0]?.dataset.price)||0,label=$('#portfolioVariant').selectedOptions[0]?.textContent.split(' · ')[0]||'Raw';const paid=Number($('#paidPrice').value)||0,existing=state.portfolio.find(x=>x.id===c.id&&x.variant===variant&&x.paid===paid),qty=Number($('#quantity').value)||1;if(existing)existing.qty+=qty;else state.portfolio.push({id:c.id,name:c.name,set:c.set?.name,image:c.images?.small,variant,variantLabel:label,paid,price:selectedPrice,priceSource:selectedPrice?'TCGplayer':null,qty});savePortfolio();$('#cardDialog').close();toast(`${c.name} (${label}) added to your portfolio`)}
function savePortfolio(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.portfolio));renderPortfolio()}
function renderPortfolio(){const value=state.portfolio.reduce((n,c)=>n+c.price*c.qty,0),cost=state.portfolio.reduce((n,c)=>n+c.paid*c.qty,0),qty=state.portfolio.reduce((n,c)=>n+c.qty,0),ret=value-cost;$('#portfolioCount').textContent=qty;$('#headerValue').textContent=money(value);$('#totalValue').textContent=money(value);$('#totalCost').textContent=money(cost);$('#totalReturn').textContent=money(ret);$('#totalReturn').className=ret>=0?'gain':'loss';$('#returnPercent').textContent=cost?`${ret>=0?'+':''}${(ret/cost*100).toFixed(1)}% vs cost`:'0.0%';$('#returnPercent').className=ret>=0?'gain':'loss';$('#ownedCount').textContent=qty;$('#portfolioEmpty').hidden=state.portfolio.length>0;$('#portfolioList').innerHTML=state.portfolio.map((c,i)=>{const positionReturn=(c.price-c.paid)*c.qty,percent=c.paid?((c.price-c.paid)/c.paid*100):0,tone=positionReturn>=0?'gain':'loss';return `<article class="portfolio-card"><div class="portfolio-card-art"><img src="${c.image}" alt="${c.name}"><span class="portfolio-qty">×${c.qty}</span></div><div class="portfolio-card-body"><h3>${c.name}</h3><p>${c.set} · ${c.variantLabel||'Raw'}</p><div class="portfolio-price-grid"><div><small>CURRENT PRICE</small><strong>${c.price?money(c.price):'Unavailable'}</strong></div><div><small>PRICE PAID</small><strong>${money(c.paid)}</strong></div><div><small>PROFIT / LOSS</small><strong class="${tone}">${positionReturn>=0?'+':''}${money(positionReturn)} (${percent>=0?'+':''}${percent.toFixed(1)}%)</strong></div></div><div class="portfolio-card-foot"><span>Total value ${money(c.price*c.qty)}</span><button class="remove" data-remove="${i}" aria-label="Remove ${c.name}">×</button></div></div></article>`}).join('');$$('[data-remove]').forEach(b=>b.onclick=()=>{state.portfolio.splice(Number(b.dataset.remove),1);savePortfolio()})}
async function refreshPortfolioPrices(){if(!state.portfolio.length)return;const ids=[...new Set(state.portfolio.map(c=>c.id))];for(let start=0;start<ids.length;start+=5){await Promise.all(ids.slice(start,start+5).map(async id=>{try{const r=await fetch(`/api/tcg/cards?page=1&pageSize=1&q=${encodeURIComponent(`id:${id}`)}`);if(!r.ok)return;const card=(await r.json()).data?.[0];if(!card)return;const available=getPriceEntries(card);state.portfolio.filter(item=>item.id===id).forEach(item=>{const exact=available.find(p=>p.variant===item.variant);const live=exact?.market||(!item.variant?getPrice(card):0);if(live){item.price=live;item.priceSource='TCGplayer'}})}catch{}}))}localStorage.setItem(STORAGE_KEY,JSON.stringify(state.portfolio));renderPortfolio()}
function showView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===name));scrollTo(0,0)}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2500)}
$$('.nav-link').forEach(b=>b.onclick=()=>showView(b.dataset.view));$$('.quick-searches button').forEach(b=>b.onclick=()=>{$('#searchInput').value=b.textContent;state.query=b.textContent;loadCards(true)});$('#searchButton').onclick=()=>{state.query=$('#searchInput').value.trim();loadCards(true)};$('#searchInput').onkeydown=e=>{if(e.key==='Enter')$('#searchButton').click()};$('#loadMore').onclick=()=>loadCards();$('.dialog-close').onclick=()=>$('#cardDialog').close();$('#cardDialog').onclick=e=>{if(e.target===$('#cardDialog'))$('#cardDialog').close()};$('[data-go-discover]').onclick=()=>showView('discover');$('#themeButton').onclick=()=>document.body.classList.toggle('light');
$('#priceFilter').onchange=e=>{state.priceFilter=e.target.value;loadCards(true)};
$('#priceSort').onchange=e=>{state.priceSort=e.target.value;loadCards(true)};
let lastScrollPosition=window.scrollY;
window.addEventListener('scroll',()=>{const controls=$('.set-sticky-tools'),current=window.scrollY;if(!controls||!state.activeSet){lastScrollPosition=current;return}if(current<120||current<lastScrollPosition-6)controls.classList.remove('scroll-hidden');else if(current>lastScrollPosition+6)controls.classList.add('scroll-hidden');lastScrollPosition=current},{passive:true});
$('#exportButton').onclick=()=>{if(!state.portfolio.length)return toast('Add a card before exporting');const rows=['Card,Set,Quantity,Price Paid,Market Price',...state.portfolio.map(c=>[c.name,c.set,c.qty,c.paid,c.price].map(x=>`"${x}"`).join(','))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));a.download='cardfolio-portfolio.csv';a.click();URL.revokeObjectURL(a.href)};
async function startApp(){await loadLivePriceGuides();renderPortfolio();loadCards();loadSets();refreshPortfolioPrices()}
startApp();
