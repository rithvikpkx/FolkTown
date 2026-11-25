# Stand-in names

FolkTown is set on a faithful model of Purdue's West Lafayette campus, but the game never uses the official names. The school is **Folk University**, the town is **Folktown**, and the colours stay black and old gold.

[`data/names.json`](../data/names.json) is the source of truth for every stand-in; this page is a readable copy of it. **Nothing in the game uses the table yet.**

## Rules

- Each stand-in should be recognisable but clearly not the official name, the way the owner's examples do it: Wetherill becomes **Weather Hall**, Hillenbrand becomes **Hill Hall**.
- Never use "Purdue", "Boilermaker" or "Boiler", "Purdue Pete", "Hoosier" or "West Lafayette", any real donor's or person's name word for word, or trademarked slogans and songs.
- Generic names (Bell Tower, Engineering Fountain, Hello Walk, Memorial Mall, Physics Building) may stay as they are.
- Codes are short callout codes made from the folk name. They never equal the building's real official code (WALC, PMU, HAAS and so on).
- Streets and non-place names (the `other` group) have no code: `null` in the JSON, shown as - below.
- Streets, the Wabash River and other geography keep their real names for now (`folk` equals `real`, marked "geography, owner decides").
- Chain shops, private apartments and Greek houses also get stand-ins, so that no real business or chapter is named.
- Entries marked **low** confidence are places where it is unclear what the building really is.

## Residence halls (31)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| Cary Quadrangle Northeast (CQNE) | Carry Quad Northeast | CRNE | `way/75498142` |
| Cary Quadrangle South (CQS) | Carry Quad South | CRS | `way/75498144` |
| Cary Quadrangle East (CQE) | Carry Quad East | CRE | `way/75498145` |
| Cary Quadrangle West (CQW) | Carry Quad West | CRW | `way/75498147` |
| Cary Quadrangle Northwest (CQNW) | Carry Quad Northwest | CRNW | `way/75498148` |
| Earhart Hall | Airhart Hall | AIR | `way/128488694` |
| Harrison Hall | Harris Hall | HRS | Not in campus.json (outside the baked area); id from data/raw/osm-campus.json; `relation/12652929` |
| Hawkins Hall | Hawk Hall | HWK | `way/117396585` |
| Hillenbrand Hall | Hill Hall | HLL | `way/128487952` |
| Honors College and Residences North | Laurel Hall North | LHN | `way/470285119` |
| Honors College And Residences South | Laurel Hall South | LHS | `way/518434567` |
| McCutcheon Hall | McCutch Hall | MCH | Not in campus.json; id from data/raw/osm-campus.json; `relation/12652930` |
| Meredith Hall | Merriweather Hall | MWH | `way/128488696` |
| Meredith Hall South | Merriweather South | MWS | `way/859157050` |
| Owen (Richard) Residence Hall (OWEN) | Owens Hall | OWS | Not in campus.json; id from data/raw/osm-campus.json; `relation/12647862` |
| Shreve Hall | Shrieve Hall | SHV | `way/128488704` |
| Tarkington (Newton Booth) Residence Hall (TARK) | Tarkton Hall | TKT | Not in campus.json; id from data/raw/osm-campus.json; `relation/12647702` |
| Wiley (Harvey W.) Residence Hall (WILY) | Wily Hall | WLY | Not in campus.json; id from data/raw/osm-campus.json; `relation/12647701` |
| Windsor Halls | Windham Halls | WDH | `way/128488698` |
| Frieda Parker Hall | Frida Porter Hall | FRP | `way/886353320` |
| Winifred Parker Hall | Winnie Porter Hall | WNP | `way/327303065` |
| First Street Towers, West (FSTW) | First Avenue Towers West | FATW | `way/283274997` |
| First Street Towers, Central (FSTC) | First Avenue Towers Central | FATC | `way/283274998` |
| First Street Towers, East (FSTE) | First Avenue Towers East | FATE | `way/283274999` |
| Third Street Suites | Third Avenue Suites | TAS | Owner-fixed stand-in; not in campus.json or the building list |
| Griffin Residence Hall North | Gryphon Hall North | GYN | Owner-fixed stand-in; not in campus.json or the building list |
| Griffin Residence Hall South | Gryphon Hall South | GYS | Owner-fixed stand-in; not in campus.json or the building list |
| Fowler Memorial House | Fuller House | FUL | Tagged university in OSM; on the dorm list because the ID card uses it; `way/283275001` |
| Shealy (Frances M.) Residence Hall | Shelley Hall | SHL | `way/128488695` |
| Duhme (Ophelia) Residence Hall | Dewey Hall | DWY | `way/936763597` |
| 3rd and West | Third and Western Hall | TWH | `way/1324500897` |

## Dining (12)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| Wiley Dining Court (WDCT) | Wily Dining | WLD | `way/184280688` |
| Earhart Dining Court | Airhart Dining | AHD | Inside Earhart Hall; no separate OSM building |
| Ford Dining Court | Forde Dining | FDD | `way/283275005` |
| Windsor Dining Court | Windham Dining | WHD | Inside Windsor Halls; no separate OSM building |
| Rolling Bowl | Rolling Wok | RWK | Off-campus restaurant; `way/71497486` |
| Panda Express | Bamboo Express | BMX | Chain restaurant; `way/71497488` |
| Chipotle | Chili Pepper Grill | CPG | Chain restaurant; `way/71497490` |
| Jimmy John's | Johnny Jim's | JJS | Chain restaurant; `way/116427223` |
| McDonald's | MacDougal's | MCD | Chain restaurant; one of two in campus.json; `way/116427228` |
| McDonald's | MacDougal's Express | MDX | Chain restaurant; second one in campus.json; `way/256640455` |
| O'Bryan's Nine Irish Brothers | O'Malley's Nine Irish Cousins | OMC | Off-campus pub; `way/116427243` |
| Triple XXX Family Restaurant | Triple Z Family Diner | TZD | Local diner; `way/116427250` |

## Venues and sports (15)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| Ross-Ade Stadium | Rosswood Stadium | RWS | Not a named building in campus.json |
| Mackey Arena | Mackie Arena | MKA | `way/74144839` |
| Elliott Hall of Music (ELLT) | Ellison Hall of Music | ELH | `way/74151922` |
| Slayter Center for Performing Arts | Slater Center for Performing Arts | SLC | `way/283275010` |
| Lambert (Ward L.) Fieldhouse and Gymnasium | Lambeth Fieldhouse | LFH | `way/128488701` |
| Morgan J. Burke Boilermaker Aquatic Center | Folk Aquatic Center | AQC | `way/128488697` |
| France A. Córdova Recreational Sports Center | Cordell Rec Center | CRC | `way/128488703` |
| Turf Recreation Exercise Center | Turf Training Center | TTC | `way/283275002` |
| Purdue Football Performance Complex | Riveters Football Complex | RFC | From the building list only; not in campus.json |
| Schwartz Tennis Center | Schultz Tennis Center | STN | From the building list only; not in campus.json |
| Hull "All-American" Marching Band Complex | Hulme Marching Band Complex | MBC | `way/1167600633` |
| Rohrman Field | Rohrbach Field | RBH | Sports pitch (grass layer); `way/74144840` |
| Hull Field | Hulme Field | HMF | Sports pitch (grass layer); `way/301911804` |
| Purdue Gold Intramural Fields | Old Gold Intramural Fields | OGF | Grass layer; `way/249303043` |
| The Pete Dye Clubhouse | Birdie Clubhouse | BCH | Golf clubhouse; from the building list only |

## Landmarks and open spaces (30)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| Purdue Bell Tower | Bell Tower | BEL | `way/301837711` |
| Engineering Fountain | Engineering Fountain | EFT | `way/283274213` |
| Loeb Fountain | Lobe Fountain | LBF | Not named in campus.json |
| John Purdue's grave | Founder's Grave (John Folk) | FGV | On Memorial Mall; not in campus.json |
| Unfinished Block P | Unfinished Block F | UBF | Sculpture; not in campus.json |
| Hello Walk | Hello Walk | HLW | Footpath in campus.json paths; `way/283274236` |
| Purdue Mall | Folk Mall | FML | Also the name of zone data/zones/purdue-mall.json; `way/158307947` |
| Engineering Mall | Engineering Mall | EML | Zone name in data/zones/engineering-mall.json |
| Memorial Mall | Memorial Mall | MML | `way/74154179` |
| Stadium Mall | Stadium Mall | SML | `way/301604963` |
| Centennial Mall | Centennial Mall | CML | `way/1098706602` |
| Centennial Mall South | Centennial Mall South | CTS | `way/630081195` |
| Agricultural Mall | Agricultural Mall | AGM | Named path in campus.json; `way/5327012` |
| 3rd Street Mall | 3rd Street Mall | TSM | Pedestrian path; street name kept (geography, owner decides); `way/888273588` |
| Freedom Square | Freedom Square | FSQ | `way/361973955` |
| MSEE tunnel | Engineering Tunnel | ETN | `way/301738145` |
| Bell Tower Area | Bell Tower Lawn | BTL | `way/547113855` |
| Slayter Hill | Slater Hill | SLH | `way/283275009` |
| Krach Lawn | Craig Lawn | CGL | `way/327304066` |
| Spitzer Court | Spitz Court | SPZ | `way/301840188` |
| De Bedout Plaza | Bedford Plaza | BFP | `way/663313311` |
| Purdue Jules Janick Horticulture Garden | Folk Horticulture Garden | FHG | `way/547145358` |
| Founders Park | Founders Park | FDP | `way/635838192` |
| Sinninger Pond | Singer Pond | SGP | `way/547113856` |
| Academy Park | Academy Park | ACP | City park; `way/74154178` |
| Pickett Park | Picket Park | PKP | City park; `way/283275007` |
| Lincoln Park | Lincoln Park | LNP | City park; `way/469941409` |
| Paula R. Woods Park | Riverwoods Park | RWP | City park; `way/469941411` |
| Squirrel Park | Squirrel Park | SQP | City park; `way/553890826` |
| Tommy Johnston Park | Johnstone Park | JNP | City park; `way/860808218` |

## Buildings (182)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| R. B. Wetherill Laboratory of Chemistry (WTHR) | Weather Hall | WTH | `way/117146489` |
| Wilmeth Active Learning Center (WALC) | Wilmore Learning Center | WLC | `way/508846031` |
| Purdue Student Union | Folk Memorial Union | FMU | OSM name for the Purdue Memorial Union (PMU); `way/117146490` |
| Union Club Hotel | Union Club Inn | UCI | Hotel inside the Memorial Union complex; `way/117146483` |
| Hovde Hall of Administration (HOVD) | Hove Hall | HOVE | `way/75498146` |
| Hicks Undergraduate Library (HIKS) | Hix Library | HIX | `way/158307900` |
| Stewart Center (STEW) | Stuart Center | STC | `way/117146484` |
| Neil Armstrong Hall of Engineering (ARMS) | Strongarm Hall | SAH | `way/117146481` |
| Lawson Hall (LWSN) | Lawton Hall | LWT | `way/159752222` |
| Krannert School of Management | Crane Hall | CRH | The Krannert Building (KRAN); `way/117396623` |
| Physics Building (PHYS) | Physics Building | PHB | `way/74340895` |
| Brown Laboratory of Chemistry (BRWN) | Braun Laboratory of Chemistry | BRC | `way/117146480` |
| Heine Pharmacy (RHPH) | Hyne Pharmacy Building | HPB | `way/117146482` |
| Student Health Center (PUSH) | Student Health Center | HLT | `way/117146486` |
| Knoy Hall (KNOY) | Noy Hall | NOY | `way/117146487` |
| Johnson Hall of Nursing (JNSN) | Jonson Hall of Nursing | JON | `way/117146488` |
| Hall of Data Science and AI (DSAI) | Hall of Data Science and AI | HDS | `way/117146492` |
| Grissom Hall | Grisham Hall | GRH | `way/117146493` |
| Hampton Hall of Civil Engineering (HAMP) | Hamlin Hall of Civil Engineering | HML | `way/117146495` |
| Forney Hall of Chemical Engineering (FRNY) | Forley Hall of Chemical Engineering | FCE | `way/117146497` |
| Schleman Hall (SCHM) | Shelman Hall | SHM | `way/117147167` |
| Haas (Felix) Hall (HAAS) | Haze Hall | HZH | `way/117147168` |
| Potter Engineering Center (POTR) | Plotter Engineering Center | PLT | `way/117147170` |
| Armory (AR) | The Armory | ARM | `way/117147171` |
| Matthews Hall (MTHW) | Mathis Hall | MAH | `way/117147172` |
| Psychological Sciences Building (PSYC) | Psychological Sciences Building | PSY | `way/117147173` |
| Beering Hall (BRNG) | Bearing Hall | BRH | `way/117147176` |
| Mathematical Sciences Building (MATH) | Mathematical Sciences Building | MTS | `way/117147177` |
| Stone Hall (STON) | Flint Hall | FLH | `way/117147178` |
| Young Hall (YONG) | Younger Hall | YGH | `way/117396581` |
| Stanley Coulter Hall (SC) | Coulson Hall | CLS | Baked into the purdue-mall zone as an extra building (zones.config.json); `relation/3759822` |
| Yue-Kong Pao Hall | Pow Hall | PWH | `way/117396586` |
| Philip E. Nelson Hall of Food Science (NLSN) | Nielsen Hall of Food Science | NFS | `way/117396587` |
| Rawls Hall | Rolls Hall | RLH | `way/117396593` |
| National Soil Erosion Laboratory (SOIL) | Soil Erosion Laboratory | SEL | `way/117396594` |
| Life Science Plant and Soils Laboratory | Life Science Plant and Soils Laboratory | LPS | `way/117396596` |
| Smith Hall | Smyth Hall | SMY | `way/117396598` |
| Herrick Laboratories | Old Herrin Laboratories | HLO | **low confidence**; Assumed to be the older Herrick building, since campus.json also has Ray W. Herrick Laboratories; `way/117396601` |
| Ray W. Herrick Laboratories | Herrin Laboratories | HRL | **low confidence**; Assumed to be the newer (2017) Herrick building; `way/550881239` |
| Biochemistry Building | Biochemistry Building | BCB | `way/117396603` |
| Agricultural Administration Building | Agriculture Administration Building | AGA | `way/117396610` |
| Lilly Hall | Lilac Hall | LLH | `way/117396614` |
| Life Science Ranges (Greenhouse and Service Building) | Life Science Greenhouses | LSG | `way/117396615` |
| Whistler Hall | Whittler Hall | WHT | `way/117396619` |
| Horticulture | Horticulture Building | HRT | `way/117396620` |
| Martin C. Jischke Hall of Biomedical Engineering | Jessup Hall of Biomedical Engineering | JBE | `way/117396622` |
| Dauch Alumni Center | Dutch Alumni Center | DTC | `way/117396626` |
| Agricultural and Biological Engineering (ABE) | Ag and Bio Engineering | AGB | `way/117396629` |
| Drew and Brittany Brees Student-Athletic Academic Center (BRES) | Breeze Student-Athlete Center | BSC | `way/128488702` |
| Materials Science and Electrical Engineering (MSEE) | Materials and Electrical Engineering | MEE | `way/158307858` |
| Max W & Maileen Brown Family Hall of Electrical Engineering (BHEE) | Brownlee Hall of Electrical Engineering | BRL | `way/158307860` |
| Mechanical Engineering (ME) | Mechanical Engineering Building | MEB | `way/158307862` |
| University Hall (UNIV) | University Hall | UNH | `way/158307901` |
| Smalley Center | Smallwood Center | SWC | **low confidence**; Purpose unclear from OSM (tagged university, one floor); `way/158619961` |
| Black Cultural Center (BCC) | Black Cultural Center | BKC | `way/158620074` |
| Purdue Fire Department | Folk Fire Department | FFD | `way/158620152` |
| Bindley Bioscience Center | Bentley Bioscience Center | BTB | `way/159752220` |
| Birck Nanotechnology Center | Brick Nanotechnology Center | BKN | `way/159752221` |
| Mann Hall | Manning Hall | MNH | `way/159752223` |
| Marriot Hall | Merritt Hall | MRT | `way/159752224` |
| Morgan Center for Entrepreneurship (MRGN) | Morrow Center for Entrepreneurship | MRW | `way/159752229` |
| Telecommunications Building (TEL) | Telecommunications Building | TCB | `way/159752232` |
| Purdue Police Department | Folk Police Department | FPD | `way/159752235` |
| Latino Cultural Center (LCC) | Latino Cultural Center | LTC | `way/301934126` |
| Latino Cultural Center | Latino Cultural Center (old site) | LTO | **low confidence**; campus.json has two LCC footprints; this one is assumed to be an older or duplicate site; `way/184282132` |
| Hockmeyer Hall of Structural Biology (HOCK) | Hochman Hall of Structural Biology | HSB | `way/283274991` |
| Hall for Discovery and Learning Research (DLR) | Hall for Discovery and Learning Research | HDL | `way/283274992` |
| Purdue Village Administration Building | Folk Village Administration Building | FVA | **low confidence**; Purdue Village family housing was largely demolished; current use unclear; `way/283274993` |
| Hanley Hall | Handley Hall | HDY | `way/283275000` |
| Northwest Chiller Plant (NWCP) | Northwest Chiller Plant | CHL | `way/283275006` |
| Veterinary Pathology Building | Veterinary Pathology Building | VPA | `way/301832118` |
| Veterinary Animal Isolation Building 2 | Veterinary Animal Isolation Building 2 | VI2 | `way/301832119` |
| Animal Disease Diagnostic Laboratory | Animal Disease Diagnostic Laboratory | ADL | `way/301832273` |
| Veterinary Medicine Isolation Facility | Veterinary Medicine Isolation Facility | VMI | `way/301832274` |
| Animal Holding Facility | Animal Holding Facility | AHO | `way/301832276` |
| Utility Plant Office Facility | Utility Plant Office Facility | UPO | `way/301832277` |
| Wang Hall (WANG) | Wing Hall | WGH | `way/301932787` |
| Asian American and Asian Resource and Cultural Center (AACC) | Asian American Cultural Center | AAR | `way/301934124` |
| Native American Educational and Cultural Center (NACC) | Native American Cultural Center | NAE | `way/301934125` |
| Class of 1950 Lecture Hall (CL50) | Class of 1950 Lecture Hall | L50 | `way/309492283` |
| Pierce Hall (PRCE) | Pearce Hall | PRH | `way/309492284` |
| Krach Leadership Center (KRCH) | Craig Leadership Center | CLC | `way/327303064` |
| Ralph & Bettye Bailey Hall | Bayley Hall | BYH | `way/332361174` |
| Purdue Drug Discovery Facility | Folk Drug Discovery Facility | DDF | `way/520127811` |
| Bechtel Innovation Design Center (BIDC) | Bechtold Design Center | BDC | `way/693623661` |
| Flex Lab (FLEX) | Flex Lab | FLX | `way/693624339` |
| Convergence Center for Innovation and Collaboration (CONV) | Convergence Center | CVG | `way/803755067` |
| Chaney-Hale Hall of Science (CHAS) | Chainey Hall of Science | CNH | **low confidence**; The zone list calls this "Cheney Hall"; matched by closest name, owner to confirm; `way/866802210` |
| Creighton Hall of Animal Sciences (CRTN) | Crichton Hall of Animal Sciences | CAS | `way/886346925` |
| Lyles-Porter Hall (LYLE) | Lyall Hall | LYH | `way/886348186` |
| MRI Modular Facility (MRI1) | MRI Modular Facility | MRF | `way/886348187` |
| American Railway Building (RAIL) | Railway Building | RWB | `way/932253994` |
| Marc and Sharon Hagle Hall (HAGL) | Hegel Hall | HEG | `way/960201468` |
| Purdue Graduate Student Center | Folk Graduate Student Center | GSC | `way/1103303762` |
| David and Bonnie Brunner Farm Animal Hospital | Brenner Farm Animal Hospital | BFA | `way/1106726514` |
| Lambertus Hall (LMBS) | Lamberton Hall | LMT | `way/1383852532` |
| Dudley Hall (DUDL) | Dudlow Hall | DDW | `way/1383852533` |
| Duncan Annex | Duncombe Annex | DCA | **low confidence**; Zone target; not in OSM (candidates way/1033674918, way/1033674919) |
| ADM Agricultural Innovation Center | Ag Innovation Center | AIC | From the building list only |
| Charles J. Lynn Hall of Veterinary Medicine | Linn Hall of Veterinary Medicine | LVM | `relation/12710221` |
| Equine Health Sciences Annex | Equine Health Sciences Annex | EHS | From the building list only |
| Grounds Maintenance Facility | Grounds Maintenance Facility | GRM | From the building list only |
| Hangar 4 | Hangar 4 | H04 | Airport; from the building list only |
| Hangar 5 | Hangar 5 | H05 | Airport; from the building list only |
| Hangar 6 | Hangar 6 | H06 | Airport; from the building list only |
| Hangar 6W | Hangar 6W | H6W | Airport; from the building list only |
| Hansen Hall | Hanlon Hall | HNL | `relation/12701379` |
| Holleman-Niswonger Simulator Center (SIML) | Flight Simulator Center | FSC | Airport; from the building list only |
| Main Terminal Building (TERM) | Airport Terminal | ATB | Airport; from the building list only |
| Materials Management Storage Building | Materials Management Storage Building | MMS | From the building list only |
| Materials Management and Distribution Center | Materials Management and Distribution Center | MMD | From the building list only |
| Niswonger Aviation Technology Building | Nesbitt Aviation Building | NAB | Airport; from the building list only |
| Printing Services Facility | Printing Services Facility | PRN | From the building list only |
| Purdue Center for Regional Development (SCHO) | Folk Center for Regional Development | CRD | From the building list only |
| Purdue Technology and Aerospace | Folk Technology and Aerospace | FTA | From the building list only |
| Purdue University Early Care and Education Center | Folk Early Care Center | ECC | From the building list only |
| Utility Plant Storage Building | Utility Plant Storage Building | UPB | From the building list only |
| Walter W. Wade Utility Plant | Wadsworth Utility Plant | WUP | From the building list only |
| University Street Parking Garage (PGU) | University Street Garage | USG | Parking; street name kept; `way/75498205` |
| Wood Street Garage (PGW) | Wood Street Garage | WOD | Parking; street name kept; `way/111471105` |
| Grant Street Parking Garage (PGG) | Grant Street Garage | GSG | Parking; street name kept; `way/158307997` |
| Northwestern Parking Garage | Northwestern Avenue Garage | NWG | Parking; street name kept; `way/283275025` |
| Harrison Street Parking Garage | Harrison Street Garage | HSG | Parking; street name kept; `way/520127810` |
| Parking Garage, McCutcheon Drive | McCutcheon Drive Garage | MDG | Parking; street name kept (geography, owner decides); `relation/14483073` |
| West Lafayette Public Library | Folktown Public Library | FPL | Town building; `way/71497515` |
| Margerum City Hall | Folktown City Hall | FCH | Town building; `way/159752237` |
| West Lafayette Community School Corporation | Folktown Community Schools | FCS | Town building; from the building list only |
| West Lafayette Junior-Senior High School | Folktown Junior-Senior High School | FHS | Town building; from the building list only |
| University Book Store | Campus Book Shop | CBK | Shop; `way/117396621` |
| Von's | Vaughn's | VNS | Local shop; `way/116427236` |
| Henni's Hair Shop | Penny's Hair Shop | PHS | Local shop; `way/116427257` |
| Chase | Pursuit Bank | PBK | Bank branch; `way/116427263` |
| Circle K | Circle Q | CRQ | Petrol station; `way/345144282` |
| Campus Inn | Campus Lodge | CLG | Motel; first of two footprints; `way/116427244` |
| Campus Inn | Campus Lodge Annex | CLA | Motel; second footprint; `way/116427245` |
| The Moosehead Lounge | The Elkhorn Lounge | ELK | **low confidence**; Tagged semidetached_house; possibly a nickname for a private house; `way/910910470` |
| St. Thomas Aquinas | St. Thomas Chapel | STT | Catholic student centre; `way/117396617` |
| University Church | University Church | UCH | `way/300547969` |
| University Lutheran Church | University Lutheran Church | LUT | `way/301932784` |
| Our Saviour Lutheran Church | Our Saviour Lutheran Church | OSL | `way/860901797` |
| Purdue Lutheran Ministry | Folk Lutheran Ministry | FLM | `way/860901812` |
| Unitarian Universalist Church of Tippecanoe County | Unitarian Universalist Church of Folk County | UUC | `way/860918857` |
| The Church of Jesus Christ of Latter-day Saints | The Church of Jesus Christ of Latter-day Saints | LDS | `way/301838025` |
| Islamic Societyof Greater Lafayette | Islamic Society of Greater Folktown | ISF | `way/301836567` |
| Hillel | Hillel House | HHS | `way/301838026` |
| Baptist Student Foundation | Baptist Student Foundation | BAP | `way/301934831` |
| Chapel of the Good Shepherd | Chapel of the Good Shepherd | SHP | From the building list only |
| First United Methodist Church | First United Methodist Church | FUM | From the building list only |
| Phi Delta Theta | Phi Delta Rho | PDR | Greek house; letters changed; `way/117396592` |
| Triangle Fraternity | Square Fraternity | SQF | Greek house; `way/159752228` |
| Alpha Kappa Lambda | Alpha Kappa Nu | AKN | Greek house; letters changed; `way/301841244` |
| Chi Omega | Chi Upsilon | CUP | Greek house; letters changed; `way/301841245` |
| Zeta Tau Alpha | Zeta Tau Beta | ZTB | Greek house; letters changed; `way/301921255` |
| Alpha Chi Rho | Alpha Chi Psi | ACX | Greek house; letters changed; `way/301921258` |
| FarmHouse Fraternity, Purdue Chapter | Barnhouse Fraternity | BHF | Greek house; `way/301923755` |
| Alpha Chi Sigma - Beta Nu chapter | Alpha Chi Theta | ACT | Greek house; letters changed; `way/558268041` |
| Kappa Sigma | Kappa Psi | KPS | Greek house; letters changed; `way/671108496` |
| Pi Kappa Phi | Pi Kappa Xi | PKX | Greek house; letters changed; `way/860826643` |
| Delta Tau Delta | Delta Tau Gamma | DTG | Greek house; letters changed; `way/860901808` |
| Phi Kappa Tau | Phi Kappa Omega | PKO | Greek house; letters changed; `way/860903228` |
| Fairway Cooperative | Fairview Cooperative | FVC | Student co-op house; `way/220568267` |
| Twin Pines Cooperative | Twin Oaks Cooperative | TOC | Student co-op house; `way/301934836` |
| Shoemaker Cooperative | Cobbler Cooperative | CBC | Student co-op house; `way/860826642` |
| River Market Apartments | River Mart Apartments | RVM | Private apartments; `way/116427242` |
| State Street Towers | State Street Heights | SSH | Private apartments; `way/116427251` |
| FUSE | Spark Apartments | SPK | **low confidence**; Private apartments (tagged residential); `way/256639574` |
| Riverbend Apartments | River Bend Flats | RBF | Private apartments; `way/283273591` |
| Marstellar | The Marstell | MST | **low confidence**; Private apartments on Marsteller Street; `way/301831857` |
| Granite Student Living | Basalt Student Living | BSL | Private apartments; `way/301838019` |
| University Terrace | College Terrace | CTR | Private apartments; `way/301931864` |
| Rise on Chauncey | Ascent on Chauncey | AOC | Private apartments; street name kept; `way/604071163` |
| hub | Nexus Apartments | NXA | Private apartments (Hub on Campus); `way/843163261` |
| Hi Vine | High Ivy Apartments | HIA | Private apartments; `way/860826644` |
| Campus Edge | Campus Rim | CRM | Private apartments; `way/886359911` |
| Crossing At Chauncey Hill | Chauncey Hill Crossing | CHC | Private apartments; street name kept; `way/886359912` |
| The Arches | The Vaults | VLT | Private apartments; `way/886359913` |
| The Arches II | The Vaults II | VL2 | Private apartments; `way/886359914` |
| Verve | Vibe Apartments | VIB | Private apartments; `way/1424680532` |
| Aspire at Discovery Park | Aspen at Innovation Park | AIP | Private apartments; OSM has a second part, relation/12037689; `relation/12037636` |
| Continuum Apartments | Spectrum Apartments | SPA | Private apartments; `relation/14669620` |
| Crosswalk Commons | Crossway Commons | CWC | From the building list only |
| Provenance Apartments | Providence Apartments | PVA | Private apartments; from the building list only |

## Other names (18)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| Purdue / Purdue University | Folk University | - |  |
| West Lafayette | Folktown | - |  |
| Boilermakers | The Riveters | - | Team / student nickname |
| Purdue Pete | Rusty the Riveter | - | Original mascot: a riveter in black and old gold with an oversized rivet gun |
| Boilermaker Special | The Folk Express | - | Mascot vehicle |
| Indiana University (Bloomington) | Crimson State University (Bloomville) | - | Rival school and its town |
| Old Oaken Bucket | The Old Tin Pail | - | Rivalry trophy |
| Boiler Up! | Rivet Up! | - | Slogan |
| Hammer Down | Full Steam! | - | Slogan |
| Hail Purdue | Forge Ahead, Folk! | - | Original fight song title |
| "All-American" Marching Band | The Marching Riveters | - | Band name |
| Starship delivery robots | Moonships | - | Sidewalk delivery robots |
| Purdue Grand Prix | Folk Grand Prix | - | Go-kart race |
| Breakfast Club | Breakfast Bunch | - | Game-day costumed bar crawl |
| Bug Bowl | Bug Bash | - | Insect festival |
| Wabash River | Wabash River | - | geography, owner decides |
| Lafayette | Lafayette | - | geography, owner decides (city across the river) |
| Tippecanoe County | Tippecanoe County | - | geography, owner decides |

## Streets (94)

| Real | Folk name | Code | Notes |
|---|---|---|---|
| 1st Street | 1st Street | - | geography, owner decides; `way/5332639` |
| 2nd Street | 2nd Street | - | geography, owner decides; `way/5331357` |
| 3rd Street | 3rd Street | - | geography, owner decides; `way/5327896` |
| 3rd Street Bike Path | 3rd Street Bike Path | - | geography, owner decides; `way/1085151754` |
| 4th Street | 4th Street | - | geography, owner decides; `way/5333766` |
| 5th Street | 5th Street | - | geography, owner decides; `way/5331924` |
| 6th Street | 6th Street | - | geography, owner decides; `way/5329935` |
| Allen Street | Allen Street | - | geography, owner decides; `way/5332440` |
| Andrew Place | Andrew Place | - | geography, owner decides; `way/5331881` |
| Arnold Drive | Arnold Drive | - | geography, owner decides; named after a real person; `way/5333697` |
| Brown Street | Brown Street | - | geography, owner decides; `way/344910825` |
| Cary Drive | Cary Drive | - | geography, owner decides; named after a real person; `way/5333331` |
| Cattail Trail | Cattail Trail | - | geography, owner decides; `way/50979086` |
| Central Drive | Central Drive | - | geography, owner decides; `way/5335155` |
| Chauncey Avenue | Chauncey Avenue | - | geography, owner decides; `way/5330471` |
| Clinic Drive | Clinic Drive | - | geography, owner decides; `way/435713406` |
| Connolly Street | Connolly Street | - | geography, owner decides; `way/5329644` |
| Crum Court | Crum Court | - | geography, owner decides; `way/5330698` |
| David Ross Road | David Ross Road | - | geography, owner decides; named after a real person; `way/5331579` |
| Dehart Street | Dehart Street | - | geography, owner decides; `way/5329946` |
| District Blvd | District Blvd | - | geography, owner decides; `way/837002797` |
| Dodge Street | Dodge Street | - | geography, owner decides; `way/5334246` |
| East Columbia Street | East Columbia Street | - | geography, owner decides; `way/5330966` |
| East Lutz Avenue | East Lutz Avenue | - | geography, owner decides; named after a real person; `way/5334458` |
| East Oak Street | East Oak Street | - | geography, owner decides; `way/5335295` |
| East Stadium Avenue | East Stadium Avenue | - | geography, owner decides; `way/5331501` |
| East State Street | East State Street | - | geography, owner decides; `way/860684572` |
| East Wood Street | East Wood Street | - | geography, owner decides; `way/5332682` |
| Evergreen Street | Evergreen Street | - | geography, owner decides; `way/5334170` |
| Foundry Drive | Foundry Drive | - | geography, owner decides; `way/837002798` |
| Fowler Avenue | Fowler Avenue | - | geography, owner decides; `way/5327052` |
| Garfield Street | Garfield Street | - | geography, owner decides; `way/5330300` |
| Gates Road | Gates Road | - | geography, owner decides; `way/51758181` |
| Halsey Drive | Halsey Drive | - | geography, owner decides; named after a real person; `way/895573873` |
| Harrison Street | Harrison Street | - | geography, owner decides; `way/302407380` |
| Hayes Street | Hayes Street | - | geography, owner decides; `way/283274986` |
| Hilltop Drive | Hilltop Drive | - | geography, owner decides; `way/5334849` |
| Hort Drive | Hort Drive | - | geography, owner decides; `way/5331462` |
| Howard Avenue | Howard Avenue | - | geography, owner decides; `way/5330564` |
| John R. Wooden Drive | John R. Wooden Drive | - | geography, owner decides; named after a real person; `way/5330616` |
| Lawn Avenue | Lawn Avenue | - | geography, owner decides; `way/5333609` |
| Littleton Street | Littleton Street | - | geography, owner decides; `way/52040054` |
| MacArthur Drive | MacArthur Drive | - | geography, owner decides; named after a real person; `way/5334709` |
| Maple Street | Maple Street | - | geography, owner decides; `way/5330969` |
| Marsteller Street | Marsteller Street | - | geography, owner decides; `way/5330438` |
| Martin Jischke Drive | Martin Jischke Drive | - | geography, owner decides; named after a real person; `way/319797214` |
| Mc Cutcheon Drive | Mc Cutcheon Drive | - | geography, owner decides; named after a real person; `way/5332202` |
| Memorial Mall Drive | Memorial Mall Drive | - | geography, owner decides; `way/1193683624` |
| Mitch Daniels Boulevard | Mitch Daniels Boulevard | - | geography, owner decides; named after a real person; `way/333094489` |
| Nimitz Drive | Nimitz Drive | - | geography, owner decides; named after a real person; `way/319797209` |
| North Grant Street | North Grant Street | - | geography, owner decides; `way/302409381` |
| North Martin Jischke Drive | North Martin Jischke Drive | - | geography, owner decides; named after a real person; `way/333094484` |
| North River Road | North River Road | - | geography, owner decides; `way/52040059` |
| North Russell Street | North Russell Street | - | geography, owner decides; `way/5330097` |
| North Salisbury Street | North Salisbury Street | - | geography, owner decides; `way/5329597` |
| North Steven Beering Drive | North Steven Beering Drive | - | geography, owner decides; named after a real person; `way/5330360` |
| North Street | North Street | - | geography, owner decides; `way/5334243` |
| North University Street | North University Street | - | geography, owner decides; `way/5335106` |
| Northwestern Avenue | Northwestern Avenue | - | geography, owner decides; `way/5329784` |
| Oak Lane | Oak Lane | - | geography, owner decides; `way/347382089` |
| Oval Drive | Oval Drive | - | geography, owner decides; `way/5334872` |
| Pearl Street | Pearl Street | - | geography, owner decides; `way/5329888` |
| Pierce Street | Pierce Street | - | geography, owner decides; `way/5334150` |
| Quincy Street | Quincy Street | - | geography, owner decides; `way/5332081` |
| Robinson Street | Robinson Street | - | geography, owner decides; `way/860925388` |
| Ross Ade Drive | Ross Ade Drive | - | geography, owner decides; named after a real person; `way/5335639` |
| Rusk Street | Rusk Street | - | geography, owner decides; `way/5333305` |
| Sheetz Street | Sheetz Street | - | geography, owner decides; `way/74552821` |
| Smiley Street | Smiley Street | - | geography, owner decides; `way/5333265` |
| South Chauncey Avenue | South Chauncey Avenue | - | geography, owner decides; `way/5329931` |
| South Grant Street | South Grant Street | - | geography, owner decides; `way/5331094` |
| South Martin Jischke Drive | South Martin Jischke Drive | - | geography, owner decides; named after a real person; `way/5333801` |
| South River Road | South River Road | - | geography, owner decides; `way/5334628` |
| South Russell Street | South Russell Street | - | geography, owner decides; `way/5327316` |
| South Salisbury Street | South Salisbury Street | - | geography, owner decides; `way/5330513` |
| South Street | South Street | - | geography, owner decides; `way/5329593` |
| South University Drive | South University Drive | - | geography, owner decides; `way/709199746` |
| South University Street | South University Street | - | geography, owner decides; `way/5332001` |
| Stadium Mall Drive | Stadium Mall Drive | - | geography, owner decides; `way/932656611` |
| Steely Street | Steely Street | - | geography, owner decides; `way/5332958` |
| Sylvia Street | Sylvia Street | - | geography, owner decides; `way/5331800` |
| Tapawingo Drive | Tapawingo Drive | - | geography, owner decides; `way/470281362` |
| Tarkington Drive | Tarkington Drive | - | geography, owner decides; named after a real person; `way/5335638` |
| Tower Drive | Tower Drive | - | geography, owner decides; `way/5335062` |
| Vine Street | Vine Street | - | geography, owner decides; `way/5331058` |
| Waldron Street | Waldron Street | - | geography, owner decides; `way/5331816` |
| West Columbia Street | West Columbia Street | - | geography, owner decides; `way/5330367` |
| West Lutz Avenue | West Lutz Avenue | - | geography, owner decides; named after a real person; `way/5331034` |
| West Oak Street | West Oak Street | - | geography, owner decides; `way/5335468` |
| West Stadium Avenue | West Stadium Avenue | - | geography, owner decides; `way/5333266` |
| West State Street | West State Street | - | geography, owner decides; `way/895558625` |
| West Wood Street | West Wood Street | - | geography, owner decides; `way/5332328` |
| Wiggins Street | Wiggins Street | - | geography, owner decides; named after a real person; `way/5332650` |
| Williams Street | Williams Street | - | geography, owner decides; `way/5335032` |

