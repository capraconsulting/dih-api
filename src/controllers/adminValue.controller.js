
import CRUD from './CRUD';
import db from '../models';

class AdminValueController extends CRUD {
    constructor() {
        super(db.AdminValue, 'adminValue');
    }
}

export default AdminValueController;
