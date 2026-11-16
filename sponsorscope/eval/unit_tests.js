const S=require('../engine.js');
const cases=[
["Please note that for this position, we are not able to consider candidates who currently or in the future will require visa sponsorship.","skip"],
["Candidates must be authorized to work in the United States without the need for current or future employer sponsorship.","skip"],
["Applicants must be legally authorized to work in the U.S. on a full-time basis.","ask"],
["Visa sponsorship is available for this position. 2+ years of experience in analytics. The base salary range is $95,000 - $120,000.","apply"],
["We are unable to sponsor or take over sponsorship of an employment visa at this time.","skip"],
["Must be a U.S. citizen due to government contract requirements.","skip"],
["Applicants are considered regardless of race, color, citizenship, national origin.","apply"],
["This role requires an active Secret security clearance.","skip"],
["Requirements: Master's degree, or its foreign degree equivalent, in Computer Science and three (3) years of experience in the job offered.","ask"],
["5+ years of experience in fraud investigations. Pay $110,640/yr - $136,456/yr","skip"],
["2-3 years of experience in the risk space. Our salary range: $75,900—$85,400 USD and $68,300—$76,900 USD","apply"],
["1 to 2+ years of compliance experience. Our compensation range for this role is: $63,100 - $78,900 in San Francisco and New York. Carta uses E-Verify in the United States for employment authorization.","skip"],
["OPT and STEM OPT candidates are welcome to apply. Sponsorship: Yes.","apply"],
["Sponsorship is not available for this role.","skip"],
["We will consider sponsorship for exceptional candidates.","apply"],
["This position does not offer H-1B sponsorship.","skip"],
["Fertility HRA (up to $10,000 per year). Compensation: $137,120 - $297,330. Minimum of 4 years of industry experience.","skip"],
["For nearly 20 years, we've built a marketplace. Salary: $40/hr - $50/hr","apply"],
];
let ok=0;for(const [t,want] of cases){const r=S.analyze(t);const pass=r.verdict===want;ok+=pass;if(!pass)console.log('FAIL',want,'got',r.verdict,'|',t.slice(0,80),r.findings.map(f=>f.code+':'+f.level))}
console.log(ok+'/'+cases.length);

// ---- years grace, role directions, locations, role families ----
const R=require('../roles.js'),L=require('../lca.js');
const more=[
  [S.analyze("Minimum of 4 years of industry experience.",{maxYears:3,yearsGrace:1}).verdict,"ask"],
  [S.analyze("Minimum of 5 years of industry experience.",{maxYears:3,yearsGrace:1}).verdict,"skip"],
  [S.analyze("Minimum of 4 years of industry experience.",{maxYears:3}).verdict,"skip"],
  [R.classify("GTM Engineer").id,"gtm"],[R.classify("FP&A Analyst, GTM").id,"finance"],[R.classify("Risk Strategy Analyst").id,"risk"],
  [R.classify("Strategy & Operations Associate").id,"stratops"],[R.classify("Senior Pricing Analyst").id,"pricing"],
  [R.classify("Forward Deployed Analyst").id,"ai"],[R.classify("Associate Product Manager").tier,1],[R.classify("Chief of Staff").tier,3],
  [R.classify("Software Engineer"),null],[R.classify("Chief of Staff",R.defaults()),null],
  [R.locClass("Seattle, San Francisco, New York City"),"nyc"],[R.locClass("Jersey City, NJ"),"nj"],[R.locClass("Remote - US"),"remote"],
  [R.locClass("Albany, NY"),"other"],[R.locClass(""),"unknown"],[R.locClass(["Austin, TX"],true),"remote"],
  [L.familyOf("Solutions Engineer"),"solutions"],[L.familyOf("Product StratOps"),"strategy"],[L.familyOf("Senior Software Engineer"),"eng"],
  [L.familyOf("Product Manager"),"product"],[L.norm("Stripe, LLC"),"STRIPE"],[L.norm("The Goldman Sachs Group, Inc."),"GOLDMAN SACHS"],
];
let ok2=0;more.forEach(([got,want],i)=>{const pass=got===want;ok2+=pass;if(!pass)console.log('FAIL #'+i,'want',want,'got',got)});
console.log(ok2+'/'+more.length);

// ---- phrasings first met on Workday boards, and the shared helpers ----
const C=require('../core.js');
const extra=[
  [S.analyze("Visa sponsorship is not being offered for this position.").verdict,"skip"],
  [S.analyze("Visa sponsorship is not currently available for this role.").verdict,"skip"],
  [S.analyze("This role is limited to persons with indefinite right to work in the United States.").verdict,"skip"],
  [S.analyze("Candidates must have unrestricted work authorization in the United States.").verdict,"skip"],
  [S.analyze("Visa sponsorship is available for this position.").sponsorship,"offered"],
  [S.analyze("Applicants must have the legal right to work in the United States.").verdict,"ask"],
  [S.analyze("Facilitate alignment where priorities are not naturally aligned, and escalate unresolved trade-offs for sponsor decision.").verdict,"apply"],
  [S.analyze("At this time, Capital One will not sponsor a new applicant for employment authorization for this position.").verdict,"skip"],
  [S.analyze("Compensation decisions depend on a wide range of factors, including but not limited to skill sets, experience and training, security clearances, licensure and certifications.").verdict,"apply"],
  [S.analyze("Successful applicants must hold an Active Top Secret Clearance.").verdict,"skip"],
  [S.analyze("The employer will provide the Social Security Administration (SSA) and, if necessary, the Department of Homeland Security (DHS) with information from each new employee's I-9 to confirm work authorization.").sponsorship,"silent"],
  [S.analyze("Visa sponsorship: We do sponsor visas!").sponsorship,"offered"],
  [C.excluded("Chief of Staff, Revenue"),false],[C.excluded("Staff Data Analyst"),true],[C.excluded("Director, Strategy"),true],
  [C.excluded("Strategy & Operations Associate"),false],[C.excluded("Product Strategy Intern"),true],[C.excluded("Assistant Vice President, Risk"),true],
  [C.excluded("Equity Trader - Execution & Data Analytics"),true],[C.excluded("Account Executive, Analytics"),true],[C.excluded("Partner Operations Manager"),false],[C.excluded("GTM Engineer"),false],
  [C.isUS({location:"London, United Kingdom"}),false],[C.isUS({location:"New York, NY"}),true],[C.isUS({location:"Pune",country:""}),false],
  [C.isUS({location:"Toronto",country:"us"}),true],[C.isUS({location:"3 Locations"}),true],
  [C.summarize("You know SQL and Python, build Tableau dashboards and run A/B tests. Hybrid, 3 days a week in the office.").skills.join(","),"SQL,Python,Tableau,A/B testing,Dashboards"],
  [C.summarize("Hybrid, 3 days a week in the office.").mode,"Hybrid"],[C.summarize("Bachelor's degree in a quantitative field.").degree,"Bachelor’s"],
  [C.summarize("We are a remote-first company.").mode,"Remote"],
  [C.normalize("smartrecruiters","Acme","Acme",{id:"7",name:"Pricing Analyst",releasedDate:"2026-11-16T10:00:00Z",location:{city:"New York",region:"NY",country:"us",remote:false,fullLocation:"New York, NY, United States"},jobAd:{sections:{jobDescription:{text:"<p>Own pricing.</p>"}}}}).text.trim(),"Own pricing."],
  [C.normalize("workday","Site","Acme",{key:"acme",base:"https://x/Site",list:{externalPath:"/job/NY/Analyst_R1",bulletFields:["R1"]},info:{title:"Analyst",jobReqId:"R1",location:"New York, NY",startDate:"2026-11-16",country:{descriptor:"United States of America"},jobDescription:"<p>Hi</p>"}}).id,"wd:acme:R1"],
];
let ok3=0;extra.forEach(([got,want],i)=>{const pass=got===want;ok3+=pass;if(!pass)console.log('FAIL extra #'+i,'want',want,'got',got)});
console.log(ok3+'/'+extra.length);
