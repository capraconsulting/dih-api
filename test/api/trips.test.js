import { describe } from 'ava-spec';
import _ from 'lodash';
import request from 'supertest-as-promised';
import { loadFixtures, getAllElements, createValidJWT } from '../helpers';
import app from '../../src/app';

const URI = '/trips';
const userURI = '/users';

let tripObjects;
let userObjects;
let destinationObjects;
const mockTrip = {
    status: 'PENDING',
    startDate: '2020-04-01T01:32:21.196+0200',
    endDate: '2020-04-25T01:32:21.196+0200',
    notes: 'Looking forward to my trip.'
};
const arrivalDate = '2030-04-25T01:32:21.196+0200';
const departureDate = '2031-04-25T01:32:21.196+0200';

describe.serial('Trip API', it => {
    it.beforeEach(() =>
        loadFixtures()
            .then(() => getAllElements('Trip'))
            .then(response => {
                tripObjects = response;
            })
            .then(() => getAllElements('Destination'))
            .then(response => {
                destinationObjects = response;
            })
            .then(() => getAllElements('User'))
            .then(response => {
                userObjects = response;
                mockTrip.userid = userObjects[0].id;
            })
            .then(() => {
                mockTrip.destinationId = destinationObjects[1].id;
            })
    );

    it('should retrieve a list of all trips for admin', async t => {
        const response = await request(app)
            .get(URI)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(200)
            .then(res => res.body);
        t.is(response.length, tripObjects.length);
    });

    it('should be able to get all trips of a specific destinationId for admin', async t => {
        const response = await request(app)
            .get(`${URI}?destinationId=${tripObjects[0].destinationId}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(200)
            .then(res => res.body);
        t.is(response.length, 2);
    });

    it('should be able to get trips of a specific userId', async t => {
        const response = await request(app)
            .get(`${URI}?userId=${tripObjects[0].userId}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(200)
            .then(res => res.body);
        t.is(response.length,
            tripObjects.filter(tripObject => tripObject.userId === tripObjects[0].userId).length);
    });


    it('should be able to get all trips of a specific status for admin', async t => {
        const fixture = tripObjects[0];
        const response = await request(app)
            .get(`${URI}?status=${fixture.status}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(200)
            .then(res => res.body);
        t.is(response.length, 2);
    });

    it('should be able to get trips of a specific userId and destinationId for admin', async t => {
        const fixture = tripObjects[0];
        const response = await request(app)
            .get(`${URI}?userId=${fixture.userId}&destinationId=${fixture.destinationId}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(200)
            .then(res => res.body);
        t.is(response.length, 1);
    });

    it('should get trips of specific userId, destinationId, status for admin', async t => {
        const fixture = tripObjects[0];
        const response = await request(app)
            .get(`${URI}?userId=${fixture.userId}
                        &destinationId=${fixture.destinationId}
                        &status=${fixture.status}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(200)
            .then(res => res.body);
        t.is(response.length, 1);
    });

    it('should be not be able to query on startDate', async t => {
        const fixture = tripObjects[0];
        const response = await request(app)
            .get(`${URI}?startDate=${fixture.startDate}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(400)
            .then(res => res.body);
        t.is(response.name, 'UriValidationError');
        t.is(response.message, 'Invalid URI.');
    });

    it('should be not be able to query on endDate', async t => {
        const fixture = tripObjects[0];
        const response = await request(app)
            .get(`${URI}?endDate=${fixture.endDate}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(400)
            .then(res => res.body);
        t.is(response.name, 'UriValidationError');
        t.is(response.message, 'Invalid URI.');
    });

    it('should reject queries on non-existing model properties', async t => {
        const response = await request(app)
            .get(`${URI}?topkek=someValue&capra=summmer`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(400)
            .then(res => res.body);
        t.is(response.name, 'UriValidationError');
        t.is(response.message, 'Invalid URI.');
    });

    it('should be able to retrieve a single trip for admin', async t => {
        const fixture = tripObjects[0];
        const response = await request(app)
            .get(`${URI}/${fixture.id}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(200);
        t.is(response.body.userId, fixture.userId);
        t.is(response.body.destinationId, fixture.destinationId);
    });


    it('should not be able to retrieve a single trip that does not exist for admin', async () => {
        await request(app)
            .get(`${URI}/${tripObjects.length + 100}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(404);
    });

    it('should let user create a new trip', async t => {
        const user = userObjects[0];
        const response = await request(app)
            .post(URI)
            .set('Authorization', `Bearer ${createValidJWT(user)}`)
            .send(mockTrip)
            .expect(201)
            .then(res => res);
        t.is(response.body.status, mockTrip.status);
    });

    it('should set status to pending when no status is provided', async t => {
        const user = userObjects[0];
        const mock = mockTrip;
        delete mock.status;
        const response = await request(app)
            .post(URI)
            .set('Authorization', `Bearer ${createValidJWT(user)}`)
            .send(mock)
            .expect(201);
        t.is(response.body.status, 'PENDING');
    });

    it('should be able to create a new trip with other user when admin ', async t => {
        const mock = mockTrip;
        mock.userId = userObjects[0].id;
        const response = await request(app)
            .post(URI)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .send(mock)
            .expect(201)
            .then(res => res);
        t.is(response.body.userId, userObjects[0].id);
    });

    it('should be able to create a new trip with missing destinationId field', async () => {
        const mockWithEmptyDestination = mockTrip;
        delete mockWithEmptyDestination.destinationId;
        await request(app)
            .post(URI)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .send(mockWithEmptyDestination)
            .expect(201);
    });

    it('should be able to create a new trip with missing userId field', async () => {
        const mockWithEmptyUser = mockTrip;
        delete mockWithEmptyUser.userId;
        await request(app)
            .post(URI)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .send(mockWithEmptyUser)
            .expect(201);
    });

    it('should be able to update a trip with a valid new status', async t => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.status = 'ACCEPTED';
        const validRequestResponse = await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204)
            .then(() => request(app).get(URI)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`))
            .then(res => _.find(res.body, obj => obj.id === fixture.id));
        t.is(validRequestResponse.status, changedFixture.status);
    });

    it('should not be able to update a trip with an invalid status', async () => {
        const fixture = tripObjects[0];
        const invalidChangedFixture = fixture;
        invalidChangedFixture.status = 'kek';
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .send(invalidChangedFixture)
            .expect(400);
    });

    it('should be able to update trip with travel method', async () => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.travelMethod = 'PLANE';
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204);
    });

    it('should be able to update trip with departure airport', async () => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.departureAirport = 'OSL+';
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204);
    });

    it('should be able to update trip with flight number', async () => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.flightNumber = '	WF794';
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204);
    });

    it('should be able to update trip with arrival date', async () => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.arrivalDate = arrivalDate;
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204);
    });

    it('should be able to update trip with departure date', async () => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.departureDate = departureDate;
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204);
    });

    it('should be able to update trip with other travel information', async () => {
        const fixture = tripObjects[0];
        const changedFixture = fixture;
        changedFixture.otherTravelInformation = 'Batmobile';
        await request(app)
            .put(`${URI}/${fixture.id}`)
            .send(changedFixture)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .expect(204);
    });
    it('should return 404 when you try to update a trip that does not exist', async () => {
        await request(app)
            .put(`${URI}/${tripObjects.length + 100}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[0])}`)
            .send(mockTrip)
            .expect(404);
    });
    it('should be able to delete a trip', async t => {
        const response = await request(app)
            .delete(`${URI}/${tripObjects[0].id}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(204)
            .then(() => request(app).get(URI)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`))
            .then(res => res.body);
        t.is(response.length, tripObjects.length - 1);
    });

    it('should return 404 when you try to delete an item that does not exist', async () => {
        await request(app)
            .delete(`${URI}/${tripObjects.length + 100}`)
            .set('Authorization', `Bearer ${createValidJWT(userObjects[1])}`)
            .expect(404);
    });

    it('should only return trips belonging to a coordinator when asked by coordinator'
    , async t => {
        const coordinator = userObjects[2];
        await request(app)
            .get(URI)
            .set('Authorization', `Bearer ${createValidJWT(coordinator)}`)
            .then(res => res.body)
            .then(res => t.is(res.length, 2));
    });

    it('should return all trips when asked by admin'
    , async t => {
        const admin = userObjects[1];
        await request(app)
            .get(`${URI}/`)
            .set('Authorization', `Bearer ${createValidJWT(admin)}`)
            .then(res => res.body)
            .then(res => t.is(res.length, 5));
    });

    it('should return only trips belonging to a user when asked by user'
    , async t => {
        const user = userObjects[0];
        await request(app)
            .get(`${URI}/`)
            .set('Authorization', `Bearer ${createValidJWT(user)}`)
            .then(res => res.body)
            .then(res => t.is(res.length, 4));
    });

    it('should return zero trips for a user with no trips'
    , async t => {
        const user = userObjects[3];
        await request(app)
            .get(`${URI}/`)
            .set('Authorization', `Bearer ${createValidJWT(user)}`)
            .then(res => res.body)
            .then(res => t.is(res.length, 0));
    });

    it('should not return any trips for a deactivated user'
    , async t => {
        const user = userObjects[0];
        const admin = userObjects[1];
        // deactivate user
        const validJwt = createValidJWT(admin);
        await request(app)
            .put(`${userURI}/${user.id}`)
            .send({ isActive: false })
            .set('Authorization', `Bearer ${validJwt}`)
            .expect(204)
            .then(() => request(app)
                .get(URI)
                .set('Authorization', `Bearer ${validJwt}`)
        );
        await request(app)
            .get(`${URI}`)
            .set('Authorization', `Bearer ${createValidJWT(user)}`)
            .then(res => res.body)
            .then(res => t.is(res.length, 0));
    });
});
