const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const cache = path.join(root, 'data/tour-import-cache');
const source = JSON.parse(fs.readFileSync('C:/Users/KBU/Documents/카카오톡 받은 파일/tour.final.json', 'utf8')).filter(x => x.contenttypeid === 12);
const coursePath = path.join(root, 'data/tourCourses.json');
const normalize = s => String(s || '').replace(/\s/g, '');
const imageKey = s => String(s || '').replace(/^https?:/, '');
const details = fs.readdirSync(cache).filter(x => /^detail-.*\.json$/.test(x)).map(x => JSON.parse(fs.readFileSync(path.join(cache, x), 'utf8')));
const byName = new Map();
for (const d of details) { const key = normalize(d.title); if (!byName.has(key)) byName.set(key, []); byName.get(key).push(d); }
const existing = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const original = JSON.stringify(existing);
const existingNames = new Set(existing.flatMap(c => c.places.map(p => normalize(p.name))));
const regions = {'1':'서울특별시','2':'인천광역시','3':'대전광역시','4':'대구광역시','5':'전라도','6':'부산광역시','7':'울산광역시','8':'세종특별자치시','31':'경기도','32':'강원도','33':'충청도','34':'충청도','35':'경상도','36':'경상도','37':'전라도','38':'전라도','39':'제주특별자치도'};
const companions = ['혼자', '커플', '가족'];
const seasons = ['봄', '여름', '가을', '겨울'];
const added = [], skipped = [], unresolved = [], sources = [];
for (let i = 0; i < source.length; i++) {
  const item = source[i];
  if (existingNames.has(normalize(item.title))) { skipped.push({name:item.title,address:item.addr1,reason:'기존 여행지 이름과 중복'}); continue; }
  const candidates = byName.get(normalize(item.title)) || [];
  const addressTail = normalize(item.addr1).replace(/^[^시도]+(?:특별자치도|특별자치시|특별시|광역시|통합특별시|도)/, '');
  const scored = candidates.map(d => ({d, score: (d.images.some(img => imageKey(img) === imageKey(item.firstimage)) ? 10 : 0) + (normalize(d.address) === normalize(item.addr1) ? 10 : 0) + (addressTail && normalize(d.address).endsWith(addressTail) ? 5 : 0)})).sort((a,b) => b.score-a.score);
  if (!scored.length || scored[0].score === 0 || (scored.length > 1 && scored[0].score === scored[1].score)) { unresolved.push({name:item.title,address:item.addr1,candidates:candidates.map(d=>({url:d.url,address:d.address}))}); continue; }
  const d = scored[0].d;
  const fields = Object.fromEntries(Object.entries(d.fields).map(([k,v]) => [normalize(k), v]));
  const missing = '공개 안내 없음';
  const hours = fields['이용시간'] || missing;
  const closed = fields['쉬는날'] || missing;
  const admission = fields['입장료'] || fields['이용요금'] || missing;
  const facility = fields['시설이용료'] || fields['시설사용료'] || missing;
  // 짧은 소개 발췌만 사용하고 상세 원문은 출처로 안내한다.
  const words = d.intro.split(/\s+/).filter(Boolean);
  let intro = words.slice(0, 24).join(' ') + (words.length > 24 ? '…' : '');
  if (!intro) intro = `${item.title}은(는) ${item.addr1}에 위치한 관광지입니다.`;
  const image = /^https?:\/\/tong\.visitkorea\.or\.kr\/cms\/resource\/[\w/.-]+$/i.test(item.firstimage) ? item.firstimage.replace(/^http:/, 'https:') : '';
  const lines = [image ? `<span><img src='${image}'></span>` : '', `운영일자: ${closed === '연중무휴' ? '연중무휴' : '휴무일 안내 참고'}`, `운영시간: ${hours}`, `휴무일: ${closed}`, '', `입장료: ${admission}`, `시설 이용료: ${facility}`, '', `주소: ${item.addr1.trim()}`, '', `상세설명: ${intro}`];
  if (fields['문의및안내']) lines.push('', `문의 및 안내: ${fields['문의및안내']}`);
  lines.push('', `정보 출처: ${d.url}`, `확인일: ${d.checkedAt}`);
  added.push({region:regions[item.areacode] || item.addr1.split(' ')[0], companion:companions[i % 3], season:seasons[Math.floor(i / 3) % 4], title:`${item.title} 여행 코스`, places:[{name:item.title,description:lines.filter((s,j)=>s || j>0).join('\n')}]});
  sources.push({name:item.title,address:item.addr1,url:d.url,checkedAt:d.checkedAt,missingFields:['이용시간','쉬는날','입장료','시설이용료'].filter(k=>!fields[k]),classification:'동행자와 계절은 테스트용 임의 배정'});
}
const report = {inputTouristAttractions:source.length,existingCourses:existing.length,addedCourses:added.length,skipped,unresolved,finalCourses:existing.length+added.length,sources};
fs.writeFileSync(path.join(root,'data/tour-import-report.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({input:source.length,matched:added.length,skipped:skipped.length,unresolved:unresolved.length,unresolvedNames:unresolved.slice(0,15).map(x=>x.name)}));
if (process.argv.includes('--write')) {
  if (unresolved.length) throw new Error('미확인 관광지가 남아 있어 전체 반영을 중단합니다.');
  const backup=path.join(cache,'tourCourses.before-import.json');
  if(!fs.existsSync(backup)) fs.copyFileSync(coursePath,backup);
  // 기존 배열 앞부분을 원문 그대로 보존하며 뒤에 새 코스만 추가한다.
  const raw=fs.readFileSync(coursePath,'utf8');
  const end=raw.lastIndexOf(']');
  const insertion=added.map(c=>JSON.stringify(c,null,2)).join(',\n');
  const output=raw.slice(0,end).trimEnd()+(existing.length?',\n':'\n')+insertion+'\n'+raw.slice(end);
  const parsed=JSON.parse(output);
  if(JSON.stringify(parsed.slice(0,existing.length))!==original) throw new Error('기존 데이터 변경 감지');
  fs.writeFileSync(coursePath,output);
}
