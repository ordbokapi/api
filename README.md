# Ordbok API

## Introduksjon

Velkomen til Ordbok API, nøkkelen din til enklare og meir tilgjengeleg tilgang til Ordbøkene-data. Dette APIet er designa for å forenkla tilgangen til omfattande informasjon frå dei offisielle norske ordbøkene og er for tida i utviklingsfasen.

## Funksjonar

- **Rask tilgang**: Snarleg henting av orddefinisjonar og døme.
- **Fleksibilitet**: Tilpassa søk for varierte brukstilfelle.
- **Effektiv datahandtering**: GraphQL spørjespråk for å henta nøyaktig den informasjonen du treng.

## Korleis å bruka APIet

> Du treng Node.js og Yarn installert på maskina di for å bruka Ordbok API. Eg anbefalar å bruka [Volta](https://volta.sh/) for å installera Node.js og Yarn. Viss du brukar Volta, er det ikkje nødvendig å installera Node.js og Yarn fordi repoet er konfigurert med versjonar av desse verktøya.

Akkurat no er Ordbok API i ein utviklingsfase og kan vera ustabil. Fullstendig dokumentasjon er ikkje tilgjengeleg endå. Me oppmodar brukarar til å nytta seg av GraphQL sandbox for å utforska og testa APIet:

- **Besøk endpoint**: Gå til [Apollo Sandbox](https://api.ordbokapi.org/graphql).
- **Test førespurnader**: Bruk sandboxen til å gjera førespurnader og sjå responsane.
- **Gi tilbakemelding**: Me verdset tilbakemeldinga di for å forbetra APIet.

## Starta prosjektet lokalt

For å starta Ordbok API lokalt, følg desse trinna:

1. Klona repoet: `git clone https://github.com/adalinesimonian/ordbokapi.git`
2. Installer avhengnader: `yarn install`
3. Bygg prosjektet: `yarn build`
4. Start serveren: `yarn start:dev`

## Bidra

For å bidra til Ordbok API, følg standard GitHub pull request prosedyrar:

1. Fork repoet.
2. Gjer endringar i forket ditt.
3. Send ein pull request med endringane dine.

## Lisens

Dette prosjektet er lisensiert under ISC-lisensen. Sjå [LICENCE](LICENCE) for meir informasjon.

## Tilbakemelding og kontakt

For spørsmål og tilbakemeldingar, vennligst kontakt meg på [GitHub](https://github.com/adalinesimonian/ordbokapi).

## Vedkjenningar

Tekst og data frå ordbøkene er © Språkrådet og Universitetet i Bergen, henta frå ordbokene.no. Dette prosjektet er eit uavhengig samfunnsprosjekt av Adaline Simonian og har ingen tilknytning til Universitetet i Bergen eller Språkrådet.

© 2023 Adaline Simonian. Alle rettar reservert.

Besøk nettstedet vårt: [ordbokapi.org](https://ordbokapi.org)
