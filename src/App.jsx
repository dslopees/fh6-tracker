import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ─── Image fetcher via Fandom MediaWiki API ───────────────────────────────────
// Fetches the actual FH6 thumbnail image from the car's wiki page
// ── Image URL builder ────────────────────────────────────────────────────────
// Uses Fandom's Special:FilePath which redirects to the actual CDN image.
// The FH6 thumbnail filename pattern is always: FH6_{PageTitle}.png
// Browsers follow the redirect automatically — no fetch() needed.
function getFH6ImageUrl(pageTitle) {
  if (!pageTitle) return null;
  // Convert page title to filename: spaces → underscores
  const filename = "FH6_" + pageTitle.replace(/ /g, "_") + ".png";
  return `https://forza.fandom.com/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`;
}

const WIKI_IMG = {
  // ABARTH
  "1968 595 Esseesse"                                     : "Abarth 595 Esseesse",
  "1980 Fiat 131"                                         : "Abarth Fiat 131",
  "2016 695 Biposto"                                      : "Abarth 695 Biposto",
  // ACURA
  "2001 Integra Type R"                                   : "Acura Integra Type R",
  "2002 RSX Type S"                                       : "Acura RSX Type S",
  "2022 NSX Type S"                                       : "Acura NSX Type S",
  "2023 Integra A-Spec"                                   : "Acura Integra A-Spec",
  // ALFA ROMEO
  "1965 Giulia Sprint GTA Stradale"                       : "Alfa Romeo Giulia Sprint GTA Stradale",
  "1965 Giulia TZ2"                                       : "Alfa Romeo Giulia TZ2",
  "1968 33 Stradale"                                      : "Alfa Romeo 33 Stradale",
  "1990 SE 048SP"                                         : "Alfa Romeo SE 048SP",
  "1992 155 Q4"                                           : "Alfa Romeo 155 Q4",
  "2007 8C Competizione"                                  : "Alfa Romeo 8C Competizione",
  "2014 4C"                                               : "Alfa Romeo 4C",
  "2017 Giulia Quadrifoglio"                              : "Alfa Romeo Giulia Quadrifoglio",
  "2021 Giulia GTAm"                                      : "Alfa Romeo Giulia GTAm",
  // ALUMICRAFT
  "2015 Class 10 Race Car"                                : "Alumicraft Class 10 Race Car",
  "2021 #122 Class 1 Buggy"                               : "Alumicraft 122 Class 1 Buggy",
  "2022 #6165 Trick Truck"                                : "Alumicraft 6165 Trick Truck",
  // AMG TRANSPORT DYNAMICS
  "2554 M12S Warthog CST"                                 : "AMG Transport Dynamics M12S Warthog CST",
  // APOLLO
  "2019 INTENSA EMOZIONE"                                 : "APOLLO INTENSA EMOZIONE",
  // ARIEL
  "2013 Atom 500 V8"                                      : "Ariel Atom 500 V8",
  "2016 Nomad"                                            : "Ariel Nomad",
  // ASTON MARTIN
  "1964 DB5"                                              : "Aston Martin DB5",
  "2016 Vulcan"                                           : "Aston Martin Vulcan",
  "2017 DB11"                                             : "Aston Martin DB11",
  "2017 Vulcan AMR Pro"                                   : "Aston Martin Vulcan AMR Pro",
  "2019 Valhalla Concept Car"                             : "Aston Martin Valhalla Concept Car",
  "2019 DBS Superleggera"                                 : "Aston Martin DBS Superleggera",
  "2019 Vantage"                                          : "Aston Martin Vantage",
  "2021 DBX"                                              : "Aston Martin DBX",
  "2022 Valkyrie AMR Pro"                                 : "Aston Martin Valkyrie AMR Pro",
  "2023 Valkyrie"                                         : "Aston Martin Valkyrie",
  // AUDI
  "1984 Sport Quattro"                                    : "Audi Sport Quattro",
  "1986 #2 Audi Sport quattro S1"                         : "Audi 2 Audi Sport quattro S1",
  "2001 RS 4 Avant"                                       : "Audi RS 4 Avant",
  "2003 RS 6"                                             : "Audi RS 6",
  "2006 RS 4"                                             : "Audi RS 4",
  "2009 RS 6"                                             : "Audi RS 6",
  "2009 R8 LMS"                                           : "Audi R8 LMS",
  "2010 TT RS Coupé"                                      : "Audi TT RS Coupé",
  "2011 RS 5 Coupé"                                       : "Audi RS 5 Coupé",
  "2011 RS 3 Sportback"                                   : "Audi RS 3 Sportback",
  "2013 RS 4 Avant"                                       : "Audi RS 4 Avant",
  "2013 RS 7 Sportback"                                   : "Audi RS 7 Sportback",
  "2013 R8 Coupé V10 Plus"                                : "Audi R8 Coupé V10 Plus",
  "2015 RS 6 Avant"                                       : "Audi RS 6 Avant",
  "2015 S1"                                               : "Audi S1",
  "2016 R8 V10 Plus"                                      : "Audi R8 V10 Plus",
  "2018 RS 4 Avant"                                       : "Audi RS 4 Avant",
  "2020 R8 V10 Performance"                               : "Audi R8 V10 Performance",
  "2020 RS 3 Sedan"                                       : "Audi RS 3 Sedan",
  "2021 RS 6 Avant"                                       : "Audi RS 6 Avant",
  "2021 RS 7 Sportback"                                   : "Audi RS 7 Sportback",
  "2021 RS e-tron GT"                                     : "Audi RS e-tron GT",
  "2023 R8 Coupé V10 GT RWD"                              : "Audi R8 Coupé V10 GT RWD",
  // AUSTIN-HEALEY
  "1965 3000 Mk III"                                      : "Austin-Healey 3000 Mk III",
  // AUTOZAM
  "1993 AZ-1"                                             : "Autozam AZ-1",
  // BAC
  "2014 Mono"                                             : "BAC Mono",
  // BENTLEY
  "2016 Bentayga"                                         : "Bentley Bentayga",
  "2021 Continental GT Convertible"                       : "Bentley Continental GT Convertible",
  // BMW
  "1957 Isetta 300 Export"                                : "BMW Isetta 300 Export",
  "1973 2002 Turbo"                                       : "BMW 2002 Turbo",
  "1981 M1"                                               : "BMW M1",
  "1988 M3"                                               : "BMW M3",
  "1988 M5"                                               : "BMW M5",
  "1995 850CSi"                                           : "BMW 850CSi",
  "1995 M5"                                               : "BMW M5",
  "1997 M3"                                               : "BMW M3",
  "2003 M5"                                               : "BMW M5",
  "2005 M3"                                               : "BMW M3",
  "2008 Z4 M Coupé"                                       : "BMW Z4 M Coupé",
  "2008 M3"                                               : "BMW M3",
  "2009 M5"                                               : "BMW M5",
  "2010 M3 GTS"                                           : "BMW M3 GTS",
  "2011 X5 M"                                             : "BMW X5 M",
  "2012 M5"                                               : "BMW M5",
  "2014 M4 Coupé"                                         : "BMW M4 Coupé",
  "2015 i8"                                               : "BMW i8",
  "2016 M4 GTS"                                           : "BMW M4 GTS",
  "2019 Z4 Roadster"                                      : "BMW Z4 Roadster",
  "2020 M8 Competition Coupé"                             : "BMW M8 Competition Coupé",
  "2020 M2 Competition Coupé"                             : "BMW M2 Competition Coupé",
  "2021 M4 Competition Coupé"                             : "BMW M4 Competition Coupé",
  "2021 M4 Competition Coupé Welcome Pack"                : "BMW M4 Competition Coupé Welcome Pack",
  "2022 iX xDrive50"                                      : "BMW iX xDrive50",
  "2022 M5 CS"                                            : "BMW M5 CS",
  "2023 M2 FORZA EDITION"                                 : "BMW M2 Forza Edition",
  "2023 M2"                                               : "BMW M2",
  "2024 X6 M Competition"                                 : "BMW X6 M Competition",
  // BUICK
  "1987 Regal GNX"                                        : "Buick Regal GNX",
  // CADILLAC
  "2013 XTS Limousine"                                    : "Cadillac XTS Limousine",
  "2016 CTS-V Sedan"                                      : "Cadillac CTS-V Sedan",
  "2016 ATS-V"                                            : "Cadillac ATS-V",
  "2022 CT4-V Blackwing"                                  : "Cadillac CT4-V Blackwing",
  "2022 CT5-V Blackwing"                                  : "Cadillac CT5-V Blackwing",
  // CAN-AM
  "2018 Maverick X RS Turbo R"                            : "Can-Am Maverick X RS Turbo R",
  // CASEY CURRIE MOTORSPORTS
  "2019 #4402 Ultra 4 Trophy Jeep"                        : "Casey Currie Motorsports 4402 Ultra 4 Trophy Jeep",
  // CHEVROLET
  "1953 Corvette"                                         : "Chevrolet Corvette",
  "1955 150 Utility Sedan"                                : "Chevrolet 150 Utility Sedan",
  "1957 Bel Air"                                          : "Chevrolet Bel Air",
  "1960 Corvette"                                         : "Chevrolet Corvette",
  "1964 Impala Super Sport 409"                           : "Chevrolet Impala Super Sport 409",
  "1967 Corvette Stingray 427"                            : "Chevrolet Corvette Stingray 427",
  "1969 Nova Super Sport 396"                             : "Chevrolet Nova Super Sport 396",
  "1969 Camaro Super Sport Coupe"                         : "Chevrolet Camaro Super Sport Coupe",
  "1970 Camaro Z28"                                       : "Chevrolet Camaro Z28",
  "1970 El Camino Super Sport 454"                        : "Chevrolet El Camino Super Sport 454",
  "1970 Chevelle Super Sport 454"                         : "Chevrolet Chevelle Super Sport 454",
  "1970 Corvette ZR-1"                                    : "Chevrolet Corvette ZR-1",
  "1972 K-10 Custom"                                      : "Chevrolet K-10 Custom",
  "1979 Camaro Z28"                                       : "Chevrolet Camaro Z28",
  "1988 Monte Carlo Super Sport"                          : "Chevrolet Monte Carlo Super Sport",
  "1995 Corvette ZR-1"                                    : "Chevrolet Corvette ZR-1",
  "1996 Impala Super Sport"                               : "Chevrolet Impala Super Sport",
  "2002 Corvette Z06"                                     : "Chevrolet Corvette Z06",
  "2009 Corvette ZR1"                                     : "Chevrolet Corvette ZR1",
  "2015 Camaro Z/28"                                      : "Chevrolet Camaro Z/28",
  "2015 Corvette Z06"                                     : "Chevrolet Corvette Z06",
  "2017 Camaro ZL1"                                       : "Chevrolet Camaro ZL1",
  "2018 Camaro ZL1 1LE"                                   : "Chevrolet Camaro ZL1 1LE",
  "2019 Corvette ZR1"                                     : "Chevrolet Corvette ZR1",
  "2020 Silverado LT Trail Boss"                          : "Chevrolet Silverado LT Trail Boss",
  "2020 Corvette Stingray Coupe"                          : "Chevrolet Corvette Stingray Coupe",
  "2023 Corvette Z06"                                     : "Chevrolet Corvette Z06",
  "2024 Corvette E-Ray"                                   : "Chevrolet Corvette E-Ray",
  // DATSUN
  "1969 2000 Roadster"                                    : "Datsun 2000 Roadster",
  "1970 510"                                              : "Datsun 510",
  "1972 #269 240Z Hill Climb Beast"                       : "Datsun 269 240Z Hill Climb Beast",
  // DEBERTI
  "2018 Jeep Wrangler Unlimited"                          : "DeBerti Jeep Wrangler Unlimited",
  "2018 Chevrolet Silverado 1500 Drift Truck"             : "DeBerti Chevrolet Silverado 1500 Drift Truck",
  "2019 Ford Super Duty F-250 Lariat"                     : "DeBerti Ford Super Duty F-250 Lariat",
  "2019 Toyota Tacoma TRD"                                : "DeBerti Toyota Tacoma TRD",
  // DELOREAN
  "1982 DMC-12"                                           : "DeLorean DMC-12",
  // DODGE
  "1968 Dart HEMI Super Stock"                            : "Dodge Dart HEMI Super Stock",
  "1969 Charger Daytona Hemi"                             : "Dodge Charger Daytona Hemi",
  "1969 Charger R/T"                                      : "Dodge Charger R/T",
  "1970 Coronet Super Bee"                                : "Dodge Coronet Super Bee",
  "1970 Challenger R/T"                                   : "Dodge Challenger R/T",
  "1999 Viper GTS ACR Forza Edition"                      : "Dodge Viper GTS ACR Forza Edition",
  "1999 Viper GTS ACR"                                    : "Dodge Viper GTS ACR",
  "2006 Ram SRT-10"                                       : "Dodge Ram SRT-10",
  "2008 Viper SRT-10 ACR"                                 : "Dodge Viper SRT-10 ACR",
  "2015 Charger SRT Hellcat"                              : "Dodge Charger SRT Hellcat",
  "2015 Challenger SRT Hellcat"                           : "Dodge Challenger SRT Hellcat",
  "2016 Viper ACR"                                        : "Dodge Viper ACR",
  "2018 Challenger SRT Demon"                             : "Dodge Challenger SRT Demon",
  "2021 Durango SRT Hellcat"                              : "Dodge Durango SRT Hellcat",
  "2022 Challenger SRT Super Stock"                       : "Dodge Challenger SRT Super Stock",
  // FERRARI
  "1962 250 GTO"                                          : "Ferrari 250 GTO",
  "1962 250 GT Berlinetta Lusso"                          : "Ferrari 250 GT Berlinetta Lusso",
  "1967 #24 Ferrari SPA 330 P4"                           : "Ferrari 24 Ferrari SPA 330 P4",
  "1969 Dino 246 GT"                                      : "Ferrari Dino 246 GT",
  "1967 275 GTB4 Spider"                                  : "Ferrari 275 GTB4 Spider",
  "1970 512 S"                                            : "Ferrari 512 S",
  "1984 288 GTO"                                          : "Ferrari 288 GTO",
  "1987 F40"                                              : "Ferrari F40",
  "1989 F40 Competizione"                                 : "Ferrari F40 Competizione",
  "1992 512 TR"                                           : "Ferrari 512 TR",
  "1994 F355 Berlinetta"                                  : "Ferrari F355 Berlinetta",
  "1995 F50"                                              : "Ferrari F50",
  "1996 F50 GT"                                           : "Ferrari F50 GT",
  "2002 Enzo Ferrari"                                     : "Ferrari Enzo Ferrari",
  "2005 FXX"                                              : "Ferrari FXX",
  "2007 430 Scuderia"                                     : "Ferrari 430 Scuderia",
  "2009 458 Italia"                                       : "Ferrari 458 Italia",
  "2010 599XX"                                            : "Ferrari 599XX",
  "2012 599XX Evolution"                                  : "Ferrari 599XX Evolution",
  "2013 LaFerrari"                                        : "Ferrari LaFerrari",
  "2013 458 Speciale"                                     : "Ferrari 458 Speciale",
  "2014 FXX K"                                            : "Ferrari FXX K",
  "2015 488 GTB"                                          : "Ferrari 488 GTB",
  "2015 F12TDF"                                           : "Ferrari F12tdf",
  "2017 812 Superfast"                                    : "Ferrari 812 Superfast",
  "2017 J50"                                              : "Ferrari J50",
  "2017 J50 Preorder Car"                                 : "Ferrari J50 Preorder Car",
  "2018 FXX-K Evo"                                        : "Ferrari FXX-K Evo",
  "2018 Portofino"                                        : "Ferrari Portofino",
  "2018 FXX-K Evo Welcome Pack"                           : "Ferrari FXX-K Evo Welcome Pack",
  "2019 F8 Tributo"                                       : "Ferrari F8 Tributo",
  "2019 Monza SP2"                                        : "Ferrari Monza SP2",
  "2019 488 Pista"                                        : "Ferrari 488 Pista",
  "2020 SF90 Stradale"                                    : "Ferrari SF90 Stradale",
  "2020 ROMA"                                             : "Ferrari Roma",
  "2022 296 GTB"                                          : "Ferrari 296 GTB",
  "2025 F80"                                              : "Ferrari F80",
  // FORD
  "1932 De Luxe Five-Window Coupe"                        : "Ford De Luxe Five-Window Coupe",
  "1965 Mustang GT Coupe"                                 : "Ford Mustang GT Coupe",
  "1966 #2 GT40 Mk II"                                    : "Ford 2 GT40 Mk II",
  "1968 Mustang 2+2 Fastback FORZA EDITION"               : "Ford Mustang 2+2 Fastback Forza Edition",
  "1968 Mustang 2+2 Fastback"                             : "Ford Mustang 2+2 Fastback",
  "1969 Mustang Boss 302"                                 : "Ford Mustang Boss 302",
  "1973 XB Falcon GT"                                     : "Ford XB Falcon GT",
  "1973 Capri RS3100"                                     : "Ford Capri RS3100",
  "1977 #5 Escort RS1800 Mk II"                           : "Ford 5 Escort RS1800 Mk II",
  "1985 RS200 Evolution"                                  : "Ford RS200 Evolution",
  "1986 F-150 XLT LARIAT FORZA EDITION"                   : "Ford F-150 XLT LARIAT Forza Edition",
  "1986 F-150 XLT Lariat"                                 : "Ford F-150 XLT Lariat",
  "1987 Sierra Cosworth RS500"                            : "Ford Sierra Cosworth RS500",
  "1992 Escort RS Cosworth"                               : "Ford Escort RS Cosworth",
  "1993 Mustang SVT Cobra R"                              : "Ford Mustang SVT Cobra R",
  "1994 Supervan 3"                                       : "Ford Supervan 3",
  "1999 Racing Puma"                                      : "Ford Racing Puma",
  "2000 Mustang SVT Cobra R"                              : "Ford Mustang SVT Cobra R",
  "2001 #4 Ford Focus RS"                                 : "Ford 4 Ford Focus RS",
  "2003 Focus RS"                                         : "Ford Focus RS",
  "2003 F-150 SVT Lightning"                              : "Ford F-150 SVT Lightning",
  "2005 GT"                                               : "Ford GT",
  "2009 Focus RS"                                         : "Ford Focus RS",
  "2010 Crown Victoria Police Interceptor"                : "Ford Crown Victoria Police Interceptor",
  "2011 Transit SuperSportVan"                            : "Ford Transit SuperSportVan",
  "2013 Mustang Shelby GT500"                             : "Ford Mustang Shelby GT500",
  "2014 #11 Rockstar F-150 Trophy Truck"                  : "Ford 11 Rockstar F-150 Trophy Truck",
  "2014 FPV Limited Edition Pursuit Ute"                  : "Ford FPV Limited Edition Pursuit Ute",
  "2014 Range T6 Rally Raid"                              : "Ford Range T6 Rally Raid",
  "2016 Mustang Shelby GT350R"                            : "Ford Mustang Shelby GT350R",
  "2017 Focus RS"                                         : "Ford Focus RS",
  "2017 GT"                                               : "Ford GT",
  "2017 Brocky Ultra4 Bronco RTR"                         : "Ford Brocky Ultra4 Bronco RTR",
  "2017 M-Sport Fiesta RS"                                : "Ford M-Sport Fiesta RS",
  "2018 Mustang RTR Spec 5"                               : "Ford Mustang RTR Spec 5",
  "2020 Mustang Shelby GT500"                             : "Ford Mustang Shelby GT500",
  "2020 Super Duty F-450 DRW Platinum"                    : "Ford Super Duty F-450 DRW Platinum",
  "2022 Bronco Raptor"                                    : "Ford Bronco Raptor",
  "2022 Supervan 4"                                       : "Ford Supervan 4",
  "2022 F-150 Lightning"                                  : "Ford F-150 Lightning",
  "2022 Focus ST"                                         : "Ford Focus ST",
  "2023 F-150 Raptor R Welcome Pack"                      : "Ford F-150 Raptor R Welcome Pack",
  "2023 Fiesta ST"                                        : "Ford Fiesta ST",
  "2023 F-150 Raptor R"                                   : "Ford F-150 Raptor R",
  "2024 Mustang Dark Horse"                               : "Ford Mustang Dark Horse",
  "2024 Mustang GT"                                       : "Ford Mustang GT",
  // FORMULA DRIFT
  "1989 #98 BMW 325i"                                     : "Formula Drift 98 BMW 325i",
  "1995 #34 Toyota Supra MkIV"                            : "Formula Drift 34 Toyota Supra MkIV",
  "1997 #777 Nissan 240SX"                                : "Formula Drift 777 Nissan 240SX",
  "2006 #43 Dodge Viper SRT-10 ACR"                       : "Formula Drift 43 Dodge Viper SRT-10 ACR",
  "2007 #117 Ferrari 599 GTB Fiorano"                     : "Formula Drift 117 Ferrari 599 GTB Fiorano",
  "2009 #99 Mazda RX-8"                                   : "Formula Drift 99 Mazda RX-8",
  "2013 #777 Chevrolet Corvette"                          : "Formula Drift 777 Chevrolet Corvette",
  "2015 #13 Ford Mustang"                                 : "Formula Drift 13 Ford Mustang",
  "2016 #530 HSV Maloo Gen-F"                             : "Formula Drift 530 HSV Maloo Gen-F",
  "2019 #411 Toyota Corolla Hatchback"                    : "Formula Drift 411 Toyota Corolla Hatchback",
  "2020 #91 BMW M2"                                       : "Formula Drift 91 BMW M2",
  "2020 #151 Toyota GR Supra"                             : "Formula Drift 151 Toyota GR Supra",
  "2023 #64 Nissan Z"                                     : "Formula Drift 64 Nissan Z",
  // GMC
  "1970 Jimmy"                                            : "GMC Jimmy",
  "1991 Syclone"                                          : "GMC Syclone",
  "1992 Typhoon"                                          : "GMC Typhoon",
  "2022 EV Hummer Pickup"                                 : "GMC EV Hummer Pickup",
  // GORDON MURRAY AUTOMOTIVE
  "2022 T.50"                                             : "Gordon Murray Automotive T.50",
  // GR
  "2025 GT Prototype"                                     : "GR GT Prototype",
  // HENNESSEY
  "2012 Venom GT"                                         : "Hennessey Venom GT",
  "2019 Ford F-150 Velociraptor 6x6"                      : "Hennessey Ford F-150 Velociraptor 6x6",
  "2021 Venom F5"                                         : "Hennessey Venom F5",
  // HOLDEN
  "1977 Torana A9X"                                       : "Holden Torana A9X",
  // HONDA
  "1970 S800"                                             : "Honda S800",
  "1974 Civic RS"                                         : "Honda Civic RS",
  "1984 Civic CRX Mugen"                                  : "Honda Civic CRX Mugen",
  "1984 City E II"                                        : "Honda City E II",
  "1986 Civic Si"                                         : "Honda Civic Si",
  "1990 #19 CRX WTAC"                                     : "Honda 19 CRX WTAC",
  "1991 CR-X SIR"                                         : "Honda CR-X SIR",
  "1991 Beat"                                             : "Honda Beat",
  "1992 NSX-R"                                            : "Honda NSX-R",
  "1992 #21 Hardrace Civic WTAC"                          : "Honda 21 Hardrace Civic WTAC",
  "1994 Prelude Si"                                       : "Honda Prelude Si",
  "1994 Acty"                                             : "Honda Acty",
  "1997 Civic Type R"                                     : "Honda Civic Type R",
  "2001 #33 Integra WTAC"                                 : "Honda 33 Integra WTAC",
  "2003 S2000"                                            : "Honda S2000",
  "2004 Civic Type R"                                     : "Honda Civic Type R",
  "2004 #52 Evasive S2000 WTAC"                           : "Honda 52 Evasive S2000 WTAC",
  "2005 NSX-R"                                            : "Honda NSX-R",
  "2005 NSX-R GT"                                         : "Honda NSX-R GT",
  "2007 Civic Type R"                                     : "Honda Civic Type R",
  "2008 Civic Type R"                                     : "Honda Civic Type R",
  "2015 Ridgeline Baja Trophy Truck"                      : "Honda Ridgeline Baja Trophy Truck",
  "2015 Civic Type R"                                     : "Honda Civic Type R",
  "2018 Civic Type R"                                     : "Honda Civic Type R",
  "2022 e"                                                : "Honda e",
  "2023 Civic Type R"                                     : "Honda Civic Type R",
  // HSV
  "2014 Limited Edition Gen-F GTS Maloo"                  : "HSV Limited Edition Gen-F GTS Maloo",
  "2014 Gen-F GTS"                                        : "HSV Gen-F GTS",
  // HYUNDAI
  "2019 Veloster N"                                       : "Hyundai Veloster N",
  "2020 i30 N"                                            : "Hyundai i30 N",
  "2021 i20 N"                                            : "Hyundai i20 N",
  "2022 N Vision 74"                                      : "Hyundai N Vision 74",
  "2023 IONIQ 5 N"                                        : "Hyundai IONIQ 5 N",
  // JAGUAR
  "1956 D-Type"                                           : "Jaguar D-Type",
  "1961 E-Type"                                           : "Jaguar E-Type",
  "1964 Lightweight E-Type"                               : "Jaguar Lightweight E-Type",
  "1991 Sport XJR-15"                                     : "Jaguar Sport XJR-15",
  "1993 XJ220"                                            : "Jaguar XJ220",
  "1993 XJ220S TWR"                                       : "Jaguar XJ220S TWR",
  "2010 C-X75"                                            : "Jaguar C-X75",
  // JEEP
  "2012 Wrangler Rubicon"                                 : "Jeep Wrangler Rubicon",
  "2016 Trailcat"                                         : "Jeep Trailcat",
  "2018 Grand Cherokee Trackhawk"                         : "Jeep Grand Cherokee Trackhawk",
  "2020 JT"                                               : "Jeep JT",
  // JIMCO
  "2019 #240 Fastball Racing Trophy Truck"                : "Jimco 240 Fastball Racing Trophy Truck",
  "2020 #179 Hammerhead Class 1"                          : "Jimco 179 Hammerhead Class 1",
  // KOENIGSEGG
  "2008 CCGT"                                             : "Koenigsegg CCGT",
  "2011 Agera"                                            : "Koenigsegg Agera",
  "2015 ONE:1"                                            : "Koenigsegg One:1",
  "2016 Regera"                                           : "Koenigsegg Regera",
  "2017 Agera RS"                                         : "Koenigsegg Agera RS",
  "2020 Jesko"                                            : "Koenigsegg Jesko",
  "2024 Gemera"                                           : "Koenigsegg Gemera",
  // KTM
  "2018 X-Bow GT4"                                        : "KTM X-Bow GT4",
  // LAMBORGHINI
  "1967 Miura P400"                                       : "Lamborghini Miura P400",
  "1988 Countach LP5000 QV"                               : "Lamborghini Countach LP5000 QV",
  "1997 Diablo SV"                                        : "Lamborghini Diablo SV",
  "1999 Diablo GTR"                                       : "Lamborghini Diablo GTR",
  "2010 Murciélago LP 670-4 SV"                           : "Lamborghini Murcielago LP 670-4 SV",
  "2011 Sesto Elemento"                                   : "Lamborghini Sesto Elemento",
  "2012 Gallardo LP570-4 Spyder Performante"              : "Lamborghini Gallardo LP570-4 Spyder Performante",
  "2012 Aventador LP700-4"                                : "Lamborghini Aventador LP700-4",
  "2013 Veneno"                                           : "Lamborghini Veneno",
  "2014 Huracán LP 610-4"                                 : "Lamborghini Huracan LP 610-4",
  "2016 Centenario LP 770-4"                              : "Lamborghini Centenario LP 770-4",
  "2018 Aventador SVJ"                                    : "Lamborghini Aventador SVJ",
  "2019 Urus"                                             : "Lamborghini Urus",
  "2020 Sián Roadster"                                    : "Lamborghini Sian Roadster",
  "2020 Essenza SCV12"                                    : "Lamborghini Essenza SCV12",
  "2020 Huracán STO"                                      : "Lamborghini Huracan STO",
  "2020 Huracán EVO"                                      : "Lamborghini Huracan EVO",
  "2021 Aventador LP 780-4 Ultimae"                       : "Lamborghini Aventador LP 780-4 Ultimae",
  "2021 Countach LPI 800-4"                               : "Lamborghini Countach LPI 800-4",
  "2022 Huracán Tecnica"                                  : "Lamborghini Huracan Tecnica",
  "2022 Huracán Sterrato"                                 : "Lamborghini Huracan Sterrato",
  "2024 Revuelto"                                         : "Lamborghini Revuelto",
  // LANCIA
  "1974 Stratos HF Stradale"                              : "Lancia Stratos HF Stradale",
  "1986 Delta S4"                                         : "Lancia Delta S4",
  "1992 Delta HF Integrale Evo"                           : "Lancia Delta HF Integrale Evo",
  // LAND ROVER
  "2015 Range Rover Sport SVR"                            : "Land Rover Range Rover Sport SVR",
  "2020 Defender 110 X"                                   : "Land Rover Defender 110 X",
  // LEXUS
  "2010 LFA Forza Edition"                                : "Lexus LFA Forza Edition",
  "2010 LFA"                                              : "Lexus LFA",
  "2015 RC F"                                             : "Lexus RC F",
  "2021 LC 500"                                           : "Lexus LC 500",
  // LINCOLN
  "1962 Continental"                                      : "Lincoln Continental",
  // LOTUS
  "1997 Elise GT1"                                        : "Lotus Elise GT1",
  "1999 Elise Series 1 Sport 190"                         : "Lotus Elise Series 1 Sport 190",
  "2018 Exige Cup 430"                                    : "Lotus Exige Cup 430",
  "2018 Scura Motorsport Exige WTAC"                      : "Lotus Scura Motorsport Exige WTAC",
  "2020 Evija"                                            : "Lotus Evija",
  "2020 Evija Forza Edition"                              : "Lotus Evija Forza Edition",
  "2023 Emira"                                            : "Lotus Emira",
  // LUCID
  "2024 Air Sapphire"                                     : "Lucid Air Sapphire",
  // MASERATI
  "1997 Ghibli Cup"                                       : "Maserati Ghibli Cup",
  "2004 MC12"                                             : "Maserati MC12",
  "2008 MC12 Versione Corsa"                              : "Maserati MC12 Versione Corsa",
  "2022 MC20"                                             : "Maserati MC20",
  // MAZDA
  "1972 Cosmo 110S Series II"                             : "Mazda Cosmo 110S Series II",
  "1973 RX-3 Forza Edition"                               : "Mazda RX-3 Forza Edition",
  "1973 RX-3"                                             : "Mazda RX-3",
  "1974 #123 Mad Mike 808 Wagon"                          : "Mazda 123 Mad Mike 808 Wagon",
  "1985 RX-7 GSL-SE"                                      : "Mazda RX-7 GSL-SE",
  "1990 Savanna RX-7"                                     : "Mazda Savanna RX-7",
  "1991 #55 Mazda 787B"                                   : "Mazda 55 Mazda 787B",
  "1992 RX-7 Type R"                                      : "Mazda RX-7 Type R",
  "1994 MX-5 Miata Forza Edition"                         : "Mazda MX-5 Miata Forza Edition",
  "1994 MX-5 Miata"                                       : "Mazda MX-5 Miata",
  "2005 Mazdaspeed MX-5"                                  : "Mazda Mazdaspeed MX-5",
  "2008 Furai"                                            : "Mazda Furai",
  "2010 Mazdaspeed 3"                                     : "Mazda Mazdaspeed 3",
  "2011 RX-8 R3"                                          : "Mazda RX-8 R3",
  "2013 MX-5"                                             : "Mazda MX-5",
  "2016 MX-5"                                             : "Mazda MX-5",
  "2017 MX-5 Cup"                                         : "Mazda MX-5 Cup",
  "2022 MX-5 Miata RF"                                    : "Mazda MX-5 Miata RF",
  // MCLAREN
  "1993 F1"                                               : "McLaren F1",
  "1997 F1 GT"                                            : "McLaren F1 GT",
  "2011 12C Coupé"                                        : "McLaren 12C Coupé",
  "2013 P1"                                               : "McLaren P1",
  "2014 650S Spider"                                      : "McLaren 650S Spider",
  "2015 570S Coupé"                                       : "McLaren 570S Coupé",
  "2018 600LT Coupé"                                      : "McLaren 600LT Coupé",
  "2019 Speedtail"                                        : "McLaren Speedtail",
  "2021 Sabre"                                            : "McLaren Sabre",
  "2021 620R"                                             : "McLaren 620R",
  "2021 765LT Coupé"                                      : "McLaren 765LT Coupé",
  "2023 Artura"                                           : "McLaren Artura",
  // MERCEDES-AMG
  "2015 GT S"                                             : "Mercedes-AMG GT S",
  "2016 C 63 S Coupé"                                     : "Mercedes-AMG C 63 S Coupé",
  "2017 GT R"                                             : "Mercedes-AMG GT R",
  "2018 E 63 S"                                           : "Mercedes-AMG E 63 S",
  "2018 GT 4-Door Coupé"                                  : "Mercedes-AMG GT 4-Door Coupé",
  "2020 GT Black Series Welcome Pack"                     : "Mercedes-AMG GT Black Series Welcome Pack",
  "2020 SLC 43 Final Edition"                             : "Mercedes-AMG SLC 43 Final Edition",
  "2020 GT Black Series"                                  : "Mercedes-AMG GT Black Series",
  "2021 SL 63"                                            : "Mercedes-AMG SL 63",
  "2021 AMG One"                                          : "Mercedes-AMG One",
  // MERCEDES-BENZ
  "1954 300 SL Coupé"                                     : "Mercedes-Benz 300 SL Coupé",
  "1955 300 SLR"                                          : "Mercedes-Benz 300 SLR",
  "1987 AMG Hammer Coupe"                                 : "Mercedes-Benz AMG Hammer Coupe",
  "1990 190 E 2.5-16 Evo II FORZA EDITION"                : "Mercedes-Benz 190 E 2.5-16 Evo II Forza Edition",
  "1990 190 E 2.5-16 Evolution II"                        : "Mercedes-Benz 190 E 2.5-16 Evolution II",
  "1998 AMG CLK GTR"                                      : "Mercedes-Benz AMG CLK GTR",
  "2009 SL 65 AMG Black Series"                           : "Mercedes-Benz SL 65 AMG Black Series",
  "2012 C 63 AMG Coupé Black Series"                      : "Mercedes-Benz C 63 AMG Coupé Black Series",
  "2013 G 65 AMG"                                         : "Mercedes-Benz G 65 AMG",
  "2013 A 45 AMG"                                         : "Mercedes-Benz A 45 AMG",
  "2014 Unimog U5023"                                     : "Mercedes-Benz Unimog U5023",
  "2014 G 65 AMG 6x6"                                     : "Mercedes-Benz G 65 AMG 6x6",
  "2018 X-Class"                                          : "Mercedes-Benz X-Class",
  // MEYERS
  "1971 Manx"                                             : "Meyers Manx",
  "2023 Manx 2.0"                                         : "Meyers Manx 2.0",
  // MG
  "1986 Metro 6R4"                                        : "MG Metro 6R4",
  // MINI
  "1965 Cooper S"                                         : "MINI Cooper S",
  "2012 John Cooper Works GP"                             : "MINI John Cooper Works GP",
  "2013 X-Raid All4 Racing Countryman"                    : "MINI X-Raid All4 Racing Countryman",
  "2018 X-Raid John Cooper Works Buggy"                   : "MINI X-Raid John Cooper Works Buggy",
  "2021 John Cooper Works GP"                             : "MINI John Cooper Works GP",
  // MITSUBISHI
  "1990 #269 Minicab Time Attack"                         : "Mitsubishi 269 Minicab Time Attack",
  "1992 Galant VR-4"                                      : "Mitsubishi Galant VR-4",
  "1995 Eclipse GSX"                                      : "Mitsubishi Eclipse GSX",
  "1995 Montero Exceed 2800 TD"                           : "Mitsubishi Montero Exceed 2800 TD",
  "1995 Lancer Evolution III GSR"                         : "Mitsubishi Lancer Evolution III GSR",
  "1997 Montero Evolution"                                : "Mitsubishi Montero Evolution",
  "1997 GTO"                                              : "Mitsubishi GTO",
  "2001 Lancer Evolution VI GSR TM Edition"               : "Mitsubishi Lancer Evolution VI GSR TM Edition",
  "2004 Lancer Evolution VIII MR"                         : "Mitsubishi Lancer Evolution VIII MR",
  "2004 Lancer Evolution VIII MR Welcome Pack"            : "Mitsubishi Lancer Evolution VIII MR Welcome Pack",
  "2005 #1 Lancer Evolution Time Attack"                  : "Mitsubishi 1 Lancer Evolution Time Attack",
  "2006 Lancer Evolution IX MR"                           : "Mitsubishi Lancer Evolution IX MR",
  "2008 Lancer Evolution X GSR"                           : "Mitsubishi Lancer Evolution X GSR",
  // NISSAN
  "1969 Fairlady Z 432"                                   : "Nissan Fairlady Z 432",
  "1971 Skyline 2000GT-R"                                 : "Nissan Skyline 2000GT-R",
  "1973 Skyline H/T 2000GT-R"                             : "Nissan Skyline H/T 2000GT-R",
  "1983 #11 Tomica Skyline Turbo Super Silhouette"        : "Nissan 11 Tomica Skyline Turbo Super Silhouette",
  "1985 Safari Turbo"                                     : "Nissan Safari Turbo",
  "1987 Skyline GTS-R"                                    : "Nissan Skyline GTS-R",
  "1987 BE-1"                                             : "Nissan BE-1",
  "1989 S-Cargo Forza Edition"                            : "Nissan S-Cargo Forza Edition",
  "1989 Silvia K's"                                       : "Nissan Silvia K's",
  "1989 PAO"                                              : "Nissan PAO",
  "1989 S-Cargo"                                          : "Nissan S-Cargo",
  "1990 #12 Skyline GT-R BNR32 GR.A JTC"                  : "Nissan 12 Skyline GT-R BNR32 GR.A JTC",
  "1990 Pulsar GTI-R"                                     : "Nissan Pulsar GTI-R",
  "1991 Figaro"                                           : "Nissan Figaro",
  "1992 Skyline GT-R"                                     : "Nissan Skyline GT-R",
  "1993 240SX"                                            : "Nissan 240SX",
  "1993 #32 Skyline WTAC Xtreme GTR"                      : "Nissan 32 Skyline WTAC Xtreme GTR",
  "1994 Silvia K's"                                       : "Nissan Silvia K's",
  "1994 Fairlady Z Version S Twin Turbo"                  : "Nissan Fairlady Z Version S Twin Turbo",
  "1995 NISMO GT-R LM"                                    : "Nissan NISMO GT-R LM",
  "1995 Gloria Gran Turismo"                              : "Nissan Gloria Gran Turismo",
  "1997 Skyline GT-R V-Spec"                              : "Nissan Skyline GT-R V-Spec",
  "1997 Stagea RS Four V"                                 : "Nissan Stagea RS Four V",
  "1998 Silvia K's Aero"                                  : "Nissan Silvia K's Aero",
  "1998 R390 GT1"                                         : "Nissan R390 GT1",
  "1998 #23 Pennzoil NISMO Skyline GT-R"                  : "Nissan 23 Pennzoil NISMO Skyline GT-R",
  "1998 Skyline GT-R 40th Anniversary"                    : "Nissan Skyline GT-R 40th Anniversary",
  "2000 #36 Dream Project S15 Silvia WTAC"                : "Nissan 36 Dream Project S15 Silvia WTAC",
  "2000 Skyline GT-R V-Spec II"                           : "Nissan Skyline GT-R V-Spec II",
  "2002 Silvia Spec-R"                                    : "Nissan Silvia Spec-R",
  "2003 Fairlady Z"                                       : "Nissan Fairlady Z",
  "2010 370Z"                                             : "Nissan 370Z",
  "2012 GT-R Black Edition R35 FORZA EDITION"             : "Nissan GT-R Black Edition R35 Forza Edition",
  "2012 GT-R Black Edition R35"                           : "Nissan GT-R Black Edition R35",
  "2017 GT-R R35"                                         : "Nissan GT-R R35",
  "2019 370Z NISMO"                                       : "Nissan 370Z NISMO",
  "2020 GT-R NISMO R35"                                   : "Nissan GT-R NISMO R35",
  "2024 GT-R NISMO"                                       : "Nissan GT-R NISMO",
  "2024 Z NISMO"                                          : "Nissan Z NISMO",
  // NOBLE
  "2010 M600"                                             : "Noble M600",
  // OPEL
  "1984 Manta 400"                                        : "Opel Manta 400",
  // PAGANI
  "2009 Zonda R"                                          : "Pagani Zonda R",
  "2010 Zonda Cinque Roadster"                            : "Pagani Zonda Cinque Roadster",
  "2016 Huayra BC Coupe"                                  : "Pagani Huayra BC Coupe",
  "2021 Huayra R"                                         : "Pagani Huayra R",
  // PEEL
  "1962 P50"                                              : "Peel P50",
  "1962 P50 Trolli Edition"                               : "Peel P50 Trolli Edition",
  // PENHALL
  "2011 The Cholla"                                       : "Penhall The Cholla",
  // PEUGEOT
  "1984 205 Turbo 16"                                     : "Peugeot 205 Turbo 16",
  "1991 205 Rallye"                                       : "Peugeot 205 Rallye",
  "2007 207 Super 2000"                                   : "Peugeot 207 Super 2000",
  // PLYMOUTH
  "1958 Fury"                                             : "Plymouth Fury",
  "1968 Barracuda Formula S"                              : "Plymouth Barracuda Formula S",
  "1971 Cuda 426 Hemi"                                    : "Plymouth Cuda 426 Hemi",
  // POLARIS
  "2021 RZR Pro XP Ultimate"                              : "Polaris RZR Pro XP Ultimate",
  "2021 RZR Pro XP Factory Racing Limited"                : "Polaris RZR Pro XP Factory Racing Limited",
  // PONTIAC
  "1977 Firebird Trans Am"                                : "Pontiac Firebird Trans Am",
  "1987 Firebird Trans Am GTA"                            : "Pontiac Firebird Trans Am GTA",
  // PORSCHE
  "1970 #3 917 LH"                                        : "Porsche 3 917 LH",
  "1970 #3 917 LH FORZA EDITION"                          : "Porsche 3 917 LH Forza Edition",
  "1973 911 Carrera RS"                                   : "Porsche 911 Carrera RS",
  "1982 911 Turbo 3.3"                                    : "Porsche 911 Turbo 3.3",
  "1986 #185 959 Prodrive Rally Raid"                     : "Porsche 185 959 Prodrive Rally Raid",
  "1987 959"                                              : "Porsche 959",
  "1989 944 Turbo"                                        : "Porsche 944 Turbo",
  "1993 968 Turbo S"                                      : "Porsche 968 Turbo S",
  "1993 928 GTS"                                          : "Porsche 928 GTS",
  "1993 911 Turbo S Leichtbau"                            : "Porsche 911 Turbo S Leichtbau",
  "1995 911 GT2"                                          : "Porsche 911 GT2",
  "1998 911 GT1 Strassenversion"                          : "Porsche 911 GT1 Strassenversion",
  "2003 Carrera GT"                                       : "Porsche Carrera GT",
  "2004 911 GT3"                                          : "Porsche 911 GT3",
  "2005 Cayman GT3 WTAC"                                  : "Porsche Cayman GT3 WTAC",
  "2012 911 GT3 RS 4.0"                                   : "Porsche 911 GT3 RS 4.0",
  "2014 918 Spyder"                                       : "Porsche 918 Spyder",
  "2018 911 GT2 RS"                                       : "Porsche 911 GT2 RS",
  "2018 Cayenne Turbo"                                    : "Porsche Cayenne Turbo",
  "2018 718 Cayman GTS"                                   : "Porsche 718 Cayman GTS",
  "2018 Macan LPR Rally Raid"                             : "Porsche Macan LPR Rally Raid",
  "2019 #70 Porsche Motorsport 935"                       : "Porsche 70 Porsche Motorsport 935",
  "2019 911 Carrera S"                                    : "Porsche 911 Carrera S",
  "2019 911 GT3 RS"                                       : "Porsche 911 GT3 RS",
  "2020 Taycan Turbo S"                                   : "Porsche Taycan Turbo S",
  "2021 911 GT3"                                          : "Porsche 911 GT3",
  "2022 718 Cayman GT4 RS"                                : "Porsche 718 Cayman GT4 RS",
  "2022 Mission R"                                        : "Porsche Mission R",
  "2023 911 GT3 RS"                                       : "Porsche 911 GT3 RS",
  "2023 911 Rallye"                                       : "Porsche 911 Rallye",
  "2023 911 Turbo S"                                      : "Porsche 911 Turbo S",
  // RADICAL
  "2015 RXC Turbo"                                        : "Radical RXC Turbo",
  // RAM
  "2024 1500 TRX"                                         : "Ram 1500 TRX",
  // RELIANT
  "1972 Supervan III"                                     : "Reliant Supervan III",
  // RENAULT
  "1967 8 Gordini"                                        : "Renault 8 Gordini",
  "1980 5 Turbo"                                          : "Renault 5 Turbo",
  "1993 Clio Williams"                                    : "Renault Clio Williams",
  "2008 Megane R26.R"                                     : "Renault Megane R26.R",
  "2010 Megane RS 250"                                    : "Renault Megane RS 250",
  "2018 Megane R.S."                                      : "Renault Megane R.S.",
  // RIMAC
  "2021 Nevera"                                           : "Rimac Nevera",
  // RIVIAN
  "2021 R1T"                                              : "Rivian R1T",
  // RJ ANDERSON
  "2016 #37 Polaris RZR Pro 2 Truck"                      : "RJ Anderson 37 Polaris RZR Pro 2 Truck",
  "2021 #37 Polaris RZR Pro 4 Truck"                      : "RJ Anderson 37 Polaris RZR Pro 4 Truck",
  // SALEEN
  "2017 S7 LM"                                            : "Saleen S7 LM",
  // SCHUPPAN
  "1993 962CR"                                            : "Schuppan 962CR",
  // SHELBY
  "1965 Cobra Daytona Coupe"                              : "Shelby Cobra Daytona Coupe",
  "1965 Cobra 427 S/C"                                    : "Shelby Cobra 427 S/C",
  // SIERRA CARS
  "2020 #23 Yokohama Alpha"                               : "SIERRA Cars 23 Yokohama Alpha",
  "2021 700R"                                             : "SIERRA Cars 700R",
  "2021 RX3"                                              : "SIERRA Cars RX3",
  // SRT
  "2013 Viper GTS"                                        : "SRT Viper GTS",
  // SUBARU
  "1980 Brat GL"                                          : "Subaru Brat GL",
  "1990 Legacy RS"                                        : "Subaru Legacy RS",
  "1994 Vivio RX-R Forza Edition"                         : "Subaru Vivio RX-R Forza Edition",
  "1994 Vivio RX-R"                                       : "Subaru Vivio RX-R",
  "1996 SVX"                                              : "Subaru SVX",
  "1998 Impreza 22B-STi Version"                          : "Subaru Impreza 22B-STi Version",
  "2004 Impreza WRX STi"                                  : "Subaru Impreza WRX STi",
  "2005 Legacy B4 2.0 GT"                                 : "Subaru Legacy B4 2.0 GT",
  "2005 Impreza WRX STI"                                  : "Subaru Impreza WRX STI",
  "2008 Impreza WRX STI"                                  : "Subaru Impreza WRX STI",
  "2011 WRX STI"                                          : "Subaru WRX STI",
  "2013 BRZ"                                              : "Subaru BRZ",
  "2015 WRX STI"                                          : "Subaru WRX STI",
  "2018 WRX STI ARX Supercar"                             : "Subaru WRX STI ARX Supercar",
  "2019 STI S209"                                         : "Subaru STI S209",
  "2022 BRZ FORZA EDITION"                                : "Subaru BRZ Forza Edition",
  "2022 BRZ"                                              : "Subaru BRZ",
  "2022 WRX"                                              : "Subaru WRX",
  // TOYOTA
  "1965 Sports 800"                                       : "Toyota Sports 800",
  "1965 Sports 800 Fanta Edition"                         : "Toyota Sports 800 Fanta Edition",
  "1969 2000GT"                                           : "Toyota 2000GT",
  "1974 Corolla SR5"                                      : "Toyota Corolla SR5",
  "1979 FJ40"                                             : "Toyota FJ40",
  "1985 Sprinter Trueno GT Apex Forza Edition"            : "Toyota Sprinter Trueno GT Apex Forza Edition",
  "1985 Sprinter Trueno GT Apex"                          : "Toyota Sprinter Trueno GT Apex",
  "1989 MR2 SC"                                           : "Toyota MR2 SC",
  "1991 Chaser GT Twin Turbo"                             : "Toyota Chaser GT Twin Turbo",
  "1991 Sera"                                             : "Toyota Sera",
  "1992 Supra 2.0 GT"                                     : "Toyota Supra 2.0 GT",
  "1992 Celica GT-Four RC ST185"                          : "Toyota Celica GT-Four RC ST185",
  "1993 #1 Baja T100 Truck"                               : "Toyota 1 Baja T100 Truck",
  "1994 Celica GT-Four ST205"                             : "Toyota Celica GT-Four ST205",
  "1995 MR2 GT"                                           : "Toyota MR2 GT",
  "1995 J&J Motorsport Supra WTAC"                        : "Toyota J&J Motorsport Supra WTAC",
  "1996 Starlet Glanza V"                                 : "Toyota Starlet Glanza V",
  "1997 Soarer 2.5 GT-T"                                  : "Toyota Soarer 2.5 GT-T",
  "1997 Chaser 2.5 Tourer V"                              : "Toyota Chaser 2.5 Tourer V",
  "1998 Supra RZ"                                         : "Toyota Supra RZ",
  "1999 Altezza RS200 Z Edition"                          : "Toyota Altezza RS200 Z Edition",
  "2003 Celica Sport Specialty II"                        : "Toyota Celica Sport Specialty II",
  "2005 Crown Super Deluxe Taxi"                          : "Toyota Crown Super Deluxe Taxi",
  "2013 86"                                               : "Toyota 86",
  "2013 86 Stories"                                       : "Toyota 86 Stories",
  "2016 Land Cruiser Arctic Trucks AT37"                  : "Toyota Land Cruiser Arctic Trucks AT37",
  "2017 JPN Taxi"                                         : "Toyota JPN Taxi",
  "2019 Tacoma TRD Pro Forza Edition"                     : "Toyota Tacoma TRD Pro Forza Edition",
  "2019 4Runner TRD Pro"                                  : "Toyota 4Runner TRD Pro",
  "2019 Tacoma TRD Pro"                                   : "Toyota Tacoma TRD Pro",
  "2020 GR Supra"                                         : "Toyota GR Supra",
  "2021 GR Yaris"                                         : "Toyota GR Yaris",
  "2022 GR86"                                             : "Toyota GR86",
  "2023 Camry TRD"                                        : "Toyota Camry TRD",
  "2023 GR Corolla"                                       : "Toyota GR Corolla",
  "2025 Land Cruiser"                                     : "Toyota Land Cruiser",
  // TVR
  "1998 Cerbera Speed 12"                                 : "TVR Cerbera Speed 12",
  "2005 Sagaris"                                          : "TVR Sagaris",
  "2018 Griffith"                                         : "TVR Griffith",
  // ULTIMA
  "2015 Evolution Coupe 1020"                             : "Ultima Evolution Coupe 1020",
  // VOLKSWAGEN
  "1963 Beetle"                                           : "Volkswagen Beetle",
  "1963 Type 2 De Luxe"                                   : "Volkswagen Type 2 De Luxe",
  "1969 Class 5/1600 Baja Bug"                            : "Volkswagen Class 5/1600 Baja Bug",
  "1982 Pickup LX"                                        : "Volkswagen Pickup LX",
  "1983 Golf GTI"                                         : "Volkswagen Golf GTI",
  "1989 Rallye Golf"                                      : "Volkswagen Rallye Golf",
  "1992 Golf GTI 16V Mk2"                                 : "Volkswagen Golf GTI 16V Mk2",
  "1995 Corrado VR6"                                      : "Volkswagen Corrado VR6",
  "2010 Golf R"                                           : "Volkswagen Golf R",
  "2011 Scirocco R"                                       : "Volkswagen Scirocco R",
  "2014 Golf R"                                           : "Volkswagen Golf R",
  "2017 #34 Andretti Rally Cross Beetle"                  : "Volkswagen 34 Andretti Rally Cross Beetle",
  "2021 Golf R"                                           : "Volkswagen Golf R",
  "2022 Golf R"                                           : "Volkswagen Golf R",
  // VOLVO
  "1983 242 Turbo Evolution"                              : "Volvo 242 Turbo Evolution",
  // WULING
  "2013 Sunshine S"                                       : "Wuling Sunshine S",
  "2020 Sunshine S FORZA EDITION"                         : "Wuling Sunshine S Forza Edition",
  "2022 Hongguang Mini EV"                                : "Wuling Hongguang Mini EV",
  // HONDA
  "2003 S2000 Touge Edition"                              : "Honda S2000 Touge Edition",
  "Honda Acty Rakuraku Express"                           : "Honda Acty Rakuraku Express",
  // MAZDA
  "1990 MX-5 Miata"                                       : "Mazda MX-5 Miata",
  // NISSAN
  "1993 Skyline GT-R V-Spec"                              : "Nissan Skyline GT-R V-Spec",
  "2012 GT-R Black Edition R35 Touge Edition"             : "Nissan GT-R Black Edition R35 Touge Edition",
  // TOYOTA
  "1985 Sprinter Trueno GT Apex Touge Edition"            : "Toyota Sprinter Trueno GT Apex Touge Edition",
  // DODGE
  "2013 SRT Viper GTS"                                    : "Dodge SRT Viper GTS",
  // WULING
  "2013 Sunshine S Forza Edition"                         : "Wuling Sunshine S Forza Edition",
  "2022 Hongguang Mini EV Macaron"                        : "Wuling Hongguang Mini EV Macaron",
  // MEYERS
  "2023 Manx 2.0 EV"                                      : "Meyers Manx 2.0 EV",
  // ZENVO
  "2019 TSR-S"                                            : "Zenvo TSR-S",
};

function getPageTitle(carName) {
  const nameNoYear = carName.replace(/^\d{4}\s+/, "");
  return WIKI_IMG[carName] || WIKI_IMG[nameNoYear] || null;
}

function getCarImageUrl(carName) {
  const title = getPageTitle(carName);
  return title ? getFH6ImageUrl(title) : null;
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const RARITY = {
  X:  { label:"LEGENDARY", bg:"#B8C400", text:"#000" },
  R:  { label:"LEGENDARY", bg:"#B8C400", text:"#000" },
  S2: { label:"EPIC",      bg:"#8B3DB8", text:"#fff" },
  S1: { label:"EPIC",      bg:"#8B3DB8", text:"#fff" },
  A:  { label:"RARE",      bg:"#1A5FB4", text:"#fff" },
  B:  { label:"RARE",      bg:"#1A5FB4", text:"#fff" },
  C:  { label:"COMMON",    bg:"#666",    text:"#fff" },
  D:  { label:"COMMON",    bg:"#666",    text:"#fff" },
};
const CLS_COLOR = {
  X:"#B8C400",R:"#B8C400",S2:"#8B3DB8",S1:"#8B3DB8",
  A:"#c0392b",B:"#27ae60",C:"#e07020",D:"#1A5FB4",
};
const ALL_CLASSES = ["D","C","B","A","S1","S2","R","X"];
const CLASS_ORDER = {D:0,C:1,B:2,A:3,S1:4,S2:5,R:6,X:7};
const BRAND_BG = {
  Ferrari:"#C8000A",Lamborghini:"#D4A017",Porsche:"#8B6914",BMW:"#006CB4",
  Audi:"#BB0A21",McLaren:"#E07000","Mercedes-AMG":"#222","Mercedes-Benz":"#333",
  Ford:"#003476",Chevrolet:"#C09000",Toyota:"#EB0A1E",Honda:"#C8000A",
  Nissan:"#BB0A21",Subaru:"#003B96",Mazda:"#800010",Mitsubishi:"#BB0A21",
  Jaguar:"#6a4a20","Alfa Romeo":"#BB0A21","Aston Martin":"#005040",
  Pagani:"#3a3a3a",Koenigsegg:"#8B7030",Dodge:"#BB0A21",Volkswagen:"#001E6E",
  default:"#3a5a4a",
};

function parseClass(cls) {
  if (!cls) return {cls:"?",pi:null};
  const p = String(cls).trim().split(" ");
  return {cls:p[0]||"?",pi:p[1]?parseInt(p[1]):null};
}
function fmtPrice(p) {
  if (!p) return null;
  if (p==="Not Exit Yet"||p==="Xbox Only") return p;
  const n = typeof p==="number"?p:parseFloat(p);
  if (isNaN(n)) return String(p);
  if (n>=1_000_000) return `${(n/1_000_000).toFixed(n%1_000_000===0?0:1)}M Cr`;
  if (n>=1_000) return `${Math.round(n/1000)}K Cr`;
  return `${n} Cr`;
}
function parseSources(src) {
  if (!src) return [];
  const t=[];
  if (src.includes("Treasure Car"))       t.push("TREASURE");
  if (src.includes("Collection Journal")) t.push("COLLECTION");
  if (src.includes("autoshow DLC"))       t.push("DLC");
  else if (src.includes("autoshow"))      t.push("AUTOSHOW");
  if (src.includes("wheel"))              t.push("WHEEL SPIN");
  if (src.includes("seasonal"))           t.push("SEASONAL");
  if (src.includes("loyal"))              t.push("LOYALTY");
  return t.length?t:["OTHER"];
}
const SRC_C = {
  TREASURE:{bg:"#B8C400",t:"#000"},COLLECTION:{bg:"#0a7a6a",t:"#fff"},
  DLC:{bg:"#8B3DB8",t:"#fff"},AUTOSHOW:{bg:"#1A5FB4",t:"#fff"},
  "WHEEL SPIN":{bg:"#5840c8",t:"#fff"},SEASONAL:{bg:"#27ae60",t:"#fff"},
  LOYALTY:{bg:"#c0392b",t:"#fff"},OTHER:{bg:"#888",t:"#fff"},
};

// ─── CAR IMAGE ────────────────────────────────────────────────────────────────
// ─── CAR IMAGE ────────────────────────────────────────────────────────────────
function CarImage({ name, brand }) {
  const [ok, setOk]   = useState(false);
  const [err, setErr] = useState(false);
  const bg       = BRAND_BG[brand] || BRAND_BG.default;
  const initials = brand.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase();
  const imgUrl   = getCarImageUrl(name);

  return (
    <div style={{
      width:"100%", height:130, position:"relative", overflow:"hidden",
      background: ok ? "#eaf0ec" : `${bg}18`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>
      {/* Brand initials — shown while loading or if no FH6 image exists */}
      {(!ok || err) && (
        <div style={{
          width:52, height:52, borderRadius:"50%", background:bg,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Rajdhani',sans-serif", fontWeight:900, fontSize:18, color:"#fff",
          opacity: err || !imgUrl ? 0.4 : 0.8,
        }}>{initials}</div>
      )}

      {/* FH6 render image — direct Special:FilePath URL, browser follows redirect */}
      {imgUrl && !err && (
        <img
          src={imgUrl}
          alt=""
          onLoad={()=>setOk(true)}
          onError={()=>setErr(true)}
          style={{
            position:"absolute", inset:0, width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center 30%",
            opacity: ok ? 1 : 0,
            transition:"opacity 0.4s",
          }}
        />
      )}

      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:45,
        background:"linear-gradient(to top, rgba(248,252,250,0.95), transparent)",
        pointerEvents:"none",
      }}/>
    </div>
  );
}

// ─── CAR CARD ─────────────────────────────────────────────────────────────────
function CarCard({ car, owned, onToggle }) {
  const {cls,pi} = parseClass(car.class);
  const rar = RARITY[cls]||RARITY.D;
  const sources = parseSources(car.source);
  const price = fmtPrice(car.price);
  const isSpecial = car.price==="Not Exit Yet"||car.price==="Xbox Only";

  return (
    <div
      onClick={() => onToggle(car.id)}
      style={{
        background:"#fff", border:owned?`2px solid ${rar.bg}`:"1.5px solid #e0ece4",
        borderRadius:8, overflow:"hidden", cursor:"pointer",
        display:"flex", flexDirection:"column",
        boxShadow:owned?`0 2px 14px ${rar.bg}44`:"0 1px 5px rgba(0,0,0,0.07)",
        transition:"transform 0.1s, box-shadow 0.1s", userSelect:"none", position:"relative",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=owned?`0 6px 20px ${rar.bg}55`:"0 4px 14px rgba(0,0,0,0.12)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=owned?`0 2px 14px ${rar.bg}44`:"0 1px 5px rgba(0,0,0,0.07)";}}
    >
      {owned && <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:rar.bg,zIndex:10}}/>}
      {isSpecial && (
        <div style={{position:"absolute",top:8,left:8,zIndex:15,background:car.price==="Xbox Only"?"#107C10":rar.bg,color:car.price==="Xbox Only"?"#fff":rar.text,fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:8,letterSpacing:1.5,padding:"2px 5px",borderRadius:3}}>
          {car.price==="Xbox Only"?"XBOX ONLY":"COMING SOON"}
        </div>
      )}
      {owned && (
        <div style={{position:"absolute",top:8,right:8,zIndex:15,width:22,height:22,borderRadius:"50%",background:rar.bg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:rar.text}}>✓</div>
      )}

      <CarImage name={car.name} brand={car.brand} />

      <div style={{background:rar.bg,color:rar.text,padding:"3px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:10,letterSpacing:2}}>{rar.label}</span>
        <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:10,background:"rgba(0,0,0,0.18)",borderRadius:3,padding:"0 5px"}}>{cls} {pi}</span>
      </div>

      <div style={{padding:"8px 9px 5px",flex:1,display:"flex",flexDirection:"column",gap:2}}>
        <div style={{color:"#1a3a28",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:12,lineHeight:1.25,textTransform:"uppercase"}}>
          {car.name.replace(/^\d{4}\s*/,"").replace(/\s*FORZA EDITION/i," FE")}
        </div>
        <div style={{color:"#6a9a7a",fontFamily:"'Rajdhani',sans-serif",fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>
          {car.name.match(/^(\d{4})/)?.[1]||""} · {car.brand}
        </div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:3}}>
          {sources.map((s,i)=>{const c=SRC_C[s]||SRC_C.OTHER;return<span key={i} style={{background:c.bg,color:c.t,fontFamily:"'Rajdhani',sans-serif",fontWeight:800,fontSize:8,letterSpacing:1,padding:"2px 4px",borderRadius:2}}>{s}</span>;})}
          {car.collectPts===50&&<span style={{background:"#B8C400",color:"#000",fontFamily:"'Rajdhani',sans-serif",fontWeight:800,fontSize:8,letterSpacing:1,padding:"2px 4px",borderRadius:2}}>50 PTS</span>}
        </div>
      </div>

      <div style={{background:"#f4faf6",borderTop:"1px solid #e0ece4",padding:"5px 9px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:800,fontSize:12,color:isSpecial?"#8B3DB8":"#1a3a28"}}>
          {car.price==="Not Exit Yet"?"Coming Soon":car.price==="Xbox Only"?"Xbox Only":price||"—"}
        </span>
        {car.collectPts&&car.collectPts!==50&&<span style={{color:"#9aba9a",fontFamily:"'Rajdhani',sans-serif",fontSize:9,fontWeight:700}}>{car.collectPts} pts</span>}
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const RAW=[["Abarth",5,"1968 595 Esseesse","D 100","autoshow, wheel",25000],["Abarth",5,"1980 Fiat 131","D 399","autoshow, wheel",125000],["Abarth",5,"2016 695 Biposto","B 540","seasonal",237500],["Acura",5,"2001 Integra Type R","C 471","autoshow, wheel",65000],["Acura",5,"2002 RSX Type S","C 462","autoshow, wheel",18000],["Acura",5,"2022 NSX Type S","S1 734","seasonal",null],["Acura",5,"2023 Integra A-Spec","C 484","autoshow, wheel",36000],["Alfa Romeo",5,"1965 Giulia Sprint GTA Stradale","D 379","autoshow, wheel",343000],["Alfa Romeo",5,"1965 Giulia TZ2","B 532","Collection Journal, seasonal",null],["Alfa Romeo",5,"1968 33 Stradale","B 593","autoshow, wheel",3500000],["Alfa Romeo",5,"1990 SE 048SP","R 978","autoshow DLC","Not Exit Yet"],["Alfa Romeo",5,"1992 155 Q4","C 439","autoshow",30000],["Alfa Romeo",5,"2007 8C Competizione","A 635","autoshow, wheel",312000],["Alfa Romeo",5,"2014 4C","A 644","autoshow",73000],["Alfa Romeo",5,"2017 Giulia Quadrifoglio","A 667","autoshow, wheel",45000],["Alfa Romeo",5,"2021 Giulia GTAm","S1 717","autoshow DLC","Not Exit Yet"],["Alumicraft",5,"2015 Class 10 Race Car","B 532","autoshow, wheel",45000],["Alumicraft",5,"2021 #122 Class 1 Buggy","B 571","autoshow, wheel",160000],["Alumicraft",5,"2022 #6165 Trick Truck","C 485","autoshow, wheel",300000],["AMG Transport Dynamics",5,"2554 M12S Warthog CST","A 663","autoshow, Collection Journal",850000],["APOLLO",5,"2019 INTENSA EMOZIONE","R 916","wheel, seasonal",3040000],["Ariel",5,"2013 Atom 500 V8","S2 825","autoshow, wheel",190000],["Ariel",5,"2016 Nomad","A 601","autoshow, Collection Journal, wheel",54000],["Aston Martin",5,"1964 DB5","C 416","autoshow",500000],["Aston Martin",5,"2016 Vulcan","S2 884","autoshow, wheel, loyal",2300000],["Aston Martin",5,"2017 DB11","A 679","autoshow, wheel",175000],["Aston Martin",5,"2017 Vulcan AMR Pro","S2 898","autoshow, wheel",3000000],["Aston Martin",5,"2019 Valhalla Concept Car","R 960","wheel, seasonal",null],["Aston Martin",5,"2019 DBS Superleggera","S1 736","wheel, seasonal",null],["Aston Martin",5,"2019 Vantage","A 696","autoshow",250000],["Aston Martin",5,"2021 DBX","A 618","seasonal",null],["Aston Martin",5,"2022 Valkyrie AMR Pro","R 989","autoshow, Collection Journal, wheel",4200000],["Aston Martin",5,"2023 Valkyrie","R 924","autoshow, wheel",2750000],["Audi",5,"1984 Sport Quattro","B 526","wheel, seasonal",null],["Audi",5,"1986 #2 Audi Sport quattro S1","S1 726","autoshow, wheel",750000],["Audi",5,"2001 RS 4 Avant","B 544","autoshow, wheel",175000],["Audi",5,"2003 RS 6","B 556","autoshow, wheel",35000],["Audi",5,"2006 RS 4","B 593","autoshow, wheel",75000],["Audi",5,"2009 RS 6","B 598","autoshow, wheel",42000],["Audi",5,"2009 R8 LMS","S2 810","autoshow, wheel",900000],["Audi",5,"2010 TT RS Coupé","B 593","autoshow, wheel",35000],["Audi",5,"2011 RS 5 Coupé","A 613","autoshow, wheel",25000],["Audi",5,"2011 RS 3 Sportback","B 565","autoshow, wheel",20000],["Audi",5,"2013 RS 4 Avant","A 607","autoshow, wheel",30000],["Audi",5,"2013 RS 7 Sportback","A 619","autoshow, wheel",55000],["Audi",5,"2013 R8 Coupé V10 Plus","A 694","Collection Journal, seasonal",null],["Audi",5,"2015 RS 6 Avant","A 640","autoshow, wheel",60000],["Audi",5,"2015 S1","B 527","autoshow, wheel",21000],["Audi",5,"2016 R8 V10 Plus","S1 731","autoshow, wheel",160000],["Audi",5,"2018 RS 4 Avant","A 637","autoshow, wheel",50000],["Audi",5,"2020 R8 V10 Performance","S1 738","autoshow, wheel",281000],["Audi",5,"2020 RS 3 Sedan","A 617","autoshow, wheel",52000],["Audi",5,"2021 RS 6 Avant","A 650","autoshow, wheel",83000],["Audi",5,"2021 RS 7 Sportback","A 655","autoshow, wheel",80000],["Audi",5,"2021 RS e-tron GT","A 677","autoshow, wheel",95000],["Audi",5,"2023 R8 Coupé V10 GT RWD","S1 769","autoshow DLC","Not Exit Yet"],["Austin-Healey",5,"1965 3000 Mk III","D 352","autoshow, wheel",75000],["Autozam",5,"1993 AZ-1","D 342","autoshow, wheel",38000],["BAC",5,"2014 Mono","S1 766","autoshow, wheel",196000],["Bentley",5,"2016 Bentayga","A 612","wheel, seasonal",null],["Bentley",5,"2021 Continental GT Convertible","A 649","autoshow, Collection Journal, wheel",170000],["BMW",5,"1957 Isetta 300 Export","D 100","autoshow, wheel",84000],["BMW",5,"1973 2002 Turbo","C 424","autoshow, wheel",127000],["BMW",50,"1981 M1","B 510","Treasure Car",null],["BMW",5,"1988 M3","C 474","autoshow, wheel",250000],["BMW",5,"1988 M5","C 470","autoshow, wheel",70000],["BMW",5,"1995 850CSi","C 493","autoshow, wheel",135000],["BMW",5,"1995 M5","B 516","autoshow, wheel",48000],["BMW",5,"1997 M3","B 549","autoshow, wheel",30000],["BMW",5,"2003 M5","B 580","autoshow, wheel",47000],["BMW",5,"2005 M3","B 554","autoshow, wheel",35000],["BMW",5,"2008 Z4 M Coupé","B 579","autoshow, wheel",63000],["BMW",5,"2008 M3","A 608","autoshow, wheel",43000],["BMW",5,"2009 M5","B 595","autoshow, wheel",54000],["BMW",5,"2010 M3 GTS","A 678","autoshow, wheel",198000],["BMW",5,"2011 X5 M","B 546","autoshow, wheel",24000],["BMW",5,"2012 M5","A 652","autoshow, wheel",40000],["BMW",5,"2014 M4 Coupé","A 679","autoshow, wheel",55000],["BMW",5,"2015 i8","A 665","autoshow, wheel",70000],["BMW",5,"2016 M4 GTS","S1 711","autoshow, wheel",125000],["BMW",5,"2019 Z4 Roadster","A 634","autoshow, Collection Journal, wheel",38000],["BMW",5,"2020 M8 Competition Coupé","A 684","autoshow, wheel",100000],["BMW",5,"2020 M2 Competition Coupé","A 656","wheel, seasonal",null],["BMW",5,"2021 M4 Competition Coupé","A 666","autoshow, wheel",64000],["BMW",5,"2021 M4 Competition Coupé Welcome Pack","S1 800","autoshow DLC",150000],["BMW",5,"2022 iX xDrive50","B 595","autoshow, wheel",37000],["BMW",5,"2022 M5 CS","S1 731","autoshow, wheel",150000],["BMW",5,"2023 M2 FORZA EDITION","A 700","Collection Journal, seasonal",null],["BMW",5,"2023 M2","A 647","autoshow, wheel",67000],["BMW",5,"2024 X6 M Competition","A 672","autoshow, wheel",140000],["Buick",5,"1987 Regal GNX","C 454","autoshow",255000],["Cadillac",5,"2013 XTS Limousine","D 381","autoshow, wheel",44000],["Cadillac",5,"2016 CTS-V Sedan","A 648","autoshow, wheel",60000],["Cadillac",5,"2016 ATS-V","A 601","autoshow, wheel",41000],["Cadillac",5,"2022 CT4-V Blackwing","A 650","autoshow, wheel",55000],["Cadillac",5,"2022 CT5-V Blackwing","S1 701","autoshow, wheel",90000],["Can-Am",5,"2018 Maverick X RS Turbo R","B 568","autoshow, wheel",16000],["Casey Currie Motorsports",5,"2019 #4402 Ultra 4 Trophy Jeep","A 641","wheel, seasonal",null],["Chevrolet",5,"1953 Corvette","D 270","autoshow, wheel",269000],["Chevrolet",5,"1955 150 Utility Sedan","D 221","autoshow, wheel",140000],["Chevrolet",5,"1957 Bel Air","D 320","autoshow, wheel",69000],["Chevrolet",5,"1960 Corvette","C 428","wheel, seasonal",null],["Chevrolet",5,"1964 Impala Super Sport 409","C 427","autoshow, wheel",70000],["Chevrolet",5,"1967 Corvette Stingray 427","B 510","Collection Journal, seasonal",null],["Chevrolet",5,"1969 Nova Super Sport 396","C 431","autoshow, wheel",40000],["Chevrolet",5,"1969 Camaro Super Sport Coupe","C 471","autoshow, wheel",75000],["Chevrolet",5,"1970 Camaro Z28","C 430","autoshow, wheel",55000],["Chevrolet",5,"1970 El Camino Super Sport 454","C 430","autoshow, wheel",36000],["Chevrolet",5,"1970 Chevelle Super Sport 454","C 424","autoshow, wheel",90000],["Chevrolet",5,"1970 Corvette ZR-1","C 497","autoshow, wheel",250000],["Chevrolet",5,"1972 K-10 Custom","D 268","autoshow, wheel",49000],["Chevrolet",5,"1979 Camaro Z28","D 364","autoshow, wheel",20000],["Chevrolet",5,"1988 Monte Carlo Super Sport","D 282","autoshow, wheel",30000],["Chevrolet",5,"1995 Corvette ZR-1","B 576","autoshow, wheel",76000],["Chevrolet",5,"1996 Impala Super Sport","C 407","autoshow, wheel",30000],["Chevrolet",5,"2002 Corvette Z06","A 602","autoshow, wheel",33000],["Chevrolet",5,"2009 Corvette ZR1","S1 712","autoshow, wheel",125000],["Chevrolet",5,"2015 Camaro Z/28","A 695","autoshow, wheel",65000],["Chevrolet",5,"2015 Corvette Z06","S1 755","autoshow, wheel",100000],["Chevrolet",5,"2017 Camaro ZL1","S1 727","autoshow, wheel",55000],["Chevrolet",5,"2018 Camaro ZL1 1LE","S1 728","autoshow, wheel",70000],["Chevrolet",5,"2019 Corvette ZR1","S1 778","wheel, seasonal",null],["Chevrolet",5,"2020 Silverado LT Trail Boss","C 449","autoshow, wheel",43000],["Chevrolet",5,"2020 Corvette Stingray Coupe","A 700","autoshow, wheel",65000],["Chevrolet",5,"2023 Corvette Z06","S1 763","autoshow, wheel",155000],["Chevrolet",5,"2024 Corvette E-Ray","S1 737","autoshow, wheel, loyal",114000],["Datsun",5,"1969 2000 Roadster","D 323","seasonal",null],["Datsun",5,"1970 510","D 143","autoshow, wheel",86000],["Datsun",5,"1972 #269 240Z Hill Climb Beast","R 951","autoshow DLC","Not Exit Yet"],["DeBerti",5,"2018 Jeep Wrangler Unlimited","A 645","autoshow, wheel",150000],["DeBerti",5,"2018 Chevrolet Silverado 1500 Drift Truck","S1 707","autoshow, wheel",250000],["DeBerti",5,"2019 Ford Super Duty F-250 Lariat","B 548","autoshow, wheel",275000],["DeBerti",5,"2019 Toyota Tacoma TRD","S1 717","autoshow, wheel",250000],["DeLorean",5,"1982 DMC-12","D 357","autoshow, wheel",72000],["Dodge",5,"1968 Dart HEMI Super Stock","B 540","wheel, seasonal",null],["Dodge",5,"1969 Charger Daytona Hemi","C 479","autoshow, Collection Journal, wheel",541000],["Dodge",50,"1969 Charger R/T","C 417","Treasure Car",null],["Dodge",5,"1970 Coronet Super Bee","C 455","autoshow, wheel",175000],["Dodge",5,"1970 Challenger R/T","C 443","wheel, seasonal",null],["Dodge",5,"1999 Viper GTS ACR Forza Edition","A 700","autoshow DLC",null],["Dodge",5,"1999 Viper GTS ACR","B 598","autoshow",68000],["Dodge",10,"2006 Ram SRT-10","B 547","seasonal",null],["Dodge",5,"2008 Viper SRT-10 ACR","S1 735","autoshow, wheel",115000],["Dodge",5,"2015 Charger SRT Hellcat","A 637","autoshow, wheel",44000],["Dodge",5,"2015 Challenger SRT Hellcat","A 631","autoshow, wheel",53000],["Dodge",5,"2016 Viper ACR","S1 786","wheel, seasonal",null],["Dodge",5,"2018 Challenger SRT Demon","A 678","autoshow, Collection Journal, wheel",90000],["Dodge",5,"2021 Durango SRT Hellcat","A 628","Collection Journal, seasonal",null],["Dodge",5,"2022 Challenger SRT Super Stock","A 695","autoshow, wheel",87000],["Ferrari",5,"1962 250 GTO","C 494","autoshow, wheel",48000000],["Ferrari",5,"1962 250 GT Berlinetta Lusso","C 475","autoshow, Collection Journal",1400000],["Ferrari",5,"1967 #24 Ferrari SPA 330 P4","A 684","autoshow, wheel",70000000],["Ferrari",5,"1969 Dino 246 GT","C 428","autoshow, wheel",390000],["Ferrari",5,"1967 275 GTB4 Spider","C 490","autoshow DLC","Not Exit Yet"],["Ferrari",5,"1970 512 S","S1 774","autoshow, wheel",3600000],["Ferrari",5,"1984 288 GTO","A 643","wheel, seasonal",null],["Ferrari",5,"1987 F40","A 678","autoshow, Collection Journal",2000000],["Ferrari",5,"1989 F40 Competizione","R 948","autoshow, wheel",3200000],["Ferrari",5,"1992 512 TR","A 615","wheel, seasonal",null],["Ferrari",5,"1994 F355 Berlinetta","B 588","wheel, seasonal",null],["Ferrari",5,"1995 F50","A 678","autoshow, wheel",4500000],["Ferrari",5,"1996 F50 GT","R 949","Collection Journal, seasonal",null],["Ferrari",5,"2002 Enzo Ferrari","S1 755","autoshow",3500000],["Ferrari",5,"2005 FXX","S2 900","autoshow, wheel",2500000],["Ferrari",5,"2007 430 Scuderia","S1 702","autoshow, wheel",2500000],["Ferrari",5,"2009 458 Italia","S1 721","autoshow, wheel",210000],["Ferrari",5,"2010 599XX","S2 840","autoshow, wheel",2000000],["Ferrari",5,"2012 599XX Evolution","S2 894","wheel, seasonal",null],["Ferrari",5,"2013 LaFerrari","S2 857","autoshow, wheel",3000000],["Ferrari",5,"2013 458 Speciale","S1 768","autoshow, wheel",500000],["Ferrari",5,"2014 FXX K","R 936","autoshow, wheel",4300000],["Ferrari",5,"2015 488 GTB","S1 770","autoshow, wheel",250000],["Ferrari",5,"2015 F12TDF","S1 788","autoshow, wheel",500000],["Ferrari",5,"2017 812 Superfast","S1 780","autoshow, wheel",395000],["Ferrari",5,"2017 J50","S1 772","autoshow, wheel",2500000],["Ferrari",5,"2017 J50 Preorder Car","S1 800","autoshow DLC",null],["Ferrari",5,"2018 FXX-K Evo","R 957","autoshow, wheel",4500000],["Ferrari",5,"2018 Portofino","S1 714","autoshow, wheel",200000],["Ferrari",5,"2018 FXX-K Evo Welcome Pack","R 998","autoshow DLC",250000],["Ferrari",5,"2019 F8 Tributo","S2 802","wheel, seasonal",null],["Ferrari",5,"2019 Monza SP2","S1 773","autoshow, wheel",2500000],["Ferrari",5,"2019 488 Pista","S2 803","autoshow, wheel",716000],["Ferrari",5,"2020 SF90 Stradale","S2 851","autoshow, wheel",575000],["Ferrari",5,"2020 ROMA","S1 735","seasonal",null],["Ferrari",5,"2022 296 GTB","S2 811","seasonal",null],["Ferrari",5,"2025 F80","R 920","autoshow DLC","Not Exit Yet"],["Ford",5,"1932 De Luxe Five-Window Coupe","D 100","autoshow, wheel",36000],["Ford",5,"1965 Mustang GT Coupe","D 388","autoshow",52000],["Ford",5,"1966 #2 GT40 Mk II","A 666","autoshow, wheel",13200000],["Ford",5,"1968 Mustang 2+2 Fastback FORZA EDITION","A 700","wheel, seasonal",null],["Ford",5,"1968 Mustang 2+2 Fastback","D 394","autoshow, wheel",119000],["Ford",5,"1969 Mustang Boss 302","C 468","autoshow, wheel",75000],["Ford",5,"1973 XB Falcon GT","C 422","autoshow, wheel",218000],["Ford",5,"1973 Capri RS3100","D 394","autoshow, wheel",69000],["Ford",5,"1977 #5 Escort RS1800 Mk II","B 544","autoshow, wheel",185000],["Ford",5,"1985 RS200 Evolution","S1 710","seasonal",null],["Ford",5,"1986 F-150 XLT LARIAT FORZA EDITION","S2 850","wheel, seasonal",null],["Ford",5,"1986 F-150 XLT Lariat","D 263","autoshow, wheel",45000],["Ford",50,"1987 Sierra Cosworth RS500","C 484","Collection Journal",null],["Ford",5,"1992 Escort RS Cosworth","C 456","autoshow, wheel",65000],["Ford",5,"1993 Mustang SVT Cobra R","C 432","autoshow, wheel",84000],["Ford",5,"1994 Supervan 3","S1 740","autoshow, wheel",250000],["Ford",5,"1999 Racing Puma","C 401","autoshow, wheel",30000],["Ford",5,"2000 Mustang SVT Cobra R","B 528","autoshow, wheel",153000],["Ford",5,"2001 #4 Ford Focus RS","A 639","autoshow, wheel",415000],["Ford",5,"2003 Focus RS","C 484","autoshow, wheel",35000],["Ford",5,"2003 F-150 SVT Lightning","C 474","seasonal",null],["Ford",50,"2005 GT","A 676","Treasure Car",null],["Ford",5,"2009 Focus RS","B 551","autoshow",52000],["Ford",5,"2010 Crown Victoria Police Interceptor","D 354","autoshow, wheel",15000],["Ford",5,"2011 Transit SuperSportVan","D 235","autoshow, wheel",42000],["Ford",5,"2013 Mustang Shelby GT500","A 647","autoshow, wheel",60000],["Ford",5,"2014 #11 Rockstar F-150 Trophy Truck","A 613","autoshow, wheel",450000],["Ford",5,"2014 FPV Limited Edition Pursuit Ute","B 563","autoshow, wheel",40000],["Ford",5,"2014 Range T6 Rally Raid","B 530","wheel, seasonal",null],["Ford",5,"2016 Mustang Shelby GT350R","S1 721","autoshow, wheel",88000],["Ford",5,"2017 Focus RS","B 588","autoshow, Collection Journal",37000],["Ford",5,"2017 GT","S1 757","autoshow, wheel",500000],["Ford",5,"2017 Brocky Ultra4 Bronco RTR","A 644","autoshow, Collection Journal",75000],["Ford",5,"2017 M-Sport Fiesta RS","S1 707","wheel, seasonal",null],["Ford",5,"2018 Mustang RTR Spec 5","A 648","autoshow, wheel",35000],["Ford",5,"2020 Mustang Shelby GT500","S1 734","autoshow, wheel",125000],["Ford",5,"2020 Super Duty F-450 DRW Platinum","D 379","autoshow, wheel",65000],["Ford",5,"2022 Bronco Raptor","C 473","autoshow, wheel",50000],["Ford",5,"2022 Supervan 4","R 919","Collection Journal, seasonal",null],["Ford",5,"2022 F-150 Lightning","C 500","wheel, seasonal",null],["Ford",5,"2022 Focus ST","B 594","autoshow, wheel",34000],["Ford",5,"2023 F-150 Raptor R Welcome Pack","B 600","autoshow DLC",50000],["Ford",5,"2023 Fiesta ST","C 500","autoshow, wheel",26000],["Ford",5,"2023 F-150 Raptor R","B 536","autoshow, wheel",110000],["Ford",5,"2024 Mustang Dark Horse","A 669","autoshow, Collection Journal",59000],["Ford",5,"2024 Mustang GT","A 628","autoshow, wheel",45000],["Formula Drift",5,"1989 #98 BMW 325i","S1 726","autoshow, wheel",150000],["Formula Drift",5,"1995 #34 Toyota Supra MkIV","S1 759","autoshow, wheel",150000],["Formula Drift",5,"1997 #777 Nissan 240SX","S1 748","autoshow, Collection Journal",150000],["Formula Drift",5,"2006 #43 Dodge Viper SRT-10 ACR","S1 748","wheel, seasonal",null],["Formula Drift",5,"2007 #117 Ferrari 599 GTB Fiorano","S1 767","autoshow, Collection Journal",525000],["Formula Drift",5,"2009 #99 Mazda RX-8","S1 737","autoshow, Collection Journal",150000],["Formula Drift",5,"2013 #777 Chevrolet Corvette","S1 760","autoshow, wheel",275000],["Formula Drift",5,"2015 #13 Ford Mustang","S1 739","wheel, seasonal",null],["Formula Drift",5,"2016 #530 HSV Maloo Gen-F","S1 710","autoshow, wheel",150000],["Formula Drift",5,"2019 #411 Toyota Corolla Hatchback","S1 754","autoshow, wheel",150000],["Formula Drift",5,"2020 #91 BMW M2","S1 748","autoshow, wheel",150000],["Formula Drift",5,"2020 #151 Toyota GR Supra","S1 779","autoshow, wheel",185000],["Formula Drift",5,"2023 #64 Nissan Z","S1 783","autoshow, wheel",200000],["GMC",5,"1970 Jimmy","C 416","autoshow",60000],["GMC",5,"1991 Syclone","C 446","autoshow, wheel",46000],["GMC",5,"1992 Typhoon","C 435","autoshow, wheel",38000],["GMC",5,"2022 EV Hummer Pickup","A 610","autoshow, wheel",95000],["Gordon Murray Automotive",5,"2022 T.50","S2 871","autoshow, Collection Journal",3050000],["GR",5,"2025 GT Prototype","S1 771","autoshow, wheel",250000],["Hennessey",5,"2012 Venom GT","S2 845","wheel, seasonal",null],["Hennessey",5,"2019 Ford F-150 Velociraptor 6x6","B 520","autoshow, wheel",375000],["Hennessey",5,"2021 Venom F5","S2 870","autoshow, wheel",2050000],["Holden",5,"1977 Torana A9X","C 413","autoshow, wheel",500000],["Honda",5,"1970 S800","D 134","autoshow, wheel",40000],["Honda",5,"1974 Civic RS","D 254","Collection Journal, seasonal",null],["Honda",5,"1984 Civic CRX Mugen","D 390","Collection Journal, seasonal",null],["Honda",5,"1984 City E II","D 203","autoshow, Collection Journal, wheel",7500],["Honda",5,"1986 Civic Si","D 253","autoshow",10000],["Honda",5,"1990 #19 CRX WTAC","S2 877","autoshow DLC",150000],["Honda",10,"1991 CR-X SIR","C 465","seasonal",null],["Honda",5,"1991 Beat","D 283","autoshow, Collection Journal, wheel",15000],["Honda",5,"1992 NSX-R","B 572","autoshow, wheel",450000],["Honda",5,"1992 #21 Hardrace Civic WTAC","R 913","autoshow DLC",150000],["Honda",5,"1994 Prelude Si","C 410","autoshow, Collection Journal, wheel",15000],["Honda",5,"1994 Acty","D 100","autoshow, Collection Journal, wheel",9000],["Honda",5,"1997 Civic Type R","C 430","autoshow, wheel",30000],["Honda",5,"2001 #33 Integra WTAC","S2 860","autoshow DLC",150000],["Honda",5,"2003 S2000","B 503","autoshow, wheel",55000],["Honda",5,"2004 Civic Type R","C 480","autoshow, wheel",15000],["Honda",5,"2004 #52 Evasive S2000 WTAC","S2 888","autoshow DLC",320000],["Honda",5,"2005 NSX-R","B 570","autoshow, Collection Journal",325000],["Honda",50,"2005 NSX-R GT","A 608","Collection Journal",null],["Honda",5,"2007 Civic Type R","C 454","autoshow, wheel",17000],["Honda",5,"2008 Civic Type R","B 514","autoshow DLC","Not Exit Yet"],["Honda",5,"2015 Ridgeline Baja Trophy Truck","B 580","autoshow, wheel",400000],["Honda",5,"2015 Civic Type R","B 585","autoshow, wheel",30000],["Honda",5,"2018 Civic Type R","A 608","autoshow, wheel",35000],["Honda",5,"2022 e","D 398","autoshow, wheel",30000],["Honda",5,"2023 Civic Type R","A 620","autoshow, Collection Journal, wheel",43000],["HSV",5,"2014 Limited Edition Gen-F GTS Maloo","A 629","autoshow, wheel",65000],["HSV",5,"2014 Gen-F GTS","A 601","autoshow, wheel",81000],["Hyundai",5,"2019 Veloster N","B 532","autoshow, wheel",20000],["Hyundai",5,"2020 i30 N","B 553","autoshow, wheel",32000],["Hyundai",5,"2021 i20 N","B 564","autoshow, wheel",48000],["Hyundai",5,"2022 N Vision 74","A 692","autoshow, wheel",325000],["Hyundai",5,"2023 IONIQ 5 N","A 657","autoshow, wheel",22000],["Jaguar",5,"1956 D-Type","B 506","autoshow, wheel",4300000],["Jaguar",5,"1961 E-Type","C 414","wheel, seasonal",null],["Jaguar",5,"1964 Lightweight E-Type","B 568","autoshow, wheel",7900000],["Jaguar",5,"1991 Sport XJR-15","S1 716","autoshow, Collection Journal",950000],["Jaguar",5,"1993 XJ220","A 676","autoshow, wheel",570000],["Jaguar",5,"1993 XJ220S TWR","S1 750","autoshow, wheel",540000],["Jaguar",5,"2010 C-X75","S2 810","autoshow, wheel",3200000],["Jeep",5,"2012 Wrangler Rubicon","D 350","autoshow, wheel",16000],["Jeep",5,"2016 Trailcat","A 635","autoshow, wheel",70000],["Jeep",5,"2018 Grand Cherokee Trackhawk","A 631","autoshow, wheel",72000],["Jeep",5,"2020 JT","D 336","autoshow, wheel",36000],["Jimco",5,"2019 #240 Fastball Racing Trophy Truck","B 511","autoshow, wheel",350000],["Jimco",5,"2020 #179 Hammerhead Class 1","A 652","autoshow, wheel",95000],["Koenigsegg",5,"2008 CCGT","S2 900","autoshow, wheel",3400000],["Koenigsegg",5,"2011 Agera","S2 810","autoshow, wheel",1950000],["Koenigsegg",5,"2015 ONE:1","S2 890","wheel, seasonal",null],["Koenigsegg",5,"2016 Regera","S2 886","autoshow",2550000],["Koenigsegg",5,"2017 Agera RS","S2 890","autoshow, Collection Journal",2900000],["Koenigsegg",5,"2020 Jesko","S2 899","autoshow, wheel",3500000],["Koenigsegg",5,"2024 Gemera","S2 900","autoshow DLC",null],["KTM",5,"2018 X-Bow GT4","S1 749","autoshow, wheel",90000],["Lamborghini",5,"1967 Miura P400","B 505","autoshow, wheel",1700000],["Lamborghini",5,"1988 Countach LP5000 QV","A 622","seasonal",null],["Lamborghini",50,"1997 Diablo SV","A 649","Collection Journal",null],["Lamborghini",5,"1999 Diablo GTR","S2 823","wheel, seasonal",null],["Lamborghini",5,"2010 Murciélago LP 670-4 SV","S1 707","autoshow, wheel",1000000],["Lamborghini",5,"2011 Sesto Elemento","S2 871","wheel, seasonal",null],["Lamborghini",5,"2012 Gallardo LP570-4 Spyder Performante","A 685","autoshow, wheel",210000],["Lamborghini",5,"2012 Aventador LP700-4","S1 753","wheel, seasonal",null],["Lamborghini",5,"2013 Veneno","S2 834","autoshow, wheel",3950000],["Lamborghini",5,"2014 Huracán LP 610-4","S1 738","autoshow, wheel, loyal",200000],["Lamborghini",5,"2016 Centenario LP 770-4","S1 792","autoshow, wheel, loyal",1750000],["Lamborghini",5,"2018 Aventador SVJ","S1 794","autoshow, wheel",1200000],["Lamborghini",5,"2019 Urus","A 659","autoshow, Collection Journal",200000],["Lamborghini",5,"2020 Sián Roadster","S1 797","autoshow, wheel",2500000],["Lamborghini",5,"2020 Essenza SCV12","R 911","autoshow, wheel",1500000],["Lamborghini",5,"2020 Huracán STO","S1 783","autoshow, wheel",325000],["Lamborghini",5,"2020 Huracán EVO","S1 761","seasonal",null],["Lamborghini",5,"2021 Aventador LP 780-4 Ultimae","S1 794","seasonal",null],["Lamborghini",5,"2021 Countach LPI 800-4","S1 773","autoshow, wheel",2100000],["Lamborghini",5,"2022 Huracán Tecnica","S1 747","autoshow, wheel",365000],["Lamborghini",5,"2022 Huracán Sterrato","S1 738","Collection Journal, seasonal",null],["Lamborghini",5,"2024 Revuelto","S2 829","autoshow, Collection Journal",365000],["Lancia",50,"1974 Stratos HF Stradale","C 483","Treasure Car",null],["Lancia",5,"1986 Delta S4","B 564","autoshow, wheel",55000],["Lancia",5,"1992 Delta HF Integrale Evo","C 489","autoshow, wheel",110000],["Land Rover",5,"2015 Range Rover Sport SVR","A 604","autoshow, Collection Journal",48000],["Land Rover",5,"2020 Defender 110 X","C 427","autoshow",250000],["Lexus",5,"2010 LFA Forza Edition","S2 900","Collection Journal, seasonal",null],["Lexus",5,"2010 LFA","A 699","autoshow",875000],["Lexus",5,"2015 RC F","A 623","autoshow, wheel",35000],["Lexus",5,"2021 LC 500","B 592","autoshow, wheel",79000],["Lincoln",50,"1962 Continental","D 267","Collection Journal",61750],["Lotus",5,"1997 Elise GT1","S1 709","autoshow, wheel",1500000],["Lotus",5,"1999 Elise Series 1 Sport 190","B 589","autoshow, wheel",47000],["Lotus",5,"2018 Exige Cup 430","S1 732","seasonal",null],["Lotus",5,"2018 Scura Motorsport Exige WTAC","R 998","Collection Journal, seasonal",null],["Lotus",5,"2020 Evija","R 937","autoshow, wheel",2450000],["Lotus",5,"2020 Evija Forza Edition","S2 900","autoshow DLC",null],["Lotus",5,"2023 Emira","A 656","seasonal",null],["Lucid",5,"2024 Air Sapphire","S2 820","autoshow, wheel",240000],["Maserati",5,"1997 Ghibli Cup","B 591","autoshow, Collection Journal",102000],["Maserati",5,"2004 MC12","S1 751","seasonal",null],["Maserati",5,"2008 MC12 Versione Corsa","R 912","autoshow, wheel",3100000],["Maserati",5,"2022 MC20","S1 753","autoshow, wheel",220000],["Mazda",10,"1972 Cosmo 110S Series II","D 394","seasonal",null],["Mazda",5,"1973 RX-3 Forza Edition","B 600","seasonal",500000],["Mazda",5,"1973 RX-3","D 328","autoshow, wheel",73000],["Mazda",5,"1974 #123 Mad Mike 808 Wagon","S1 702","autoshow DLC","Not Exit Yet"],["Mazda",50,"1985 RX-7 GSL-SE","D 357","Treasure Car",null],["Mazda",5,"1990 Savanna RX-7","C 451","autoshow, wheel",23000],["Mazda",50,"1991 #55 Mazda 787B","R 988","Collection Journal",null],["Mazda",5,"1992 RX-7 Type R","B 548","autoshow, Collection Journal",40000],["Mazda",5,"1994 MX-5 Miata Forza Edition","S2 850","seasonal",null],["Mazda",5,"1994 MX-5 Miata","D 329","autoshow, wheel",15000],["Mazda",5,"2005 Mazdaspeed MX-5","C 469","autoshow, wheel",21000],["Mazda",10,"2008 Furai","R 926","seasonal",null],["Mazda",5,"2010 Mazdaspeed 3","B 536","autoshow, wheel",25000],["Mazda",5,"2011 RX-8 R3","B 508","autoshow, wheel",33000],["Mazda",5,"2013 MX-5","C 432","autoshow, wheel",28000],["Mazda",5,"2016 MX-5","C 499","autoshow",18000],["Mazda",5,"2017 MX-5 Cup","B 586","autoshow, Collection Journal",60000],["Mazda",5,"2022 MX-5 Miata RF","B 509","autoshow, wheel",29000],["McLaren",5,"1993 F1","S1 713","autoshow, wheel",5000000],["McLaren",5,"1997 F1 GT","S1 769","autoshow, wheel",5500000],["McLaren",5,"2011 12C Coupé","S1 727","autoshow, wheel",105000],["McLaren",5,"2013 P1","S2 848","autoshow, wheel",1550000],["McLaren",5,"2014 650S Spider","S1 765","autoshow, wheel",130000],["McLaren",5,"2015 570S Coupé","S1 721","autoshow, wheel",130000],["McLaren",5,"2018 600LT Coupé","S1 780","autoshow",260000],["McLaren",5,"2019 Speedtail","S2 835","autoshow, wheel",2000000],["McLaren",5,"2021 Sabre","S1 787","seasonal",null],["McLaren",5,"2021 620R","S1 773","wheel, seasonal",null],["McLaren",5,"2021 765LT Coupé","S2 829","autoshow, wheel",358000],["McLaren",5,"2023 Artura","S1 766","autoshow, wheel",220000],["Mercedes-AMG",5,"2015 GT S","A 691","autoshow, wheel",90000],["Mercedes-AMG",5,"2016 C 63 S Coupé","A 645","autoshow, wheel",34000],["Mercedes-AMG",10,"2017 GT R","S1 764","seasonal",null],["Mercedes-AMG",5,"2018 E 63 S","A 674","autoshow, wheel",63000],["Mercedes-AMG",5,"2018 GT 4-Door Coupé","A 664","wheel, seasonal",null],["Mercedes-AMG",5,"2020 GT Black Series Welcome Pack","S2 900","autoshow DLC",200000],["Mercedes-AMG",5,"2020 SLC 43 Final Edition","A 620","autoshow, wheel",50000],["Mercedes-AMG",5,"2020 GT Black Series","S1 782","autoshow, wheel",440000],["Mercedes-AMG",5,"2021 SL 63","A 690","autoshow, wheel",120000],["Mercedes-AMG",5,"2021 AMG One","S2 900","autoshow, wheel",2800000],["Mercedes-Benz",5,"1954 300 SL Coupé","D 388","autoshow, wheel",1700000],["Mercedes-Benz",5,"1955 300 SLR","B 599","autoshow, wheel",60000000],["Mercedes-Benz",5,"1987 AMG Hammer Coupe","B 565","autoshow, wheel",225000],["Mercedes-Benz",5,"1990 190 E 2.5-16 Evo II FORZA EDITION","A 700","wheel, seasonal",null],["Mercedes-Benz",5,"1990 190 E 2.5-16 Evolution II","C 460","autoshow",200000],["Mercedes-Benz",5,"1998 AMG CLK GTR","S1 713","wheel, seasonal",null],["Mercedes-Benz",5,"2009 SL 65 AMG Black Series","A 699","autoshow, wheel",360000],["Mercedes-Benz",5,"2012 C 63 AMG Coupé Black Series","A 654","autoshow",175000],["Mercedes-Benz",5,"2013 G 65 AMG","B 530","autoshow, Collection Journal",120000],["Mercedes-Benz",5,"2013 A 45 AMG","B 582","autoshow, wheel",25000],["Mercedes-Benz",5,"2014 Unimog U5023","D 100","autoshow, wheel",235000],["Mercedes-Benz",5,"2014 G 65 AMG 6x6","C 489","wheel, seasonal",null],["Mercedes-Benz",5,"2018 X-Class","D 258","autoshow, wheel",50000],["Meyers",5,"1971 Manx","D 201","autoshow, wheel",34000],["Meyers",5,"2023 Manx 2.0","B 540","autoshow, wheel",74000],["MG",5,"1986 Metro 6R4","A 627","autoshow, Collection Journal, wheel",220000],["MINI",5,"1965 Cooper S","D 158","autoshow, wheel",39000],["MINI",5,"2012 John Cooper Works GP","B 509","autoshow, wheel",30000],["MINI",5,"2013 X-Raid All4 Racing Countryman","B 523","autoshow, wheel",220000],["MINI",5,"2018 X-Raid John Cooper Works Buggy","B 514","Collection Journal, seasonal",null],["MINI",5,"2021 John Cooper Works GP","B 599","seasonal",null],["Mitsubishi",5,"1990 #269 Minicab Time Attack","D 166","autoshow DLC",100000],["Mitsubishi",5,"1992 Galant VR-4","C 431","autoshow, wheel",25000],["Mitsubishi",5,"1995 Eclipse GSX","C 436","autoshow, wheel",35000],["Mitsubishi",5,"1995 Montero Exceed 2800 TD","D 190","autoshow, wheel",25000],["Mitsubishi",50,"1995 Lancer Evolution III GSR","B 518","Treasure Car",null],["Mitsubishi",50,"1997 Montero Evolution","D 346","Collection Journal",null],["Mitsubishi",5,"1997 GTO","C 495","autoshow, wheel",20000],["Mitsubishi",5,"2001 Lancer Evolution VI GSR TM Edition","B 574","autoshow",70000],["Mitsubishi",5,"2004 Lancer Evolution VIII MR","B 555","autoshow, wheel",30000],["Mitsubishi",5,"2004 Lancer Evolution VIII MR Welcome Pack","A 700","autoshow DLC",100000],["Mitsubishi",50,"2005 #1 Lancer Evolution Time Attack","R 962","Collection Journal",null],["Mitsubishi",5,"2006 Lancer Evolution IX MR","B 521","seasonal",null],["Mitsubishi",5,"2008 Lancer Evolution X GSR","B 534","autoshow, wheel",25000],["Nissan",5,"1969 Fairlady Z 432","D 369","autoshow, wheel",250000],["Nissan",50,"1971 Skyline 2000GT-R","D 380","Collection Journal",null],["Nissan",5,"1973 Skyline H/T 2000GT-R","C 407","autoshow, wheel",416000],["Nissan",50,"1983 #11 Tomica Skyline Turbo Super Silhouette","S2 847","Collection Journal",null],["Nissan",50,"1985 Safari Turbo","D 123","Treasure Car",null],["Nissan",5,"1987 Skyline GTS-R","C 432","autoshow",41000],["Nissan",5,"1987 BE-1","D 175","seasonal",null],["Nissan",5,"1989 S-Cargo Forza Edition","S1 800","wheel, seasonal",null],["Nissan",5,"1989 Silvia K's","C 455","autoshow",40000],["Nissan",50,"1989 PAO","D 145","Collection Journal",null],["Nissan",5,"1989 S-Cargo","D 131","autoshow, wheel",19000],["Nissan",5,"1990 #12 Skyline GT-R BNR32 GR.A JTC","S2 858","autoshow DLC",1500000],["Nissan",5,"1990 Pulsar GTI-R","C 486","autoshow, wheel",28000],["Nissan",50,"1991 Figaro","D 234","Treasure Car",null],["Nissan",5,"1992 Skyline GT-R","B 541","autoshow, wheel",72000],["Nissan",5,"1993 240SX","D 339","wheel, seasonal",null],["Nissan",5,"1993 #32 Skyline WTAC Xtreme GTR","R 923","autoshow DLC",570000],["Nissan",5,"1994 Silvia K's","C 499","autoshow, wheel",20000],["Nissan",5,"1994 Fairlady Z Version S Twin Turbo","C 497","autoshow",40000],["Nissan",5,"1995 NISMO GT-R LM","B 545","autoshow, wheel",1100000],["Nissan",5,"1995 Gloria Gran Turismo","C 498","autoshow, wheel",15000],["Nissan",5,"1997 Skyline GT-R V-Spec","B 555","seasonal",null],["Nissan",5,"1997 Stagea RS Four V","C 439","autoshow, wheel",20000],["Nissan",5,"1998 Silvia K's Aero","C 494","autoshow, wheel",22000],["Nissan",50,"1998 R390 GT1","S1 774","Collection Journal",null],["Nissan",50,"1998 #23 Pennzoil NISMO Skyline GT-R","S2 848","Collection Journal",null],["Nissan",5,"1998 Skyline GT-R 40th Anniversary","B 547","autoshow DLC","Not Exit Yet"],["Nissan",5,"2000 #36 Dream Project S15 Silvia WTAC","R 996","autoshow DLC",400000],["Nissan",5,"2000 Skyline GT-R V-Spec II","B 590","autoshow, wheel",200000],["Nissan",5,"2002 Silvia Spec-R","B 551","autoshow, wheel",44000],["Nissan",5,"2003 Fairlady Z","B 534","autoshow, wheel",18000],["Nissan",5,"2010 370Z","B 568","seasonal",null],["Nissan",5,"2012 GT-R Black Edition R35 FORZA EDITION","S2 850","wheel, seasonal",null],["Nissan",5,"2012 GT-R Black Edition R35","S1 703","autoshow, wheel",80000],["Nissan",5,"2017 GT-R R35","S1 709","autoshow, wheel",115000],["Nissan",5,"2019 370Z NISMO","A 603","autoshow, wheel",46000],["Nissan",5,"2020 GT-R NISMO R35","S1 736","autoshow, wheel",270000],["Nissan",5,"2024 GT-R NISMO","S1 741","autoshow, Collection Journal",220000],["Nissan",5,"2024 Z NISMO","A 652","autoshow, wheel",60000],["Noble",5,"2010 M600","S1 793","autoshow, wheel",322000],["Opel",5,"1984 Manta 400","B 576","autoshow, Collection Journal",152000],["Pagani",5,"2009 Zonda R","R 918","autoshow, wheel",4750000],["Pagani",5,"2010 Zonda Cinque Roadster","S2 812","autoshow",4000000],["Pagani",5,"2016 Huayra BC Coupe","S2 851","autoshow, wheel",3600000],["Pagani",5,"2021 Huayra R","R 954","seasonal",null],["Peel",5,"1962 P50","D 100","autoshow, wheel",21000],["Peel",5,"1962 P50 Trolli Edition","D 100","autoshow DLC","Xbox Only"],["Penhall",5,"2011 The Cholla","B 541","autoshow, wheel",85000],["Peugeot",50,"1984 205 Turbo 16","C 500","Collection Journal",null],["Peugeot",5,"1991 205 Rallye","D 350","autoshow, wheel",22000],["Peugeot",5,"2007 207 Super 2000","A 632","seasonal",null],["Plymouth",5,"1958 Fury","D 361","autoshow, wheel",53000],["Plymouth",5,"1968 Barracuda Formula S","C 445","autoshow, wheel",45000],["Plymouth",5,"1971 Cuda 426 Hemi","C 441","autoshow, wheel",125000],["Polaris",5,"2021 RZR Pro XP Ultimate","C 496","autoshow, Collection Journal",34000],["Polaris",5,"2021 RZR Pro XP Factory Racing Limited","C 439","autoshow, wheel",50000],["Pontiac",5,"1977 Firebird Trans Am","D 312","autoshow, wheel",60000],["Pontiac",5,"1987 Firebird Trans Am GTA","D 382","autoshow, wheel",25000],["Porsche",5,"1970 #3 917 LH","S1 777","autoshow, Collection Journal",1000000],["Porsche",5,"1970 #3 917 LH FORZA EDITION","R 998","wheel, seasonal",null],["Porsche",5,"1973 911 Carrera RS","C 490","autoshow, wheel",1000000],["Porsche",50,"1982 911 Turbo 3.3","B 550","Collection Journal",null],["Porsche",5,"1986 #185 959 Prodrive Rally Raid","A 623","autoshow, wheel",1500000],["Porsche",50,"1987 959","A 661","Treasure Car",null],["Porsche",5,"1989 944 Turbo","B 539","autoshow, wheel",30000],["Porsche",5,"1993 968 Turbo S","B 594","autoshow, wheel",520000],["Porsche",5,"1993 928 GTS","B 563","autoshow, wheel",150000],["Porsche",10,"1993 911 Turbo S Leichtbau","A 652","seasonal",null],["Porsche",5,"1995 911 GT2","A 644","wheel, seasonal",null],["Porsche",5,"1998 911 GT1 Strassenversion","S1 746","autoshow, wheel",4000000],["Porsche",5,"2003 Carrera GT","S1 758","Collection Journal, seasonal",null],["Porsche",5,"2004 911 GT3","A 674","autoshow, wheel",135000],["Porsche",5,"2005 Cayman GT3 WTAC","S2 856","autoshow, wheel",180000],["Porsche",5,"2012 911 GT3 RS 4.0","S1 726","autoshow, Collection Journal",930000],["Porsche",5,"2014 918 Spyder","S2 858","autoshow, Collection Journal",2300000],["Porsche",5,"2018 911 GT2 RS","S2 803","autoshow, wheel",550000],["Porsche",5,"2018 Cayenne Turbo","A 638","autoshow, wheel",79000],["Porsche",5,"2018 718 Cayman GTS","A 675","autoshow, wheel",75000],["Porsche",5,"2018 Macan LPR Rally Raid","B 528","autoshow, wheel",250000],["Porsche",5,"2019 #70 Porsche Motorsport 935","S2 853","autoshow, wheel",1600000],["Porsche",5,"2019 911 Carrera S","S1 714","autoshow, wheel",145000],["Porsche",5,"2019 911 GT3 RS","S1 760","wheel, seasonal",null],["Porsche",5,"2020 Taycan Turbo S","S1 725","autoshow, wheel",200000],["Porsche",5,"2021 911 GT3","S1 752","autoshow, wheel",260000],["Porsche",5,"2022 718 Cayman GT4 RS","S1 737","autoshow, Collection Journal",190000],["Porsche",5,"2022 Mission R","S2 865","autoshow, wheel",5000000],["Porsche",5,"2023 911 GT3 RS","S1 758","autoshow, wheel",424000],["Porsche",5,"2023 911 Rallye","A 700","seasonal",null],["Porsche",5,"2023 911 Turbo S","S1 774","autoshow, wheel",275000],["Radical",5,"2015 RXC Turbo","S2 842","autoshow, wheel",147000],["Ram",5,"2024 1500 TRX","B 514","autoshow",100000],["Reliant",5,"1972 Supervan III","D 100","autoshow, wheel",39000],["Renault",5,"1967 8 Gordini","D 322","seasonal",null],["Renault",5,"1980 5 Turbo","C 417","autoshow, wheel",143000],["Renault",5,"1993 Clio Williams","D 400","autoshow, wheel",30000],["Renault",5,"2008 Megane R26.R","B 561","autoshow, wheel",58000],["Renault",5,"2010 Megane RS 250","B 538","autoshow, wheel",14000],["Renault",5,"2018 Megane R.S.","B 547","autoshow, wheel",32000],["Rimac",5,"2021 Nevera","R 913","wheel, seasonal",null],["Rivian",5,"2021 R1T","A 607","autoshow, wheel",56000],["RJ Anderson",5,"2016 #37 Polaris RZR Pro 2 Truck","A 674","autoshow, Collection Journal",120000],["RJ Anderson",5,"2021 #37 Polaris RZR Pro 4 Truck","A 677","wheel, seasonal",null],["Saleen",5,"2017 S7 LM","S2 835","seasonal",null],["Schuppan",5,"1993 962CR","S1 764","seasonal",null],["Shelby",5,"1965 Cobra Daytona Coupe","B 515","autoshow, wheel",20000000],["Shelby",5,"1965 Cobra 427 S/C","B 582","Collection Journal, seasonal",null],["SIERRA Cars",5,"2020 #23 Yokohama Alpha","R 926","autoshow, wheel",65000],["SIERRA Cars",5,"2021 700R","D 346","autoshow, wheel",75000],["SIERRA Cars",5,"2021 RX3","A 635","autoshow, wheel",50000],["SRT",5,"2013 Viper GTS","S1 707","autoshow, wheel, loyal",135000],["Subaru",5,"1980 Brat GL","D 159","autoshow, wheel",20000],["Subaru",5,"1990 Legacy RS","C 406","autoshow, wheel",15000],["Subaru",5,"1994 Vivio RX-R Forza Edition","S2 900","Collection Journal, seasonal",null],["Subaru",5,"1994 Vivio RX-R","D 281","autoshow, wheel",10000],["Subaru",5,"1996 SVX","C 466","autoshow, wheel",13000],["Subaru",5,"1998 Impreza 22B-STi Version","B 600","autoshow, wheel",86000],["Subaru",5,"2004 Impreza WRX STi","B 552","autoshow, wheel",30000],["Subaru",5,"2005 Legacy B4 2.0 GT","B 549","autoshow, wheel",10000],["Subaru",5,"2005 Impreza WRX STI","B 570","autoshow, wheel",35000],["Subaru",5,"2008 Impreza WRX STI","B 539","autoshow, wheel",27000],["Subaru",5,"2011 WRX STI","B 547","autoshow, wheel",27000],["Subaru",5,"2013 BRZ","C 463","autoshow, wheel",25000],["Subaru",5,"2015 WRX STI","B 555","autoshow, wheel",27000],["Subaru",5,"2018 WRX STI ARX Supercar","S1 757","seasonal",null],["Subaru",5,"2019 STI S209","B 574","seasonal",null],["Subaru",5,"2022 BRZ FORZA EDITION","A 700","seasonal",null],["Subaru",5,"2022 BRZ","B 551","autoshow, wheel",28000],["Subaru",5,"2022 WRX","B 538","autoshow, wheel",25000],["Toyota",5,"1965 Sports 800","D 141","Collection Journal, wheel, seasonal",null],["Toyota",5,"1965 Sports 800 Fanta Edition","D 141","autoshow DLC","Xbox Only"],["Toyota",50,"1969 2000GT","D 377","Collection Journal",null],["Toyota",5,"1974 Corolla SR5","D 197","seasonal",null],["Toyota",5,"1979 FJ40","D 157","autoshow, wheel",103000],["Toyota",5,"1985 Sprinter Trueno GT Apex Forza Edition","B 600","Collection Journal, seasonal",null],["Toyota",5,"1985 Sprinter Trueno GT Apex","D 376","autoshow, wheel",30000],["Toyota",5,"1989 MR2 SC","D 397","seasonal",null],["Toyota",5,"1991 Chaser GT Twin Turbo","C 484","autoshow, wheel",20000],["Toyota",5,"1991 Sera","D 344","autoshow, wheel",11000],["Toyota",5,"1992 Supra 2.0 GT","C 453","autoshow, wheel",28000],["Toyota",5,"1992 Celica GT-Four RC ST185","C 438","autoshow",30000],["Toyota",5,"1993 #1 Baja T100 Truck","B 584","autoshow, wheel",400000],["Toyota",5,"1994 Celica GT-Four ST205","C 479","autoshow, wheel",27000],["Toyota",5,"1995 MR2 GT","B 522","autoshow, wheel",28000],["Toyota",5,"1995 J&J Motorsport Supra WTAC","S2 828","autoshow DLC",420000],["Toyota",10,"1996 Starlet Glanza V","C 435","seasonal",null],["Toyota",5,"1997 Soarer 2.5 GT-T","C 491","autoshow, Collection Journal, wheel",18000],["Toyota",5,"1997 Chaser 2.5 Tourer V","B 504","autoshow, Collection Journal",15500],["Toyota",5,"1998 Supra RZ","B 529","autoshow, Collection Journal, wheel",60000],["Toyota",10,"1999 Altezza RS200 Z Edition","C 461","seasonal",null],["Toyota",5,"2003 Celica Sport Specialty II","C 433","autoshow, wheel",12000],["Toyota",5,"2005 Crown Super Deluxe Taxi","D 181","autoshow, wheel",10000],["Toyota",5,"2013 86","C 460","autoshow, wheel",15000],["Toyota",5,"2013 86 Stories","A 685","Collection Journal, seasonal",null],["Toyota",10,"2016 Land Cruiser Arctic Trucks AT37","D 332","seasonal",null],["Toyota",5,"2017 JPN Taxi","D 248","autoshow, wheel",25000],["Toyota",5,"2019 Tacoma TRD Pro Forza Edition","R 998","autoshow DLC",null],["Toyota",5,"2019 4Runner TRD Pro","C 421","autoshow, wheel",42000],["Toyota",5,"2019 Tacoma TRD Pro","C 409","autoshow, wheel",34000],["Toyota",5,"2020 GR Supra","A 616","autoshow, Collection Journal, wheel",45000],["Toyota",5,"2021 GR Yaris","B 558","autoshow, wheel",54000],["Toyota",5,"2022 GR86","B 556","autoshow, wheel",28000],["Toyota",5,"2023 Camry TRD","B 525","autoshow",31000],["Toyota",5,"2023 GR Corolla","B 596","autoshow DLC","Not Exit Yet"],["Toyota",5,"2025 Land Cruiser","C 456","autoshow, wheel",70000],["TVR",10,"1998 Cerbera Speed 12","S1 770","seasonal",null],["TVR",5,"2005 Sagaris","A 672","autoshow, wheel",115000],["TVR",5,"2018 Griffith","S1 729","autoshow",250000],["Ultima",5,"2015 Evolution Coupe 1020","R 925","autoshow, wheel",150000],["Volkswagen",5,"1963 Beetle","D 100","autoshow, wheel",17000],["Volkswagen",5,"1963 Type 2 De Luxe","D 100","autoshow, Collection Journal",178000],["Volkswagen",5,"1969 Class 5/1600 Baja Bug","D 260","autoshow, wheel",35000],["Volkswagen",5,"1982 Pickup LX","D 100","autoshow, wheel",16000],["Volkswagen",5,"1983 Golf GTI","D 314","autoshow, wheel",18000],["Volkswagen",10,"1989 Rallye Golf","C 440","seasonal",null],["Volkswagen",5,"1992 Golf GTI 16V Mk2","D 308","autoshow, wheel",22000],["Volkswagen",5,"1995 Corrado VR6","C 426","autoshow, wheel",22000],["Volkswagen",5,"2010 Golf R","B 526","autoshow, wheel",30000],["Volkswagen",5,"2011 Scirocco R","B 548","autoshow, wheel",15000],["Volkswagen",5,"2014 Golf R","B 536","autoshow, wheel",27000],["Volkswagen",5,"2017 #34 Andretti Rally Cross Beetle","S1 764","autoshow, wheel",150000],["Volkswagen",5,"2021 Golf R","B 546","autoshow, wheel",29000],["Volkswagen",5,"2022 Golf R","B 548","autoshow, wheel",35000],["Volvo",5,"1983 242 Turbo Evolution","C 435","autoshow, wheel",30000],["Wuling",5,"2013 Sunshine S","D 107","autoshow, wheel",2000],["Wuling",5,"2020 Sunshine S FORZA EDITION","S1 800","wheel, seasonal",null],["Wuling",5,"2022 Hongguang Mini EV","D 100","autoshow, wheel",5000],["Honda",5,"2003 S2000 Touge Edition","C 500","autoshow, wheel",75000],["Honda",5,"Honda Acty Rakuraku Express","D 100","autoshow, Collection Journal, wheel",9000],["Mazda",5,"1990 MX-5 Miata","D 329","autoshow, wheel",12000],["Nissan",5,"1993 Skyline GT-R V-Spec","B 550","autoshow, wheel",185000],["Nissan",5,"2012 GT-R Black Edition R35 Touge Edition","S1 720","autoshow, wheel",90000],["Toyota",5,"1985 Sprinter Trueno GT Apex Touge Edition","D 376","autoshow, wheel",32000],["Dodge",5,"2013 SRT Viper GTS","S1 707","autoshow, wheel, loyal",135000],["Wuling",5,"2013 Sunshine S Forza Edition","S1 800","wheel, seasonal",null],["Wuling",5,"2022 Hongguang Mini EV Macaron","D 100","autoshow, wheel",5000],["Meyers",5,"2023 Manx 2.0 EV","B 540","autoshow, wheel",74000],["Zenvo",5,"2019 TSR-S","R 906","autoshow, wheel",1200000]];

const CARS = RAW.map((r,i)=>({id:i,brand:r[0],collectPts:r[1],name:r[2],class:r[3],classKey:parseClass(r[3]).cls,source:r[4],price:r[5]}));
const ALL_BRANDS = [...new Set(CARS.map(c=>c.brand))].sort();

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [owned,setOwned]             = useState(()=>{
    try {
      const saved = localStorage.getItem("fh6_owned");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [selBrand,setSelBrand]       = useState("");
  const [view,setView]               = useState("all");
  const [search,setSearch]           = useState("");
  const [filterClass,setFilterClass] = useState(null);
  const [sortBy,setSortBy]           = useState("brand");

  // Save to localStorage whenever owned changes
  useEffect(()=>{
    try { localStorage.setItem("fh6_owned", JSON.stringify([...owned])); } catch {}
  },[owned]);

  const toggle = useCallback(id=>{setOwned(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});},[]);

  const {oByBrand,tByBrand}=useMemo(()=>{
    const o={},t={};
    ALL_BRANDS.forEach(b=>{o[b]=0;t[b]=0;});
    CARS.forEach(c=>{t[c.brand]=(t[c.brand]||0)+1;if(owned.has(c.id))o[c.brand]=(o[c.brand]||0)+1;});
    return {oByBrand:o,tByBrand:t};
  },[owned]);

  const oByClass=useMemo(()=>{const m={};CARS.filter(c=>owned.has(c.id)).forEach(c=>{m[c.classKey]=(m[c.classKey]||0)+1;});return m;},[owned]);

  const filtered=useMemo(()=>{
    let list=CARS;
    if(view==="owned")list=list.filter(c=>owned.has(c.id));
    if(selBrand)list=list.filter(c=>c.brand===selBrand);
    if(filterClass)list=list.filter(c=>c.classKey===filterClass);
    if(search){const q=search.toLowerCase();list=list.filter(c=>c.name.toLowerCase().includes(q)||c.brand.toLowerCase().includes(q));}
    const S={
      brand:(a,b)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name),
      name:(a,b)=>a.name.localeCompare(b.name),
      class:(a,b)=>(CLASS_ORDER[a.classKey]??9)-(CLASS_ORDER[b.classKey]??9),
      pi:(a,b)=>{const pa=parseClass(a.class).pi||0,pb=parseClass(b.class).pi||0;return pb-pa;},
      price:(a,b)=>{const pa=typeof a.price==="number"?a.price:0,pb=typeof b.price==="number"?b.price:0;return pb-pa;},
    };
    return [...list].sort(S[sortBy]||S.brand);
  },[owned,selBrand,filterClass,search,view,sortBy]);

  const totalPts=useMemo(()=>CARS.filter(c=>owned.has(c.id)).reduce((s,c)=>s+c.collectPts,0),[owned]);
  const pct=Math.round(owned.size/CARS.length*100);
  const INP={background:"#fff",border:"1.5px solid #d0e8d8",borderRadius:5,padding:"6px 12px",color:"#1a3a28",fontFamily:"'Rajdhani',sans-serif",fontSize:13,outline:"none"};

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#f0f8f2",fontFamily:"'Rajdhani','Segoe UI',sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&family=Orbitron:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#c8e4d0;border-radius:3px}
        button:focus{outline:none}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"3px solid #B8C400",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"stretch",maxWidth:1700,margin:"0 auto"}}>
          <div style={{background:"#B8C400",padding:"0 22px",display:"flex",alignItems:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:13,color:"#000",lineHeight:1.3,letterSpacing:2}}>FORZA<br/>HORIZON 6</div>
          </div>
          <div style={{display:"flex",alignItems:"stretch"}}>
            {[["all","ALL CARS"],["owned","OWNED"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"12px 20px",border:"none",cursor:"pointer",background:"transparent",color:view===v?"#1a3a28":"#9aba9a",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:13,letterSpacing:2,borderBottom:view===v?"3px solid #B8C400":"3px solid transparent"}}>
                {l}{v==="owned"?` (${owned.size})`:""}
              </button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:20,padding:"0 20px"}}>
            {[["COLLECTION",`${owned.size}/${CARS.length}`,"#1a3a28"],["POINTS",`⊙${totalPts.toLocaleString()}`,"#A89000"],["PROGRESS",`${pct}%`,"#27ae60"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:9,color:"#9aba9a",letterSpacing:2}}>{l}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:c,fontWeight:900}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{maxWidth:1700,margin:"0 auto"}}>
          <div style={{height:3,background:"#e8f4ec",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#27ae60,#B8C400)",transition:"width 0.3s"}}/>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{background:"#fff",borderBottom:"1px solid #d8eee0",padding:"8px 16px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"center",maxWidth:1700,margin:"0 auto",flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setFilterClass(null)} style={{padding:"4px 10px",borderRadius:4,border:!filterClass?"2px solid #B8C400":"1.5px solid #d0e8d8",background:!filterClass?"#B8C400":"#f0f8f2",color:!filterClass?"#000":"#6a9a7a",fontFamily:"'Rajdhani',sans-serif",fontWeight:800,fontSize:11,cursor:"pointer",letterSpacing:1}}>ALL</button>
            {ALL_CLASSES.map(c=>{const col=CLS_COLOR[c],act=filterClass===c;return(
              <button key={c} onClick={()=>setFilterClass(act?null:c)} style={{padding:"4px 10px",borderRadius:4,border:act?`2px solid ${col}`:"1.5px solid #d0e8d8",background:act?`${col}22`:"#f0f8f2",color:act?col:"#6a9a7a",fontFamily:"'Rajdhani',sans-serif",fontWeight:800,fontSize:11,cursor:"pointer",letterSpacing:1}}>{c}</button>
            );})}
          </div>
          <div style={{flex:1}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search car or brand..." style={{...INP,width:200}}/>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={INP}>
            <option value="brand">Sort: Brand</option>
            <option value="name">Sort: Name</option>
            <option value="class">Sort: Class</option>
            <option value="pi">Sort: PI ↓</option>
            <option value="price">Sort: Price ↓</option>
          </select>
          <span style={{color:"#9aba9a",fontFamily:"'Rajdhani',sans-serif",fontSize:11,letterSpacing:1}}>{filtered.length} cars</span>
          {(search||filterClass)&&<button onClick={()=>{setSearch("");setFilterClass(null);}} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:11,fontWeight:700}}>✕ Clear</button>}
        </div>
      </div>

      {/* MAIN */}
      <div style={{display:"flex",flex:1,overflow:"hidden",maxWidth:1700,margin:"0 auto",width:"100%"}}>
        {/* Sidebar */}
        <div style={{width:185,flexShrink:0,background:"#f5fbf7",borderRight:"1.5px solid #d8eee0",overflowY:"auto"}}>
          <div style={{padding:"9px 12px 7px",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:10,letterSpacing:3,color:"#6a9a7a",textTransform:"uppercase",borderBottom:"1px solid #d8eee0"}}>Manufacturer</div>
          <button onClick={()=>setSelBrand("")} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 12px",border:"none",cursor:"pointer",textAlign:"left",background:selBrand===""?"#B8C400":"transparent",borderBottom:"1px solid #eaf4ee"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:selBrand===""?"rgba(0,0,0,0.12)":"#d0ecd8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏎</div>
            <div>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:11,color:selBrand===""?"#000":"#2a5a3a",textTransform:"uppercase"}}>ALL CARS</div>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:10,color:selBrand===""?"#444":"#9aba9a"}}>{ALL_BRANDS.reduce((s,b)=>s+(oByBrand[b]||0),0)}/{CARS.length}</div>
            </div>
          </button>
          {ALL_BRANDS.map(b=>{
            const own=oByBrand[b]||0,tot=tByBrand[b]||0,act=selBrand===b;
            const bgC=BRAND_BG[b]||BRAND_BG.default;
            const ini=b.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase();
            return(
              <button key={b} onClick={()=>setSelBrand(act?"":b)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"7px 12px",border:"none",cursor:"pointer",textAlign:"left",background:act?"#B8C400":own>0?"#edf8f1":"transparent",borderBottom:"1px solid #eaf4ee",transition:"background 0.1s"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:bgC,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:11,color:"#fff"}}>{ini}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:800,fontSize:11,color:act?"#000":own>0?"#1a3a28":"#7aaa8a",textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:105}}>{b}</div>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:10,color:act?"#444":"#9aba9a"}}>{own}/{tot}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{flex:1,overflowY:"auto",padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,paddingBottom:10,borderBottom:"1.5px solid #d8eee0"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:12,color:"#1a3a28",letterSpacing:2}}>
              {selBrand?selBrand.toUpperCase():"ALL MANUFACTURERS"}
            </div>
            {selBrand&&<button onClick={()=>setSelBrand("")} style={{background:"none",border:"1px solid #d0e8d8",borderRadius:4,padding:"2px 9px",color:"#9aba9a",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:11,fontWeight:700}}>✕ All</button>}
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              {ALL_CLASSES.filter(c=>oByClass[c]>0).map(c=>(
                <div key={c} style={{background:`${CLS_COLOR[c]}18`,border:`1px solid ${CLS_COLOR[c]}44`,borderRadius:4,padding:"2px 8px",fontFamily:"'Rajdhani',sans-serif",fontSize:10,fontWeight:800,color:CLS_COLOR[c],letterSpacing:1}}>{c} {oByClass[c]}</div>
              ))}
            </div>
          </div>

          {view==="owned"&&owned.size===0?(
            <div style={{textAlign:"center",padding:"80px 0"}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,letterSpacing:4,color:"#B8C400",marginBottom:8}}>COLLECTION EMPTY</div>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:13,letterSpacing:2,color:"#9aba9a"}}>Click any car to mark it as owned</div>
            </div>
          ):filtered.length===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:"#9aba9a",fontFamily:"'Rajdhani',sans-serif",letterSpacing:2}}>NO CARS FOUND</div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(178px,1fr))",gap:10}}>
              {filtered.map(car=><CarCard key={car.id} car={car} owned={owned.has(car.id)} onToggle={toggle}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
