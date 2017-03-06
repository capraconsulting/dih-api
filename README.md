# dih-api

__Build status:__

| `dev` | `master`|
| :--  |:--|
|[![CircleCI](https://circleci.com/gh/capraconsulting/dih-api/tree/dev.svg?style=shield&circle-token=31ea42d745bf7499e768623c89901f32adadcf9b)](https://circleci.com/gh/capraconsulting/dih-api/tree/dev) [![Coverage Status](https://coveralls.io/repos/github/capraconsulting/dih-api/badge.svg?branch=dev&t=mBsoI5)](https://coveralls.io/github/capraconsulting/dih-api?branch=dev) [![Documentation Coverage Status](http://docs.dih.capra.me/badge.svg)](http://docs.dih.capra.me/)| [![CircleCI](https://circleci.com/gh/capraconsulting/dih-api/tree/master.svg?style=shield&circle-token=31ea42d745bf7499e768623c89901f32adadcf9b)](https://circleci.com/gh/capraconsulting/dih-api/tree/master) [![Coverage Status](https://coveralls.io/repos/github/capraconsulting/dih-api/badge.svg?branch=master&t=mBsoI5)](https://coveralls.io/github/capraconsulting/dih-api?branch=master) [![Documentation Coverage Status](http://docs.dih.capra.me/badge.svg)](http://docs.dih.capra.me/)||

## Workflow

1. Get a task on JIRA by talking to you teammates and looking at the sprint backlog.
2. Create a new branch  from the `dev`-branch, naming it using our branch naming strategy described below.
3. Code away and commit often. Try to follow [good commit practice](http://chris.beams.io/posts/git-commit/). Remember to write tests (and run them).
4. When you're done (see definition of done on GitHub), create a pull request with reference to the JIRA-issue (preferably a link) and an overview of what the pull request is about. Await code review (you can tag people or yell for them on Slack to get your review faster).
5. When you've reworked your code after the code review, the pull request will be merged.

### Branch naming strategy
The project has a strategy for what to name our branches, so that changes in them are easily traceable to user stories and issues in our issue tracking system JIRA. Another reason for having a naming strategy is that it makes it easy to find distinct types of proposed changes, as well as what's being worked on.

Name your branches in the following way, where `DIH-num` is a task ID on JIRA:

* If it's a feature (new functionality) name the branch `feature/DIH-num`.
* If it's a bugfix name the branch `bugfix/DIH-num`.
* If it's a technical task, name the branch `tech/DIH-num`

## Setup
### Database
To setup the project locally install Postgres and set `PG_URL ` to your database. The format should `postgres://USERNAME:PASSWORD@localhost/DB`. The capitalized words should be replaced with your own values.

To export your variable on a Unix-system, simply use the `export` command, i.e. `export PG_URL=your value`.

### SES for e-mails
The system uses AWS SES for e-mails and sms notifications. You'll need to have the correct role installed on the instance running the application.

You can also set your AWS region with `REGION`.

 Contact one of the contributors to get more information on how to be added to the AWS teams, or take a look at [Confluence](https://confluence.capraconsulting.no/pages/viewpage.action?pageId=83398017) for some standard values you can use for testing.

### Local production environment
Run `yarn build` to get a transpiled version of the API, then start with `yarn start`.

### Local development environment
If you're gonna develop:

1. Install nodemon `npm install -g nodemon` & yarn `npm install -g yarn`
2. Spin up docker-compose to run services like db and emails locally.
3. Run  `yarn start:dev` Remember that you can run it with environment variables in before the command, i.e. `PG_URL=value yarn start:dev`.

This will watch for changes and keep the application open for you.

### Test data
To enter some test data into your database, run `yarn load`. It will give you some test users

|Role | Username |
|:--|:--|
|User | `test-user@dih.capra.me`|
|Moderator| `test-moderator@dih.capra.me`|
|Administrator| `test-admin@dih.capra.me`|

All these users have the password `password`.

To enter some test data into your database, run `npm run load`.

## Tests

### Single run

* Run unit tests & code lint with `yarn test`. This will use your local database.
* Run just unit tests with `yarn tests` with `NODE_ENV=test`. This will use your local database.

### Watch

Run the unit tests continuously with `yarn test:watch`, only the tests currently worked on will run when updated.
All tests will run when a server file is updated. This will use your local database.

## Deployment
We have continuous deployment with [Circle CI](http://circleci.com), which builds Docker-images and pushes to AWS EC2.

* The `dev`-branch is the main branch, and has CI to our staging environment.
* The `master`-branch is the stable branch, and has CI to our production environment.
