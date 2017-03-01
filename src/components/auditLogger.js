/* eslint-disable no-underscore-dangle */
import assert from 'assert';
import db from '../models';

// Add hooks for audit logging
// http://docs.sequelizejs.com/en/v3/docs/hooks/#declaring-hooks
// http://docs.sequelizejs.com/en/v3/docs/hooks/#model-hooks
function saveAuditLog(action, model, options) {
  // Verify we are being run in a transaction
    assert(options.transaction, `${'All create/update/delete actions must be run in a' +
        ' transaction to prevent orphaned AuditLogs or connected models on save. ' +
        'Please add a transaction to your current "'}${action}" request`);

    const Model = model.Model;
    const auditLog = db.AuditLog.build({
        entity: Model.tableName,
        entityId: model.get('id'),
        action,
        timestamp: new Date(),
        previousValues: model._previousDataValues,
        currentValues: model.dataValues
    });

    return auditLog.save({ transaction: options.transaction });
}

export default {
    afterCreate(model, options) {
        return saveAuditLog('create', model, options);
    },
    afterUpdate(model, options) {
        return saveAuditLog('update', model, options);
    },
    afterDelete(model, options) {
        return saveAuditLog('delete', model, options);
    }
};
