# TRS Api Services

## Requirements

- [Nodejs & Npm](https://nodejs.org) >= **12.x.x**, install nodejs (preferably using node version manager 'nvm')
- [Docker](https://www.docker.com/) install go to the docker website and download the installer

## First Time Installation

Clone the repo:

```bash
git clone https://github.com/mimron/mimron_trs_api.git
cd mimron_trs_api
```

Install the dependencies:

```bash
npm install
```

Set the connection variables:

```bash
{
  "development": {
    "username": "root",
    "password": "root",
    "database": "trs",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
}
# inside directory project open config/config.json, modify the connection database
```

Install MYSQL database server inside docker (alternative):

```bash
docker-compose up -d
```

Create database name, migrate table and seed data dummy:

```bash
#1. create database name "trs"
#2. migrate table with command
npx sequelize-cli db:migrate
#3. data dummy available at directory sql/All-dummy-data.sql

```

Running Program:

```bash
npm run start
#normal running

npm run start:dev
#for development
```

# Api Documentation with Postman

inside directory project open folder "/postman", or use this link
https://www.getpostman.com/collections/82c0893bd27e0042aa5e

# Question Test Query

```bash
SELECT
	t1.rep_id AS mst_gepd,
	t1.NAME AS name_gepd,
	t2.rep_id AS mst_epd,
	t2.NAME AS name_epd,
	t3.branch_id,
	t3.NAME AS NAME
FROM
	Members AS t1
	LEFT JOIN Members AS t2 ON t2.manager_id = t1.rep_id
	LEFT JOIN Members AS t3 ON t3.manager_id = t2.rep_id
WHERE
	t3.NAME IS NOT NULL;
```

![image query test](https://raw.githubusercontent.com/mimron/mimron_trs_api/main/public/images/img-query.png)
