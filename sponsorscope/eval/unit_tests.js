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
