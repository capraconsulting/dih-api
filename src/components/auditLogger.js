/* eslint-disable no-underscore-dangle */
import db from '../models';

// Add hooks for audit logging
// http://docs.sequelizejs.com/en/v3/docs/hooks/#declaring-hooks
// http://docs.sequelizejs.com/en/v3/docs/hooks/#model-hooks
function saveAuditLog(action, model) {
    const Model = model.Model;
    const auditLog = db.AuditLog.build({
        entity: Model.tableName,
        entityId: model.get('id'),
        action,
        timestamp: new Date(),
        previousValues: model._previousDataValues,
        currentValues: model.dataValues
    });

    return auditLog.save();
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
