// Company job boards that answered the public API on 2026-11-16.
// [ats, board slug, display name, selected by default, H-1B employer names when they differ from the brand]
// Inclusion says nothing about sponsorship; every result shows the company's H-1B filings.
window.SS_BOARDS = [
  { group: "Fintech & payments", items: [
    ["greenhouse", "affirm", "Affirm", true, ["=AFFIRM"]], ["greenhouse", "brex", "Brex", true], ["greenhouse", "chime", "Chime", true],
    ["greenhouse", "coinbase", "Coinbase", true], ["greenhouse", "robinhood", "Robinhood", true], ["greenhouse", "sofi", "SoFi", true, ["Social Finance", "SoFi Bank"]],
    ["greenhouse", "stripe", "Stripe", true], ["greenhouse", "mercury", "Mercury", true, ["Mercury Technologies"]], ["greenhouse", "carta", "Carta", true, ["eShares"]],
    ["greenhouse", "betterment", "Betterment", true], ["greenhouse", "upstart", "Upstart", true, ["Upstart Network"]], ["greenhouse", "oportun", "Oportun", false],
    ["ashby", "ramp", "Ramp", true], ["ashby", "plaid", "Plaid", true], ["ashby", "socure", "Socure", true],
    ["ashby", "sardine", "Sardine", false, ["SardineAI"]], ["ashby", "middesk", "Middesk", false], ["greenhouse", "alloy", "Alloy", false, ["Alloy Labs"]],
    ["greenhouse", "point72", "Point72", true], ["greenhouse", "gusto", "Gusto", true], ["greenhouse", "toast", "Toast", true],
    ["greenhouse", "justworks", "Justworks", true], ["greenhouse", "adyen", "Adyen", false], ["greenhouse", "gemini", "Gemini", false, ["Gemini Trust", "Gemini Space Station"]],
    ["greenhouse", "clearstreet", "Clear Street", false], ["greenhouse", "pagaya", "Pagaya", false], ["greenhouse", "riskified", "Riskified", false],
    ["greenhouse", "fireblocks", "Fireblocks", false], ["greenhouse", "novacredit", "Nova Credit", false], ["greenhouse", "lithic", "Lithic", false],
    ["greenhouse", "forter", "Forter", false], ["greenhouse", "payoneer", "Payoneer", false], ["ashby", "rogo", "Rogo", true, ["Rogo Technologies"]],
    ["ashby", "vise", "Vise", false, ["Vise AI"]], ["ashby", "titan", "Titan", false, ["Titan Global Capital Management"]], ["ashby", "paxos", "Paxos", false],
    ["ashby", "airwallex", "Airwallex", false], ["ashby", "lemonade", "Lemonade", false, ["=LEMONADE", "Lemonade Insurance"]], ["ashby", "rillet", "Rillet", false],
    ["ashby", "campfire", "Campfire", false, ["Campfire Software"]], ["ashby", "zip", "Zip", false, ["ZipHQ"]], ["ashby", "omnea", "Omnea", false],
    ["lever", "moonpay", "MoonPay", false]
  ]},
  { group: "Data, AI & software", items: [
    ["greenhouse", "datadog", "Datadog", true], ["greenhouse", "mongodb", "MongoDB", true], ["greenhouse", "elastic", "Elastic", false, ["Elasticsearch"]],
    ["greenhouse", "cloudflare", "Cloudflare", false], ["greenhouse", "gitlab", "GitLab", false], ["greenhouse", "okta", "Okta", false],
    ["greenhouse", "twilio", "Twilio", false], ["greenhouse", "asana", "Asana", true, ["=ASANA"]], ["greenhouse", "figma", "Figma", true],
    ["greenhouse", "dataiku", "Dataiku", true], ["greenhouse", "anaplan", "Anaplan", false], ["greenhouse", "mixpanel", "Mixpanel", true],
    ["greenhouse", "samsara", "Samsara", false, ["=SAMSARA"]], ["greenhouse", "databricks", "Databricks", false], ["greenhouse", "anthropic", "Anthropic", false],
    ["ashby", "openai", "OpenAI", false], ["ashby", "notion", "Notion", true], ["ashby", "perplexity", "Perplexity", false],
    ["ashby", "harvey", "Harvey", true, ["Harvey AI", "Counsel AI"]], ["ashby", "vanta", "Vanta", false], ["ashby", "hightouch", "Hightouch", true, ["Carry Technologies"]],
    ["greenhouse", "checkr", "Checkr", false], ["greenhouse", "lattice", "Lattice", false, ["=DEGREE"]],
    ["greenhouse", "scaleai", "Scale AI", false], ["greenhouse", "vercel", "Vercel", false], ["greenhouse", "alphasense", "AlphaSense", true],
    ["greenhouse", "sigmacomputing", "Sigma Computing", false], ["greenhouse", "snorkelai", "Snorkel AI", false], ["greenhouse", "celonis", "Celonis", false],
    ["greenhouse", "fivetran", "Fivetran", false], ["greenhouse", "intercom", "Intercom", false], ["greenhouse", "cockroachlabs", "Cockroach Labs", false],
    ["greenhouse", "cresta", "Cresta", false, ["Cresta Intelligence"]], ["greenhouse", "onetrust", "OneTrust", false], ["greenhouse", "6sense", "6sense", false, ["6sense Insights"]],
    ["greenhouse", "pendo", "Pendo", false, ["Pendo.io"]], ["greenhouse", "yext", "Yext", false], ["greenhouse", "movableink", "Movable Ink", false],
    ["ashby", "claylabs", "Clay", true, ["Clay Labs"]], ["ashby", "modal", "Modal", false, ["Modal Labs"]], ["ashby", "rilla", "Rilla", false, ["Rilla Technologies", "Rillavoice"]],
    ["ashby", "decagon", "Decagon", false, ["Decagon AI"]], ["ashby", "hex", "Hex", false, ["Hex Technologies"]], ["ashby", "snowflake", "Snowflake", false, ["=SNOWFLAKE", "Snowflake Computing"]],
    ["ashby", "watershed", "Watershed", false, ["Watershed Technology"]], ["ashby", "elevenlabs", "ElevenLabs", false, ["Eleven Labs", "ElevenLabs"]], ["ashby", "writer", "Writer", false, ["=WRITER"]],
    ["ashby", "baseten", "Baseten", false, ["Baseten Labs", "Baseten"]], ["ashby", "sierra", "Sierra", false, ["Sierra Technologies"]], ["ashby", "clickhouse", "ClickHouse", false],
    ["ashby", "cohere", "Cohere", false, ["=COHERE"]], ["ashby", "uipath", "UiPath", false], ["ashby", "handshake", "Handshake", false, ["Stryder"]],
    ["ashby", "attio", "Attio", false], ["ashby", "synthesia", "Synthesia", false], ["ashby", "mercor", "Mercor", false, ["Mercor.io", "Mercor"]],
    ["ashby", "amplitude", "Amplitude", false, ["=AMPLITUDE"]], ["ashby", "1password", "1Password", false, ["AgileBits", "1Password"]]
  ]},
  { group: "Consumer, marketplaces & ads", items: [
    ["greenhouse", "doordashusa", "DoorDash", true], ["greenhouse", "instacart", "Instacart", true, ["Maplebear"]], ["greenhouse", "lyft", "Lyft", true],
    ["greenhouse", "airbnb", "Airbnb", true], ["greenhouse", "pinterest", "Pinterest", true], ["greenhouse", "reddit", "Reddit", true],
    ["greenhouse", "duolingo", "Duolingo", true], ["greenhouse", "dropbox", "Dropbox", false], ["greenhouse", "klaviyo", "Klaviyo", true],
    ["greenhouse", "thetradedesk", "The Trade Desk", true], ["greenhouse", "pubmatic", "PubMatic", true], ["greenhouse", "braze", "Braze", false],
    ["greenhouse", "attentive", "Attentive", false, ["Attentive Mobile", "=ATTENTIVE"]], ["greenhouse", "ziprecruiter", "ZipRecruiter", false], ["greenhouse", "tripadvisor", "Tripadvisor", true],
    ["greenhouse", "seatgeek", "SeatGeek", true], ["greenhouse", "nextdoor", "Nextdoor", false], ["greenhouse", "roblox", "Roblox", false],
    ["greenhouse", "coursera", "Coursera", false], ["greenhouse", "udemy", "Udemy", false], ["greenhouse", "peloton", "Peloton", false],
    ["greenhouse", "faire", "Faire", false], ["greenhouse", "hellofresh", "HelloFresh", false, ["Grocery Delivery E-Services"]], ["greenhouse", "flexport", "Flexport", false],
    ["lever", "spotify", "Spotify", true], ["lever", "matchgroup", "Match Group", false, ["=MATCH GROUP AMERICAS", "=MATCH"]],
    ["greenhouse", "via", "Via", true, ["Via Transportation"]], ["greenhouse", "fanduel", "FanDuel", true, ["FanDuel", "Betfair Interactive"]],
    ["greenhouse", "squarespace", "Squarespace", false], ["greenhouse", "glossier", "Glossier", false], ["lever", "gopuff", "Gopuff", false, ["GoBrands", "Gopuff"]]
  ]},
  { group: "Health & research", items: [
    ["greenhouse", "oscar", "Oscar Health", true, ["Oscar Management", "Oscar Health"]], ["greenhouse", "zocdoc", "Zocdoc", true], ["greenhouse", "yipitdata", "YipitData", false, ["Yipit"]],
    ["lever", "veeva", "Veeva", false], ["lever", "palantir", "Palantir", false], ["lever", "outreach", "Outreach", false, ["=OUTREACH"]],
    ["greenhouse", "garnerhealth", "Garner Health", true], ["greenhouse", "mavenclinic", "Maven Clinic", false, ["Maven Clinic"]],
    ["ashby", "headway", "Headway", false, ["Therapymatch"]], ["ashby", "tennr", "Tennr", false], ["ashby", "candidhealth", "Candid Health", false],
    ["lever", "ro", "Ro", false, ["Roman Health"]]
  ]}
];
