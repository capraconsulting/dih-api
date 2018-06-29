import sinon from 'sinon';
import { describe } from 'ava-spec';
import db from '../../src/models';
import { syncDB } from '../../src/db-helpers';
import { updateTransport } from '../../src/components/mail';

// TODO
// test instance methods like createJwt and toJSON function

let transport;
const user = {
    email: 'email@email.com',
    firstname: 'firstname',
    lastname: 'lastname',
    birth: '1990-04-25T01:32:21.196+0200'
};

describe('User Model', it => {
    it.beforeEach(() => {
        transport = {
            name: 'testsend',
            version: '1',
            send(data, callback) {
                callback();
            },
            logger: false
        };
        updateTransport(transport);
        return syncDB({ force: true });
    });

    it('should create a user, call sendInvite and send a user instance', async t => {
        sinon.stub(transport, 'send').yields(null);
        return db.User.invite(user)
            .then(response => {
                t.notDeepEqual(response.toJSON(), user);
                t.is(transport.send.callCount, 1);
            });
    });
});
