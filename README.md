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

### How to test data model migrations
When you've added your migration, do the following:

1. Delete the old dataabase, and restart the app from a branch that does not have your changed data model. This creates the previous data model for you.
2. Switch to the branch with the new data model and migration.
3. Build with `npm run build`
4. Run the build with `PG_URL` set to your database, and `NODE_ENV=production`. You run the built code with `npm start`
5. Check for errors, and see if the data model was updated in the database. If not, you'll have to fix issues and start from step number 1 again.

I.e. you create the old database, run your migration as it would run in production, and see that the migrations works.


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

## API and data model

### /trips

| Property | Value            |
|----------|------------------|
| AUTH     | No               |
| Header   | json/application |

 

**Data format:**

| Property                   | Type        | Description                                      | Restrictions                                                                                        | Default value     | Required | Can be null |
|----------------------------|-------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------------|-------------------|----------|-------------|
| <span>status</span>        | String ENUM | Status of trip                                   | Must be in <span>\['PENDING', 'ACCEPTED', 'REJECTED', 'ACTIVE' 'CLOSED, 'PRESENT', 'LEFT'\] </span> | PENDING           | No       | No          |
| <span>userId</span>        | Integer     | Id of user taking the trip                       | Must be a valid userId                                                                              | None              | Yes      | No          |
| destinationId              | Integer     | Destination for trip                             | Must be a valid destinationId                                                                       | None              | Yes      | No          |
| <span>wishStartDate</span> | Date        | When the user wants this trip to start           |                                                                                                     | <span>None</span> | Yes      | No          |
| <span>wishEndDate</span>   | Date        | When the user wnats this trip to end             |                                                                                                     | <span>None</span> | Yes      | No          |
| startDate                  | Date        | When the trip starts                             |                                                                                                     | <span>None</span> | Yes      | Yes         |
| endDate                    | Date        | When the trip ends                               |                                                                                                     | <span>None</span> | Yes      | Yes         |
| travelMethod               | String ENUM | Method of travel for trip                        | Must be in \['PLANE', 'OTHER'\]                                                                     | None              | No       | Yes         |
| departureAirport           | String      | Departure airport when plane is travel method    |                                                                                                     | None              | No       | Yes         |
| flightNumber               | String      | Flight number when plane is travel method        |                                                                                                     | None              | No       | Yes         |
| arrivalDate                | Date        | Arrival date for travel                          |                                                                                                     | None              | No       | Yes         |
| departureDate              | Date        | Departure date for travel                        |                                                                                                     | None              | No       | Yes         |
| otherTravelInformation     | Text        | Free text field when other travel methos is used |                                                                                                     | None              | No       | Yes         |

On GET-requests the elements also holds `destination` and `user` as objects.

 

| Request | Endpoint | Description           | Request body    | Query params                        | Sucessful response code | Sucessful response body |
|---------|----------|-----------------------|-----------------|-------------------------------------|-------------------------|-------------------------|
| GET     |          | Get all elements      | None            | `destinationId`, `userId`, `status` | 200                     | Array of elements       |
| POST    |          | Create an new element | Element         |                                     | 201                     | The new element         |
| PUT     | /:id     | Update an element     | Changed element |                                     | 204                     | None                    |
| DELETE  | /:id     | Delete an element     | None            |                                     | 204                     | None                    |

### /messages

| Property | Value            |
|----------|------------------|
| AUTH     | Yes              |
| Header   | json/application |

 

**Data format:**

| Property     | Type        | Description                                         | Restrictions                  | Default value | Required | Can be null |
|--------------|-------------|-----------------------------------------------------|-------------------------------|---------------|----------|-------------|
| travelMethod | String ENUM | Method of travel for trip                           | Must be in \['SMS', 'EMAIL'\] | None          | Yes      | No          |
| messages     | String      | Email or sms message, (Email can be in html format) |                               | None          | Yes      | No          |
| sender       | String      | string for sender id in sms                         |  MAX 11 characters            | None          | No       | Yes         |
| subject      | String      | Subject of the email to be sent                     |                               | None          | No       | Yes         |
| recipients   | Array       | Array of recipients (users)                         |                               | None          | Yes      | No          |

| Request | Endpoint | Description                                    | Request body | Query params | Sucessful response code | Sucessful response body              |
|---------|----------|------------------------------------------------|--------------|--------------|-------------------------|--------------------------------------|
| POST    |  /       | Sends the speciefied message to each recipient | Element      |              | 200                     | report regarding the sended entities |

### /destinations

| Property | Value            |
|----------|------------------|
| AUTH     | No               |
| Header   | json/application |


**Data format:**

<table>
<thead>
<tr class="header">
<th>Property</th>
<th>Type</th>
<th>Description</th>
<th>Restrictions</th>
<th>Default value</th>
<th>Required</th>
<th>Can be null</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>name</td>
<td>String</td>
<td>Name of destination</td>
<td>Letters only</td>
<td>None</td>
<td>Yes</td>
<td>No</td>
</tr>
<tr class="even">
<td>acceptedStatusMailTemplateId</td>
<td>Integer</td>
<td>Reference to mailTemplate for status accepted</td>
<td>Reference to element in malTemplates</td>
<td>New standard element</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr class="odd">
<td>rejectedStatusMailTemplateId</td>
<td>Integer</td>
<td><span>Reference to mailTemplate for status rejected</span></td>
<td><span>Reference to element in malTemplates</span></td>
<td>New standard element</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr class="even">
<td>pendingStatusMailTemplateId</td>
<td>Integer</td>
<td><span>Reference to mailTemplate for status pending</span></td>
<td><span>Reference to element in malTemplates</span></td>
<td>New standard element</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr class="odd">
<td>miminmumTripDurationInDays</td>
<td>Integer</td>
<td>Minimum number of days a volunteer has to be available for<br />
to get accepted at the destination </td>
<td> </td>
<td>10</td>
<td>No</td>
<td>No</td>
</tr>
<tr class="even">
<td>startDate</td>
<td>Date</td>
<td>When the destination becomes active</td>
<td> </td>
<td>Now</td>
<td>No</td>
<td>No</td>
</tr>
<tr class="odd">
<td>endDate</td>
<td>Date</td>
<td>When the destinations ends</td>
<td> </td>
<td>null</td>
<td>No</td>
<td>Yes</td>
</tr>
</tbody>
</table>

GET-requests includes the calculated field `countOfActiveVolunteers `and` isActive`

| Request | Endpoint | Description           | Request body    | Sucessful response code | Sucessful response body    |
|---------|----------|-----------------------|-----------------|-------------------------|----------------------------|
| GET     |          | Get all elements      | None            | 200                     | Array of elements          |
| GET     |  /:id    | Get all elements      | None            | 200                     | Single element of given id |
| POST    |          | Create an new element | Element         | 201                     | The new element            |
| PUT     | /:id     | Update an element     | Changed element | 204                     | None                       |
| DELETE  | /:id     | Delete an element     | None            | 204                     | None                       |

### /mailtemplates

| Property | Value            |
|----------|------------------|
| AUTH     | No               |
| Header   | json/application |

**Data format:**

| Property | Type   | Description                 | Restrictions | Default value | Required | Can be null |
|----------|--------|-----------------------------|--------------|---------------|----------|-------------|
| html     | String | HTML-template for an e-mail |              | None          | Yes      | No          |

| Request | Endpoint | Description           | Request body    | Sucessful response code | Sucessful response body |
|---------|----------|-----------------------|-----------------|-------------------------|-------------------------|
| GET     |          | Get all elements      | None            | 200                     | Array of elements       |
| POST    |          | Create an new element | Element         | 201                     | The new element         |
| PUT     | /:id     | Update an element     | Changed element | 204                     | None                    |
| DELETE  | /:id     | Delete an element     | None            | 204                     | None                    |

### /account

<table>
<colgroup>
<col width="50%" />
<col width="50%" />
</colgroup>
<thead>
<tr class="header">
<th>Property</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>AUTH</td>
<td>Yes</td>
</tr>
<tr class="even">
<td>Header</td>
<td><p>Authorization - Bearer jwt</p></td>
</tr>
<tr class="odd">
<td>Header</td>
<td><p>Content-Type - json/application</p></td>
</tr>
</tbody>
</table>


**Data format:**

| Property                   | Type                    | Description                      | Restrictions                                                            | Default value | Required | Can be null |
|----------------------------|-------------------------|----------------------------------|-------------------------------------------------------------------------|---------------|----------|-------------|
| email                      | String (valid email)    | <span>the users email</span>     | must be a valid email                                                   | None          | Yes      | No          |
| firstname                  | String                  | <span>the users firstname</span> |                                                                         | None          | Yes      | No          |
| lastname                   | String                  | the users lastname               |                                                                         | None          | Yes      | No          |
| birth                      | Date                    | Birth date of the user           |                                                                         | None          | Yes      | No          |
| role                       | String ENUM             | The user role                    |  <span>Must be in </span><span>\['USER', 'MODERATOR', 'ADMIN'\] </span> | USER          | No       | No          |
| password                   | String (valid password) | The password in plain text       | Must be set before the user can use the system. (login flow)            | None          | No       | Yes         |
| volunteerInfo              | Text                    | Occupatio and experience         |                                                                         | Empty string  | No       | No          |
| phoneNumber                | String                  | User's phoneNumber               |                                                                         |               |          | Yes         |
| languages                  | Text                    | Languages the user masters       |                                                                         | Empty string  |          | No          |
| medicalDegree              | String                  | User's medical degree - type     |                                                                         |               |          | Yes         |
| medicalDegreeLicenseNumber | String                  | License number of medical degree |                                                                         |               |          | Yes         |

Also virtual field `fullName`

| Request | Endpoint | Description                                       | Request body               | Sucessful response code | Sucessful response body                             |
|---------|----------|---------------------------------------------------|----------------------------|-------------------------|-----------------------------------------------------|
| GET     |  /       | Get the current user based on jwt                 | None                       | 200                     | <span>User object with id encoded in the jwt</span> |
| PUT     | /        | <span>Update the current user based on jwt</span> | Changes on the user object | 204                     | None                                                |

### /authenticate

<table>
<colgroup>
<col width="50%" />
<col width="50%" />
</colgroup>
<thead>
<tr class="header">
<th>Property</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>AUTH</td>
<td>No</td>
</tr>
<tr class="even">
<td>Header</td>
<td><p>Authorization - Bearer jwt</p></td>
</tr>
<tr class="odd">
<td>Header</td>
<td><p>Content-Type - json/application</p></td>
</tr>
</tbody>
</table>

| Request | Endpoint  | Description                                              | <span style="color: rgb(0,0,0);">AUTH</span> | Request body     | Sucessful response code | Sucessful response body |
|---------|-----------|----------------------------------------------------------|----------------------------------------------|------------------|-------------------------|-------------------------|
| POST    |  /        | user login                                               | NO                                           | email + password | 200                     | object containing jwt   |
| POST    | /password | update password given the jwt used has right premissions | YES ( jwt needs field setPassword = true )   | password         | <span>200</span>        | object containing jwt   |

### 
/users

<table>
<colgroup>
<col width="50%" />
<col width="50%" />
</colgroup>
<thead>
<tr class="header">
<th>Property</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>AUTH</td>
<td>No</td>
</tr>
<tr class="even">
<td>Header</td>
<td><p>Content-Type - json/application</p></td>
</tr>
</tbody>
</table>

**
**

**Data format:**

| Property                                | Type                 | Description                      | Restrictions                                  | Default value | Required | Can be null |
|-----------------------------------------|----------------------|----------------------------------|-----------------------------------------------|---------------|----------|-------------|
| email                                   | String (valid email) | the users email                  | must be a valid email                         | None          | Yes      | No          |
| firstname                               | String               | the users firstname              |                                               | None          | Yes      | No          |
| lastname                                | String               | the users lastname               |                                               | None          | Yes      | No          |
| birth                                   | Date                 | Birth date of the user           |                                               | None          | Yes      | No          |
| role                                    | String ENUM          | The user role                    |  Must be in \['USER', 'MODERATOR', 'ADMIN'\]  | USER          | No       | No          |
| <span>phoneNumber</span>                | String               | User's phoneNumber               |                                               |               |          | Yes         |
| <span>languages</span>                  | Text                 | Languages the user masters       |                                               | Empty string  |          | No          |
| <span>medicalDegree</span>              | String               | User's medical degree - type     |                                               |               |          | Yes         |
| <span>medicalDegreeLicenseNumber</span> | String               | License number of medical degree |                                               |               |          | Yes         |
| volunteerInfo                           | Text                 | Occupation and experience        |                                               | None          | No       | Yes         |
| notes                                   | String               | Admins notes about the user      |                                               | None          | No       | Yes         |

Also virtual field `fullName`

 

| Request | Endpoint | Description         | Request body             | Sucessful response code | Sucessful response body |
|---------|----------|---------------------|--------------------------|-------------------------|-------------------------|
| POST    | /        | Create a new user   | The user to be created   | 201                     | The created user        |
| PUT     | /:id     | Update a user by ID | The fields to be updated | 204                     | *N/A*                   |

### Error handling

#### General error status codes and descriptions

If there's no error body, then use the HTTP status code for handling:

| HTTP status code | Description                                         |
|------------------|-----------------------------------------------------|
| 404              | Not found                                           |
| 400              | Bad request, i.e. something wrong with your request |
| 500              | Intenral server error                               |

#### Errors thrown by system

The format of the errors is:

`{`

`name: String,`

`message: String describing the error`

`}`

The following errors can be thrown:

| Error name            | HTTP status code | Description                                                                                               |
|-----------------------|------------------|-----------------------------------------------------------------------------------------------------------|
| ValidationError       | 400              | Thrown when you're trying to POST or PUT data that has data that isn't accepted. Check your request.      |
| ResourceNotFoundError | 404              | Thrown when a resource you're requesting isn't found.                                                     |
| AuthenticationError   | 401              | Thrown when you're not logged in and trying to access a resource that's available only to logged in users |


