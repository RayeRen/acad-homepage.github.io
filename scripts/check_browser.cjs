// Executed by the GitHub Actions build before deployment.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  fs.mkdirSync('ui-checks', {recursive:true});
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({viewport:{width,height:1000}});
    for (const route of ['/', '/research/', '/research/soil-transfer/', '/research/kaolin-stabilization/', '/research/water-infrastructure/', '/publications/', '/about/', '/cv/']) {
      await page.goto('http://127.0.0.1:4000'+route, {waitUntil:'networkidle'});
      const problems = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth+1,
        brokenImages: [...document.images].filter(i=>!i.complete || i.naturalWidth===0).map(i=>i.src),
        h1: document.querySelectorAll('h1').length
      }));
      if (problems.overflow || problems.brokenImages.length || problems.h1!==1) errors.push({width,route,...problems});
    }
    await page.goto('http://127.0.0.1:4000/', {waitUntil:'networkidle'});
    if(width===375) {
      await page.getByRole('button',{name:'Toggle navigation',exact:true}).click();
      await page.getByRole('link',{name:'Research',exact:true}).click();
      if (!page.url().endsWith('/research/')) errors.push({width,issue:'Mobile navigation failed'});
      await page.goto('http://127.0.0.1:4000/',{waitUntil:'networkidle'});
    }
    await page.screenshot({path:`ui-checks/home-${width}-light.png`,fullPage:true});
    // Cycle the native al-folio control to reach dark mode.
    if(width===375) await page.getByRole('button',{name:'Toggle navigation',exact:true}).click();
    for(let n=0;n<3;n++) {
      if(await page.locator('html').getAttribute('data-theme')==='dark') break;
      await page.getByRole('button',{name:'Change color theme'}).click();
    }
    if(await page.locator('html').getAttribute('data-theme')!=='dark') errors.push({width,issue:'Dark toggle failed'});
    if(width===375) await page.getByRole('button',{name:'Toggle navigation',exact:true}).click();
    await page.locator('body').evaluate(el => Promise.all(el.getAnimations({subtree:true}).map(a => a.finished.catch(()=>{}))));
    await page.screenshot({path:`ui-checks/home-${width}-dark.png`,fullPage:true});
    await page.reload({waitUntil:'networkidle'});
    if(await page.locator('html').getAttribute('data-theme')!=='dark') errors.push({width,issue:'Theme preference did not persist'});
    await page.close();
  }
  await browser.close();
  fs.writeFileSync('ui-checks/results.json',JSON.stringify({errors},null,2));
  if(errors.length) throw new Error(JSON.stringify(errors,null,2));
  console.log('PASS: eight pages at three widths; no overflow/broken images; mobile navigation; dark mode and persistence.');
})().catch(e=>{console.error(e);process.exit(1)});
