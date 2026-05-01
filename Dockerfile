# SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# This file is part of Ordbok API.
#
# Ordbok API is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option) any
# later version.
#
# Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

# -----------------------------------------
# Build stage
# -----------------------------------------
FROM node:24.14.1-slim AS builder

WORKDIR /app

COPY .yarnrc.yml package.json yarn.lock mkenvlink.mjs ./
COPY .yarn .yarn
COPY packages/common/package.json packages/common/
COPY packages/api/package.json packages/api/
COPY packages/run-on-tsc-build/package.json packages/run-on-tsc-build/

RUN touch .env

RUN yarn install --immutable

COPY packages/common packages/common
COPY packages/api packages/api
COPY packages/run-on-tsc-build packages/run-on-tsc-build

ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=${SOURCE_COMMIT}

RUN yarn build

# -----------------------------------------
# Run stage
# -----------------------------------------
FROM node:24.14.1-slim

# Needed for health checks.
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["yarn", "workspace", "ordbokapi", "run", "start:prod"]
