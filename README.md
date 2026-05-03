<!--
SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
SPDX-License-Identifier: AGPL-3.0-or-later

This file is part of Ordbok API.

Ordbok API is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License
along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.
-->

# Ordbok API

![Prosjektbanner](https://ordbokapi.org/images/ordbokapi-open-graph.png)

<p align="center">
  <a href="https://ordbokapi.org">Prosjektnettstad</a> •
  <a href="https://api.ordbokapi.org/graphql">Apollo Sandbox</a>
</p>

## Introduksjon

Velkomen til Ordbok API, nykelen din til enklare tilgang til data frå ordbøkene. Dette API-et er utforma for å forenkle tilgangen til omfattande informasjon frå dei offisielle norske ordbøkene.

## Funksjonar

- Slå opp ord, definisjonar og bøyingsformer frå Bokmålsordboka, Nynorskordboka og Norsk Ordbok.
- Søk på tvers av ordbøkene.
- Spør berre etter det du treng med fleksible GraphQL-førespurnadar.

## Korleis bruka API-et

Den beste måten å koma i gang med Ordbok API på, er å vitja [Apollo Sandbox](https://api.ordbokapi.org/graphql) og sjå gjennom den interaktive dokumentasjonen. Her kan du utforske API-et, prøve ut førespurnadar og sjå korleis dataa er strukturerte.

## Starte prosjektet lokalt

> Du treng Node.js, Yarn og Docker installert på maskina di for å køyre Ordbok API. Eg tilrår å bruke [Volta](https://volta.sh/) for å installere Node.js og Yarn. Brukar du Volta, treng du ikkje installere desse manuelt, sidan kodelageret er konfigurert til å bruke bestemde versjonar.

For å starte Ordbok API lokalt, fylg desse trinna:

1. Klon kodelageret: `git clone https://github.com/ordbokapi/api.git`
2. Opprett `.env` frå malen: `cp template.env .env` og fyll inn dei nødvendige verdiane.
3. Start tenestene med Docker (PostgreSQL, MeiliSearch og Redis): `yarn services:start`
4. Installer avhengnadar: `yarn install`
5. Bygg prosjektet: `yarn build`
6. Start tenaren: `yarn start:dev`

## Bidrag

For å bidraga til Ordbok API:

1. Fork kodelageret.
2. Gjer endringar i forket ditt.
3. Send ein pull request med endringane dine.

## Lisens

Dette prosjektet er lisensiert under GNU Affero General Public License v3.0 eller seinare. Sjå [COPYING](COPYING) for meir informasjon.

## Tilbakemelding og kontakt

For spørsmål og tilbakemeldingar, tak gjerne kontakt med meg på [GitHub](https://github.com/adalinesimonian).

## Kjelder og takk

Tekst og data frå ordbøkene er © Språkrådet og Universitetet i Bergen, henta frå ordbokene.no. Dette prosjektet er eit uavhengig samfunnsprosjekt av Adaline Simonian og har inga tilknyting til Universitetet i Bergen eller Språkrådet.

© 2026 Adaline Simonian
