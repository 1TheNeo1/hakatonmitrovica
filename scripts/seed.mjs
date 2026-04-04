/**
 * Seed script – fictive Serbian Latin users, companies, ideas,
 * forum posts, replies, tutorials and investor interests.
 *
 * Run:  node scripts/seed.mjs
 *
 * Idempotent: existing rows are skipped via INSERT OR IGNORE for users;
 * forum/idea/tutorial rows are deleted and re-inserted each run.
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH =
  process.env.DATABASE_PATH || join(__dirname, "..", "data", "mitrostart.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── helpers ───────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

function upsertUser(u) {
  db.prepare(
    `
    INSERT OR IGNORE INTO users
      (id, email, name, role, organization, investmentFocus,
       investmentMin, investmentMax, bio, linkedinUrl, phone, city, createdAt)
    VALUES
      (@id,@email,@name,@role,@organization,@investmentFocus,
       @investmentMin,@investmentMax,@bio,@linkedinUrl,@phone,@city,@createdAt)
  `,
  ).run(u);
  // return the actual id (could have been inserted previously)
  return db.prepare("SELECT id FROM users WHERE email = ?").get(u.email).id;
}

// ── 1. APPLICANT USERS ────────────────────────────────────────────────────────

const applicants = [
  {
    email: "marko.petrovic@svezeelokalno.rs",
    name: "Marko Petrović",
    role: "applicant",
    phone: "+381 63 112 3456",
    city: "Kosovska Mitrovica",
  },
  {
    email: "jelena.nikolic@technova.rs",
    name: "Jelena Nikolić",
    role: "applicant",
    phone: "+381 64 223 4567",
    city: "Kosovska Mitrovica",
  },
  {
    email: "stefan.jovanovic@zdravljefirst.rs",
    name: "Stefan Jovanović",
    role: "applicant",
    phone: "+381 65 334 5678",
    city: "Priština",
  },
  {
    email: "ana.milosevic@edufuture.rs",
    name: "Ana Milošević",
    role: "applicant",
    phone: "+381 66 445 6789",
    city: "Novi Sad",
  },
  {
    email: "nemanja.stojanovic@retrokafana.rs",
    name: "Nemanja Stojanović",
    role: "applicant",
    phone: "+381 63 556 7890",
    city: "Kosovska Mitrovica",
  },
  {
    email: "milica.djordjevic@greenservis.rs",
    name: "Milica Đorđević",
    role: "applicant",
    phone: "+381 64 667 8901",
    city: "Beograd",
  },
  {
    email: "vladimir.popovic@digitalshop.rs",
    name: "Vladimir Popović",
    role: "applicant",
    phone: "+381 65 778 9012",
    city: "Kosovska Mitrovica",
  },
];

// ── 2. INVESTOR USERS ─────────────────────────────────────────────────────────

const investors = [
  {
    email: "dragan.kostic@balkanskifond.rs",
    name: "Dragan Kostić",
    role: "investor",
    organization: "Balkanski Fond za Razvoj d.o.o.",
    investmentFocus: "food,tech,health",
    investmentMin: 5000,
    investmentMax: 50000,
    bio: "Iskusni investitor sa više od 15 godina u prehrambenoj industriji i tehnološkim startapovima na Balkanu. Fokus na skalabilne modele koji mogu da se šire na regionalnom tržištu.",
    linkedinUrl: "https://linkedin.com/in/dragankostic",
  },
  {
    email: "ivana.lazic@northcapital.rs",
    name: "Ivana Lazić",
    role: "investor",
    organization: "North Capital Partneri d.o.o.",
    investmentFocus: "tech,education,retail",
    investmentMin: 10000,
    investmentMax: 80000,
    bio: "Osnivač North Capital Partneri, fokus na edukativne tehnologije i digitalizaciju maloprodaje u Srbiji i regionu. Mentor u nekoliko startup inkubatora.",
    linkedinUrl: "https://linkedin.com/in/ivanalazic",
  },
  {
    email: "milos.avramovic@regionalniinvesticioni.rs",
    name: "Miloš Avramović",
    role: "investor",
    organization: "Regionalni Investicioni Centar a.d.",
    investmentFocus: "services,health,food",
    investmentMin: 3000,
    investmentMax: 30000,
    bio: "Direktor Regionalnog Investicionog Centra. Specijalizovan za podrsku malim i srednjim preduzecima u Kosovsko-Mitrovackom okrugu. Fokus na zdravstvene usluge i lokalni servisni sektor.",
    linkedinUrl: "https://linkedin.com/in/milosavramovic",
  },
];

// ── INSERT USERS ──────────────────────────────────────────────────────────────

console.log("Inserting users...");
const applicantIds = applicants.map((a) =>
  upsertUser({
    ...a,
    id: randomUUID(),
    organization: null,
    investmentFocus: null,
    investmentMin: null,
    investmentMax: null,
    bio: null,
    linkedinUrl: null,
    createdAt: now(),
  }),
);
const investorIds = investors.map((inv) =>
  upsertUser({
    ...inv,
    id: randomUUID(),
    phone: null,
    city: "Beograd",
    createdAt: now(),
  }),
);

console.log("  applicants:", applicantIds.length);
console.log("  investors :", investorIds.length);

// map by email for convenience
const [markoId, jelenaId, stefanId, anaId, nemanjaId, milicaId, vladimirId] =
  applicantIds;
const [draganId, ivanaId, milosId] = investorIds;

// ── 3. IDEAS (applications) ───────────────────────────────────────────────────

console.log("Inserting ideas...");
db.prepare(
  "DELETE FROM ideas WHERE applicantId IN (" +
    applicantIds.map(() => "?").join(",") +
    ")",
).run(...applicantIds);

const ideasData = [
  {
    applicantId: markoId,
    title: "Sveže & Lokalno",
    description:
      "Platforma za dostavu svežih lokalnih prehrambenih proizvoda direktno od malih farmera i proizvođača do domaćinstava u Kosovskoj Mitrovici i okolini. Cilj nam je skratiti lanac snabdevanja, smanjiti gubitak hrane i podržati lokalne poljoprivrednike.",
    category: "food",
    fundingNeeded: 18000,
    stage: "prototype",
    targetMarket:
      "Domaćinstva u Kosovskoj Mitrovici, 25–55 godina, srednja klasa",
    teamSize: 3,
    problemSolved:
      "Lokalni farmeri nemaju direktan kanal prodaje, a potrošači plaćaju visoke cene za uvoznu hranu niskog kvaliteta.",
    competitiveAdvantage:
      "Ekskluzivni ugovori sa 12 lokalnih farmera, mobilna aplikacija sa sledećim danom dostave i opcijom pretplate.",
    status: "reviewed",
  },
  {
    applicantId: jelenaId,
    title: "TechNova – Upravljanje Malim Biznisom",
    description:
      "SaaS platforma za mali biznis u Srbiji koja kombinuje ERP, CRM i računovodstvo u jednom alatu prilagođenom lokalnim poreskim propisima. Bez skupih implementacija – sve u oblaku za fiksnu mesečnu naknadu.",
    category: "tech",
    fundingNeeded: 35000,
    stage: "early-revenue",
    targetMarket: "Mala i srednja preduzeća u Srbiji, 1–50 zaposlenih",
    teamSize: 5,
    problemSolved:
      "Postojeći ERP sistemi su skupi, komplikovani i nisu prilagođeni srpskim poreskim i računovodstvenim standardima.",
    competitiveAdvantage:
      "Jedino rešenje sa ugrađenom integracijom za ePoreze i eFakturu, cena 4x niža od najbliže konkurencije.",
    status: "contacted",
  },
  {
    applicantId: stefanId,
    title: "ZdravljeFirst – Telemedicina za Zajednicu",
    description:
      "Platforma za telemedicinske konsultacije koja spaja pacijente iz manjih naselja sa specijalistima u većim gradovima. Fokus na preventivnu zdravstvenu zaštitu, praćenje hroničnih bolesti i mentalno zdravlje.",
    category: "health",
    fundingNeeded: 22000,
    stage: "concept",
    targetMarket:
      "Stanovnici manjih gradova i sela koji imaju otežan pristup specijalistima",
    teamSize: 4,
    problemSolved:
      "Pacijenti iz manjih mesta čekaju i do 6 meseci na specijalistički pregled, a putni troškovi su visoki.",
    competitiveAdvantage:
      "Partnerstvo sa 3 regionalne bolnice i mogućnost urgentnih video konsultacija unutar 2 sata.",
    status: "pending",
  },
  {
    applicantId: anaId,
    title: "EduFuture – Online Kursevi za Tržište Rada",
    description:
      "Platforma sa kratkim, praktičnim online kursevima usmerenim ka veštinama koje trenutno traže poslodavci u regionu: digitalni marketing, Python programiranje, grafički dizajn i preduzetništvo.",
    category: "education",
    fundingNeeded: 14000,
    stage: "early-revenue",
    targetMarket:
      "Mladi od 18–30 godina u Srbiji i regionu koji traže posao ili žele da unaprede veštine",
    teamSize: 6,
    problemSolved:
      "Jaz između formalnog obrazovanja i veština koje traže poslodavci. Nezaposlenost mladih u regionu je 35%.",
    competitiveAdvantage:
      "Kursevi na srpskom, cena 5x niža od stranih platformi, potvrda o uspešnom završetku kursa uz garanciju posredovanja u zaposlenju.",
    status: "reviewed",
  },
  {
    applicantId: nemanjaId,
    title: "RetroKafana – Kulturni Prostor",
    description:
      "Multifunkcionalni kulturni prostor koji kombinuje kafanu sa autentičnom srpskom atmosferom, pozornicu za živu muziku i malu galeriju lokalnih umetnika. Organizujemo radionice, izložbe i tematske večeri.",
    category: "entertainment",
    fundingNeeded: 28000,
    stage: "concept",
    targetMarket:
      "Mladi i odrasli 20–45 godina koji traže autentično kulturno iskustvo",
    teamSize: 4,
    problemSolved:
      "Nedostatak kvalitetnih kulturnih sadržaja i mesta za neformalno okupljanje u gradu.",
    competitiveAdvantage:
      "Jedinstven spoj ugostiteljstva i kulture, stalna baza od 200+ pratilaca na društvenim mrežama pre otvaranja.",
    status: "funded",
  },
  {
    applicantId: milicaId,
    title: "GreenServis – Eko Čišćenje",
    description:
      "Kompanija za ekološko čišćenje poslovnih i stambenih prostora isključivo uz upotrebu biorazgradivih sredstava i opreme za višekratnu upotrebu. Nudimo i korporativne pakete i godišnje pretplate.",
    category: "services",
    fundingNeeded: 9500,
    stage: "prototype",
    targetMarket:
      "Kancelarije, hoteli i privatna domaćinstva u Beogradu i okolini",
    teamSize: 3,
    problemSolved:
      "Konvencionalna sredstva za čišćenje su štetna za zdravlje i ekosistem. Raste tražnja za zelenim alternativama.",
    competitiveAdvantage:
      "Jedina eko-servisna firma u regionu sa ISO 14001 procedurama i transparentnim sastavom preparata.",
    status: "pending",
  },
  {
    applicantId: vladimirId,
    title: "DigitalShop – E-Commerce za Lokalne Prodavnice",
    description:
      "Platforma koja lokalnim maloprodajnim radnjama i zanatlijama u Mitrovici omogućava brzo pokretanje online prodaje-bez tehničkog znanja. Uključuje upravljanje zalihama, online plaćanja i integraciju sa kurirskim službama.",
    category: "retail",
    fundingNeeded: 16000,
    stage: "prototype",
    targetMarket: "Lokalni trgovci i zanatlije koji nemaju online prisustvo",
    teamSize: 4,
    problemSolved:
      "Više od 70% lokalnih prodavnica nema online kanal prodaje i gubi kupce koji preferiraju kupovinu na internetu.",
    competitiveAdvantage:
      "Setup za 24 sata, mesečna naknada od 29 EUR, besplatna obuka i podrška na srpskom jeziku.",
    status: "reviewed",
  },
];

const ideaIds = ideasData.map((idea) => {
  const id = randomUUID();
  db.prepare(
    `
    INSERT INTO ideas
      (id, applicantId, title, description, category, fundingNeeded, stage,
       targetMarket, teamSize, problemSolved, competitiveAdvantage, status, createdAt, updatedAt)
    VALUES
      (@id,@applicantId,@title,@description,@category,@fundingNeeded,@stage,
       @targetMarket,@teamSize,@problemSolved,@competitiveAdvantage,@status,@createdAt,@updatedAt)
  `,
  ).run({ ...idea, id, createdAt: now(), updatedAt: now() });
  return id;
});
console.log("  ideas:", ideaIds.length);

const [
  svezeLokId,
  techNovaId,
  zdravljeId,
  eduFutId,
  retroId,
  greenId,
  digitalId,
] = ideaIds;

// ── 4. INVESTOR INTERESTS ─────────────────────────────────────────────────────

console.log("Inserting investor interests...");
db.prepare(
  "DELETE FROM investor_interests WHERE investorId IN (" +
    investorIds.map(() => "?").join(",") +
    ")",
).run(...investorIds);

const interests = [
  // Dragan – hrana, tech, zdravlje
  {
    investorId: draganId,
    ideaId: svezeLokId,
    note: "Odličan koncept. Vidim potencijal za skaliranje na Beograd i Novi Sad u roku od 2 godine. Zainteresovan sam za detaljniji finansijski plan.",
  },
  {
    investorId: draganId,
    ideaId: zdravljeId,
    note: "Telemedicina je prioritet. Hajde da zakažemo sastanak sledeće nedelje.",
  },
  {
    investorId: draganId,
    ideaId: techNovaId,
    note: "Impresivna rast prihoda. Koji je MRR trenutno?",
  },
  // Ivana – tech, edukacija, retail
  {
    investorId: ivanaId,
    ideaId: techNovaId,
    note: "Tačno rešenje koje smo tražili za portfolio. Pošalji nam pitch deck.",
  },
  {
    investorId: ivanaId,
    ideaId: eduFutId,
    note: "EduTech prostor me jako zanima. Kolika je stopa završetka kurseva?",
  },
  {
    investorId: ivanaId,
    ideaId: digitalId,
    note: "Lokalni commerce je perspektivan. Hajde da razgovaramo o uslovima.",
  },
  // Miloš – usluge, zdravlje, hrana
  {
    investorId: milosId,
    ideaId: greenId,
    note: "Eko segment raste 20% godišnje. Zainteresovan za seed rundu.",
  },
  {
    investorId: milosId,
    ideaId: svezeLokId,
    note: "Farming direktna prodaja – podržavamo ovaj model. Kontaktirali smo slične projekte u BIH.",
  },
  {
    investorId: milosId,
    ideaId: zdravljeId,
    note: "Važan socijalni uticaj. Možemo pomoći sa partnerstvima u zdravstvenom sistemu.",
  },
];

interests.forEach((i) =>
  db
    .prepare(
      `
    INSERT OR IGNORE INTO investor_interests (id, investorId, ideaId, note, createdAt)
    VALUES (@id, @investorId, @ideaId, @note, @createdAt)
  `,
    )
    .run({ ...i, id: randomUUID(), createdAt: now() }),
);
console.log("  interests:", interests.length);

// ── 5. FORUM POSTS & REPLIES ──────────────────────────────────────────────────

console.log("Inserting forum posts...");
// clean existing seeded forum data by these authors
const allUserIds = [...applicantIds, ...investorIds];
db.prepare(
  `DELETE FROM forum_posts WHERE authorId IN (${allUserIds.map(() => "?").join(",")})`,
).run(...allUserIds);

const postDefs = [
  // --- PITANJA ---
  {
    authorId: markoId,
    title: "Kako da nađem lokalne farmere zainteresovane za saradnju?",
    content: `Zdravo svima! Pokrenuo sam projekt dostave lokalnih prehrambenih proizvoda – Sveže & Lokalno. Imam ideju, imam tim, ali mi je najteži deo kako doći do samih farmera i ubediti ih da saradjuju na ovom modelu.\n\nDa li neko ima iskustvo sa direktnim aranžmanima sa malim gazdinstvima u Kosovsko-Mitrovačkom okrugu? Postoji li neka asocijacija ili zadruga kojoj bi trebalo da se obratim?\n\nSvaki savet je dobrodošao!`,
    category: "pitanje",
  },
  {
    authorId: jelenaId,
    title: "Koji cloud provider preporučujete za SaaS startup u Srbiji?",
    content: `Pravimo B2B SaaS platformu za upravljanje malim biznisom (ERP + CRM) i znamo da je izbor cloud infrastrukture kritičan za početnu fazu.\n\nRazmišljamo između AWS (Frankfurt region), Hetzner i DigitalOcean. Pored cene, važno nam je i pitanje GDPR usklađenosti i latencije ka korisnicima u Srbiji.\n\nKakvo je vaše iskustvo?`,
    category: "pitanje",
  },
  {
    authorId: stefanId,
    title: "Koja regulativa važi za telemedicinske usluge u Srbiji?",
    content: `Razvijamo platformu za telemedicinu i naišli smo na nejasnoće oko pravnog okvira.\n\nKonkretno: da li lekar koji obavlja video konsultaciju mora biti registrovan u opštini gde je pacijent? Kakve dozvole su potrebne od Ministarstva zdravlja? Da li postoji razlika između "konsultacije" i "dijagnoze" u zakonskom smislu?\n\nAko ima neko od vas ko je prošao kroz ovaj proces – bili bismo eternalno zahvalni za smernice.`,
    category: "pitanje",
  },
  {
    authorId: vladimirId,
    title: "Koji payment gateway radi dobro za srpske kartice?",
    content: `Gradimo e-commerce platformu za lokalne prodavnice i trebamo integraciju za online plaćanja. Sve domaće banke imaju rešenja ali nisu ista ni po ceni ni po iskustvu integracije.\n\nKoristite li Payten (Asseco), Nestpay, Monri ili nešto treće? Kakve su naknade i kakva su iskustva sa podrškom? Važno nam je i da radi sa Visa/Mastercard/DinaCard.`,
    category: "pitanje",
  },
  // --- DISKUSIJE ---
  {
    authorId: draganId,
    title: "Da li je Kosovska Mitrovica dobro mesto za startap ekosistem?",
    content: `Kao investitor koji prati region, primetio sam da se sve više mladih preduzetnika iz Mitrovice javlja sa zanimljivim idejama.\n\nMoje pitanje za zajednicu: šta su realne prednosti i nedostaci pokretanja biznisa baš ovde? Mislim konkretno na pristup talentima, infrastrukturu, lokalnu kupovnu moć i potencijal za skaliranje.\n\nOtvorena diskusija – čujem sve perspektive.`,
    category: "diskusija",
  },
  {
    authorId: anaId,
    title: "Iskustva sa validacijom ideje pre traženja investicije",
    content: `Pre nego što smo pošli investitorima, napravili smo landing page i prikupili 340 email adresa za listu čekanja za EduFuture. To nam je otvorilo vrata razgovora.\n\nAli pre toga smo napravili 3 greške koje su nas koštale 2 meseca:\n1. Pretpostavili smo šta korisnici žele bez ijednog intervjua\n2. Gradili smo feature pre nego što smo potvrdili problem\n3. Fokusirali se na tehnologiju umesto na prodaju\n\nKakva su vaša iskustva sa validacijom? Koje metode su vam funkcionisale?`,
    category: "diskusija",
  },
  {
    authorId: nemanjaId,
    title:
      "Finansiranje kroz kulturu – zaboravljena kategorija za investitore?",
    content: `Primetio sam da kada pričam sa investitorima o RetroKafani, odmah dobijam "to nije skalabilno". Ali kultura i zabava su ogromna industrija.\n\nMySQL podatak: kafane i kulturni prostori u Srbiji obrću godišnje oko 800M EUR, a startup investicija u taj sektor je gotovo nula.\n\nDa li je to zato što investitori ne razumeju model, ili zato što model zaista teže skalira? Razgovor otvoren.`,
    category: "diskusija",
  },
  // --- RESURSI ---
  {
    authorId: ivanaId,
    title:
      "Vodič: Kako pripremiti pitch deck koji privlači investitore na Balkanu",
    content: `Pregledala sam na stotine pitch dekova u posednjih 5 godina. Evo šta razlikuje dobre od loših:\n\n**Struktura koya radi:**\n1. Problem – 1 slajd, konkretni podaci\n2. Rešenje – 1-2 slajda, ne ulazi u tehničke detalje\n3. Tržište – TAM/SAM/SOM sa lokalnim podacima, ne globalnim\n4. Poslovni model – kako zarađujete, sada\n5. Traction – broj korisnika, prihod, rast\n6. Tim – ko ste i zašto baš vi\n7. Finansije – 18-mesečna projekcija, breakeven tačka\n8. Šta tražite – konkretan iznos i za šta\n\n**Najčešće greške:**\n- Previše teksta po slajdu\n- Tržišne projekcije "odozgo prema dole" bez osnova\n- Nema price za testiranje ideje\n\nPitajte ako imate pitanja!`,
    category: "resurs",
  },
  {
    authorId: milosId,
    title: "Lista grantova i podsticaja za preduzetnike u 2026. godini",
    content: `Ažurirana lista za 2026. – proverite rokove:\n\n**Republički nivo:**\n- Fond za razvoj RS – krediti od 1M do 10M RSD, kamatna stopa 1%/god (rok: 31. jul)\n- USAID BizEko program – grantovi do 20.000 EUR za zelene biznise (rok: 15. jun)\n- Ministarstvo privrede – subvencije za zapošljavanje, do 4.000 EUR po radnom mestu\n\n**Lokalni nivo (Mitrovica i okrug):**\n- Opštinski fond za razvoj preduzetništva – grantovi do 500.000 RSD\n- EU IPA fondovi – otvoreni pozivi za ruralni razvoj\n\n**Za startape:**\n- Serbia Innovates – akcelerator + 15.000 EUR seed grant\n- Digitalna Srbija – sufinansiranje digitalizacije MSP do 50%\n\nPovezaću sve sa zvaničnim linkovima u narednom postu.`,
    category: "resurs",
  },
  // --- OBJAVE ---
  {
    authorId: nemanjaId,
    title: "RetroKafana dobila prvu investiciju – hvala MitroStart zajednici!",
    content: `Dragi prijatelji,\n\nSa iskrenim uzbuđenjem objavljujem da je RetroKafana oficijalno dobila seed investiciju i da radovi na prostoru počinju sledećeg meseca!\n\nOvo ne bi bilo moguće bez MitroStart platforme i sjajnih investitora koji su prepoznali potencijal kulturnih projekata. Posebno hvala timu na podršci i svakom članu zajednice koji je komentarisao, delio i bodrio.\n\nOtvaramo za Đurđevdan – pratite nas za detalje! 🎶`,
    category: "objava",
  },
];

const insertPost = db.prepare(`
  INSERT INTO forum_posts (id, authorId, title, content, category, replyCount, createdAt, updatedAt)
  VALUES (@id, @authorId, @title, @content, @category, 0, @createdAt, @updatedAt)
`);

const postIds = postDefs.map((p) => {
  const id = randomUUID();
  insertPost.run({ ...p, id, createdAt: now(), updatedAt: now() });
  return id;
});
console.log("  posts:", postIds.length);

const [
  farmerPostId,
  cloudPostId,
  telemedPostId,
  paymentPostId,
  mitroPostId,
  validacijaPostId,
  kulturaPostId,
  pitchPostId,
  grantPostId,
  retroObjavaId,
] = postIds;

// ── 6. FORUM REPLIES ──────────────────────────────────────────────────────────

console.log("Inserting forum replies...");

const replyDefs = [
  // farmer post
  {
    postId: farmerPostId,
    authorId: milosId,
    content:
      "Preporučujem da se obratite Zadruzi 'Severnjak' u Zubinom Potoku – oni agregiraju male farmere i otvoreni su za inovativne modele prodaje. Kontakt mogu da dam privatno.",
  },
  {
    postId: farmerPostId,
    authorId: milicaId,
    content:
      "Mi smo u GreenServisu naišli na sličan problem kada smo tražili dobavljače eko preparata. Najefikasnije je otići directno na pijacu i razgovarati sa prodavcima – ponudi im bolju cenu od otkupljivača i pristanak je brz.",
  },
  {
    postId: farmerPostId,
    authorId: anaId,
    content:
      "Na Agrobiznisportal.rs postoje liste registrovanih gazdinstava po regionima. Neko od kolega je uspešno kontaktirao farmere iz te baze.",
  },
  // cloud post
  {
    postId: cloudPostId,
    authorId: vladimirId,
    content:
      "Koristimo Hetzner (Nürnberg) za DigitalShop – latencija ka Srbiji je 15-20ms što je sasvim okej. Cena je daleko najpovoljnija. Jedini minus je da nema managed baze kao AWS RDS, ali render.com ga lepo dopunjuje.",
  },
  {
    postId: cloudPostId,
    authorId: jelenaId,
    content:
      "Update: Odlučili smo se za AWS Frankfurt sa reserved instancama – godišnja ušteda 40% vs on-demand. Za GDPR smo angažovali advokata koji je proverio DPA ugovor sa Amazonom. Može da se uradi.",
  },
  {
    postId: cloudPostId,
    authorId: draganId,
    content:
      "Sa investitorske strane: izbor infrastrukture nije toliko bitan u ranoj fazi – bitniji je MRR i churn. Fokusirajte se na validaciju, infrastrukturu možete promijeniti kada imate 100 plaćenih korisnika.",
  },
  // telemed post
  {
    postId: telemedPostId,
    authorId: milosId,
    content:
      "Razgovrao sam sa Ministarstvom zdravlja prošle godine po sličnom pitanju. Ključno: lekar mora biti licenciran od Lekarske komore Srbije, a konsultacija se evidentira kao 'zdravstveni savet' a ne 'pregled'. To izbegava mnoge regulatorne komplikacije.",
  },
  {
    postId: telemedPostId,
    authorId: draganId,
    content:
      "Postoji presuda iz 2024. koja je razjasnila status video konsultacija. Ako imate advokata, neka pogleda 'Pravilnik o načinu i postupku ostvarivanja prava iz obaveznog zdravstvenog osiguranja', član 45b. Tu je sve.",
  },
  // payment post
  {
    postId: paymentPostId,
    authorId: jelenaId,
    content:
      "Payten (ex-Asseco) je naš izbor za TechNova – njihov tim za podršku je odličan i integracija je dobro dokumentovana. Naknada: 1.5% + 5 din po transakciji. Pristojno za B2B SaaS.",
  },
  {
    postId: paymentPostId,
    authorId: vladimirId,
    content:
      "Testirali smo i Monri – bolji UX na checkout stranici i podržava Apple Pay / Google Pay. Za e-commerce gde su kupci mlađi, to može podići konverziju 15-20%. Cena slična Payten-u.",
  },
  {
    postId: paymentPostId,
    authorId: markoId,
    content:
      "Zanima me i za dostave – da li neko ima iskustvo sa CoD (plaćanje pouzećem) integracija? Kod nas je ciljni korisnik često stariji i ne koristi kartice.",
  },
  // mitro diskusija
  {
    postId: mitroPostId,
    authorId: anaId,
    content:
      "Prednosti koje vidim: niski troškovi zakupa u poređenju sa Beogradom, lojalna lokalna zajednica, blizina Kosova i Metohije kao tržišta. Nedostaci: manji talent pool, sporiji internet u nekim delovima. Ali za remote-friendly startape, ovo je odlično mesto.",
  },
  {
    postId: mitroPostId,
    authorId: nemanjaId,
    content:
      "Kultura i kohezija zajednice su prednost o kojoj se retko govori. Ovde svi sebe poznaju i word-of-mouth marketing funkcioniše neverovatno brzo. RetroKafana je u prvoj nedelji izgradila 200+ pratilaca samo usmenom preporukom.",
  },
  {
    postId: mitroPostId,
    authorId: ivanaId,
    content:
      "Slažem se sa obe prethodne tačke. Kao investitor gledam i na risk diversifikaciju – startapi van Beograda su manje izloženi 'hype ciklusima' i tipično imaju zdraviji unit economics.",
  },
  // validacija diskusija
  {
    postId: validacijaPostId,
    authorId: stefanId,
    content:
      "Mi u ZdravljeFirst smo za validaciju koristili landing page + Google Forms anketu od 50 pitanja. Odgovori 312 pacijenata su nam pokazali da 78% ne bi problema sa video konsultacijom umesto putovanja do specijalista. To je bila zelena svetla za dalje.",
  },
  {
    postId: validacijaPostId,
    authorId: draganId,
    content:
      "Iz investitorske perspektive: najvrednija validacija je plaćeni korisnik. Čak i simboličnih 10 EUR mes. Puno više vredi od 1000 potpisanih email adresa. Ako korisnik ne da karticu, možda problem nije dovoljno bolan.",
  },
  // kultura diskusija
  {
    postId: kulturaPostId,
    authorId: ivanaId,
    content:
      "Slažem se da je sektor nedovoljno zastupljen u startup portfolijima. Problem je predvidivost prihoda – investitori vole recurring revenue. Ako RetroKafana može da napravi pretplatnički model (membership klub), razgovor postaje lakši.",
  },
  {
    postId: kulturaPostId,
    authorId: milosId,
    content:
      "U EU postoje specijalizovani kulturni fondovi (Creative Europe, MEDIA) koji ne traže skalabilnost po tech-startup standardima. Preporučujem da paralelno aplikujete i tamo – kombinacija grant + equity može biti rešenje.",
  },
  // pitch resurs
  {
    postId: pitchPostId,
    authorId: jelenaId,
    content:
      "Odličan vodič! Jedino bih dodala: investitori na Balkanu često pitaju o exit strategiji ranije nego na Zapadu. Warto imati odgovor na 'kako se planiraš izaći iz biznisa za 5-7 godina' čak i u seed fazi.",
  },
  {
    postId: pitchPostId,
    authorId: markoId,
    content:
      "Da li postoji template koji preporučujete? Ili primer anonimizovanog pitch decka koji je uspeo?",
  },
  {
    postId: pitchPostId,
    authorId: ivanaId,
    content:
      "@Marko – mogu da podelim anonimizovane primere iz našeg portfolija privatno. Pošalji mi poruku ovde na platformi.",
  },
  // grant resurs
  {
    postId: grantPostId,
    authorId: anaId,
    content:
      "Hvala na listi! Za Serbia Innovates – znam da primaju aplikacije 2x godišnje i da je rok sledeće kolo jul 2026. Konkurencija je jaka ali tražite obavezno preporuku od mentora, značajno podiže šanse.",
  },
  {
    postId: grantPostId,
    authorId: milicaId,
    content:
      "USAID BizEko program je sjajan za eko projekte poput GreenServis! Da li je možda rok bio pomeren? Nisam našla potvrdu na sajtu.",
  },
  {
    postId: grantPostId,
    authorId: milosId,
    content:
      "@Milica – rok je zvanično 15. jun prema poslednjem biltenu. Ako ne nađeš na sajtu, kontaktiraj direktno USAID kancelariju u Beogradu – odgowaraju brzo.",
  },
  // retro objava
  {
    postId: retroObjavaId,
    authorId: draganId,
    content:
      "Čestitke Nemanja! Ovo je sjajan primer kako kulturni projekat može pronaći investitora koji razume vrednost izvan brojeva. Pratićemo rast.",
  },
  {
    postId: retroObjavaId,
    authorId: jelenaId,
    content:
      "Srećno! Ako ikad budete tražili rešenje za POS i upravljanje rezervacijama, TechNova ima modul za ugostiteljstvo. 😄",
  },
  {
    postId: retroObjavaId,
    authorId: anaId,
    content:
      "Divno! Mitrovici treba više ovakvih mesta. Definitivno dolazimo na otvaranje.",
  },
];

const insertReply = db.prepare(`
  INSERT INTO forum_replies (id, postId, authorId, content, createdAt)
  VALUES (@id, @postId, @authorId, @content, @createdAt)
`);
const updateReplyCount = db.prepare(`
  UPDATE forum_posts SET replyCount = replyCount + 1, updatedAt = @updatedAt WHERE id = @id
`);

const insertReplyTx = db.transaction((reply) => {
  insertReply.run({ ...reply, id: randomUUID(), createdAt: now() });
  updateReplyCount.run({ id: reply.postId, updatedAt: now() });
});

replyDefs.forEach((r) => insertReplyTx(r));
console.log("  replies:", replyDefs.length);

// ── 7. TUTORIALS ──────────────────────────────────────────────────────────────

console.log("Inserting tutorials...");
db.prepare(
  `DELETE FROM tutorials WHERE authorId IN (${allUserIds.map(() => "?").join(",")})`,
).run(...allUserIds);

const tutorials = [
  {
    authorId: ivanaId,
    title: "Kako napisati poslovni plan koji privlači investitore",
    summary:
      "Korak-po-korak vodič za izradu poslovnog plana prilagođenog srpskom tržištu – od analize tržišta do finansijskih projekcija.",
    body: `# Kako napisati poslovni plan koji privlači investitore

## Zašto je poslovni plan važan?

Mnogi preduzetnici smatraju da je poslovni plan samo formalnost. U stvarnosti, proces pisanja vas tera da kritički razmišljate o svakom aspektu biznisa.

## Struktura dobrog poslovnog plana

### 1. Izvršni sažetak (maks. 1 stranica)
Napišite ga poslednji. Treba da odgovori: šta radite, ko su kupci, koliko tražite i zašto ste vi pravi tim.

### 2. Opis problema i rešenja
Budite konkretni. "Dostavljamo svežu hranu" nije problem. "U Mitrovici 60% domaćinstava kupuje uvoznu hranu jer nema direktan kanal sa lokalnim farmama" – to je problem.

### 3. Analiza tržišta
Koristite srpske izvore: RZS (Republički zavod za statistiku), Privredna komora Srbije, regionalne razvojne agencije.

### 4. Poslovni model
Odgovorite jasno: ko plaća, koliko, i koliko često?

### 5. Finansijske projekcije
18 meseci obavezno, 3 godine poželjno. Budite konzervativni – investitori to cene.

## Najčešće greške

- Precenjivanje tržišta ("samo 1% tržišta je 50M EUR")
- Potcenjivanje troškova akvizicije korisnika
- Ignorisanje lokalne konkurencije

## Resursi

- Šablon poslovnog plana: Privredna komora Srbije
- Finansijski model: dostupan na zahtev u MitroStart zajednici`,
    type: "blog",
    category: "preduzetništvo",
    videoUrl: null,
    resourceUrl: null,
  },
  {
    authorId: milosId,
    title: "Poreski podsticaji za preduzetnike u Srbiji – Šta ne znate?",
    summary:
      "Pregled svih aktualnih poreskih olakšica, subvencija i oslobađanja za starape i mala preduzeća u Srbiji 2026.",
    body: `# Poreski podsticaji za preduzetnike u Srbiji 2026.

## Paušalno oporezivanje – za koga važi?

Preduzetnici sa godišnjim prometom ispod 6M RSD mogu koristiti paušalno oporezivanje. To znači fiksni porez bez obzira na prihod – idealno za početnu fazu.

## Olakšice za novoosnovane firme

- **Oslobođenje od PDV** u prvoj godini (promet ispod 8M RSD threshold)
- **Subvencija za zapošljavanje** – do 4.000 EUR po novozaposlenom licu na evidence NSZ

## R&D poreski kredit

Firme koje ulažu u istraživanje i razvoj mogu odbiti **200% troškova** od poreske osnovice. Ovo je ogroman podsticaj za tech startape koji investiraju u razvoj softvera.

## Slobodne zone

Kompanije u slobodnim ekonomskim zonama (Subotica, Kragujevac...) imaju oslobođenje od carina i povoljnije poreske stope.

## Na šta paziti

- Uredna dokumentacija je ključna za sve olakšice
- Poreski savetnik se isplati od prvog dana
- Rokovi za prijavu olakšica su strogi – zakašnjenje = gubitak prava`,
    type: "resource",
    category: "finansije",
    videoUrl: null,
    resourceUrl:
      "https://www.purs.gov.rs/sr/fizicka-lica/porez-na-dohodak-gradjana/prihodi-od-samostalne-delatnosti.html",
  },
  {
    authorId: ivanaId,
    title: "MVP u 30 dana: Brza validacija startup ideje bez velikog budžeta",
    summary:
      "Praktičan vodič za izgradnju minimalnog održivog proizvoda koji potvrđuje ili opovrgava vašu hipotezu uz minimalne troškove.",
    body: `# MVP u 30 dana

## Šta je MVP i šta nije?

MVP (Minimum Viable Product) nije "loš proizvod" – to je najjednostavnija verzija koja vam daje odgovor na najvažnije pitanje: zeli li neko to što gradite?

## 30-dnevni plan

### Nedelja 1 – Problem
- Sprovesti 20 intervjua sa potencijalnim korisnicima
- Zapisati dословne citate, ne interpretacije
- Definisati jednu hipotezu

### Nedelja 2 – Rešenje
- Napraviti paper prototype ili Figma wireframe
- Testirati sa 10 osoba
- Iterirati

### Nedelja 3 – Gradnja
- No-code alati: Bubble, Webflow, Glide (za mobilne)
- Fokus na jedan ključni user flow
- Bez lepih interfejsa – funkcija je važna

### Nedelja 4 – Merenje
- 50 prvih korisnika (plaćeno ili besplatno)
- Meriti: retention, NPS, konverzija u plaćanje

## Alati za srpsko tržište

- **Komunikacija**: Viber (dominantan kanal u Srbiji!)
- **Plaćanja**: Stripe (testno), Payten (produkcija)
- **Analitika**: Hotjar + GA4 (besplatno do određenog volumena)`,
    type: "blog",
    category: "startap",
    videoUrl: null,
    resourceUrl: null,
  },
  {
    authorId: anaId,
    title:
      "Digitalni marketing za lokalni biznis – od nule do prvih 100 kupaca",
    summary:
      "Konkretne taktike digitalnog marketinga prilagođene manjim budžetima i srpskom tržištu – Instagram, Google, Viber i lokalni SEO.",
    body: `# Digitalni marketing za lokalni biznis

## Zašto digitalni marketing?

Lokalni biznis u Srbiji ima veliku prednost: kupci su lojalni kada ih jednom pridobijete. Digitalni marketing vam pomaže da ih uopšte pronađete.

## Osnove koje morate imati

1. **Google My Business profil** – besplatno, kritično za lokalni SEO
2. **Instagram stranica** – bar 3 posta nedeljno, reels performiraju bolje
3. **Viber zajednica** – u Srbiji efikasnija od Facebook grupe

## Budžet strategija (200 EUR/mes)

| Kanal | Budžet | Cilj |
|---|---|---|
| Google Ads (lokalni) | 80 EUR | Svest o brendu |
| Instagram Ads | 70 EUR | Novi pratioci |
| Kreacija sadržaja | 50 EUR | Konzistentnost |

## Merenje uspeha

Pratite: Cost per lead, Conversion rate, Customer lifetime value

## Najvažniji savet

Autentičan sadržaj uvek pobedi oglase. Video iz "kuhinje biznisa" na Instagramu donosi više nego najskuplji ad.`,
    type: "blog",
    category: "marketing",
    videoUrl: null,
    resourceUrl: null,
  },
];

const insertTutorial = db.prepare(`
  INSERT INTO tutorials (id, authorId, title, summary, body, type, category, videoUrl, resourceUrl, createdAt, updatedAt)
  VALUES (@id, @authorId, @title, @summary, @body, @type, @category, @videoUrl, @resourceUrl, @createdAt, @updatedAt)
`);

tutorials.forEach((t) =>
  insertTutorial.run({
    ...t,
    id: randomUUID(),
    createdAt: now(),
    updatedAt: now(),
  }),
);
console.log("  tutorials:", tutorials.length);

// ── DONE ──────────────────────────────────────────────────────────────────────

console.log("\n✅ Seed complete!");
console.log("   Applicants :", applicants.length);
console.log("   Investors  :", investors.length);
console.log("   Ideas      :", ideasData.length);
console.log("   Interests  :", interests.length);
console.log("   Forum posts:", postDefs.length);
console.log("   Replies    :", replyDefs.length);
console.log("   Tutorials  :", tutorials.length);

db.close();
