/* 기존 description 문자열을 화면에서만 항목별로 분리한다. */
window.PlaceDescription = (() => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function parse(value) {
    const doc = new DOMParser().parseFromString(String(value ?? '').replace(/<br\s*\/?>/gi, '\n'), 'text/html');
    doc.querySelectorAll('script,style').forEach(node => node.remove());
    const text = doc.body.textContent.replace(/\r/g, '').trim();
    const pattern = /(운영\s*일자|운영\s*시간|휴무일|입장료|시설\s*이용료|시설료|주소|상세\s*설명|문의\s*및\s*안내|정보\s*출처|확인일)\s*[:：]?\s*/g;
    const matches = [...text.matchAll(pattern)];
    const sections = [];
    if (matches.length && matches[0].index > 0) sections.push({ label: '안내', value: text.slice(0, matches[0].index).trim() });
    matches.forEach((match, index) => {
      const value = text.slice(match.index + match[0].length, matches[index + 1]?.index ?? text.length).trim();
      if (value) sections.push({ label: match[1].replace(/\s/g, ''), value });
    });
    if (!matches.length && text) sections.push({ label: '여행지 소개', value: text });
    const intro = sections.find(section => section.label === '상세설명' || section.label === '여행지 소개');
    let imageSrc = null;
    const rawSrc = doc.querySelector('img[src]')?.getAttribute('src');
    if (rawSrc) {
      try {
        const root = new URL('../images/', document.baseURI);
        const url = new URL(rawSrc, document.baseURI);
        const isLocalImage = url.origin === root.origin && url.pathname.startsWith(root.pathname);
        const isTourImage = url.protocol === 'https:' && url.hostname === 'tong.visitkorea.or.kr' && url.pathname.startsWith('/cms/resource/');
        if ((isLocalImage || isTourImage) && /\.(png|jpe?g|webp|gif|avif)$/i.test(url.pathname)) imageSrc = url.href;
      } catch {}
    }
    return { sections, imageSrc, summary: intro?.value.replace(/\s+/g, ' ') || '운영정보와 자세한 안내는 상세정보에서 확인하세요.' };
  }
  function formatValue(section) {
    let value = section.value;
    if (/입장료|시설/.test(section.label)) value = value.replace(/\s+(?=단체\s*\(|경로\s*\(|어린이\s*\[|장애인\s*경증|무료\s*대상|※)/g, '\n').replace(/\s+-\s+(?=[가-힣])/g, '\n• ');
    return escape(value);
  }
  function html(value, includeImage = false) {
    const data = parse(value);
    const image = includeImage && data.imageSrc ? `<img class="place-info-photo" src="${escape(data.imageSrc)}" alt="여행지 사진" loading="lazy">` : '';
    return image + '<dl class="place-info-fields">' + data.sections.map(section => `<div class="place-info-field"><dt>${section.label === '상세설명' ? '여행지 소개' : escape(section.label)}</dt><dd>${formatValue(section)}</dd></div>`).join('') + '</dl>';
  }
  return { parse, html };
})();

