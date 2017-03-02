import { values } from 'lodash';
import { VALID_ACTIONS } from '../../components/constants';

module.exports = {
    up(migration, DataTypes) {
        return migration.createTable('auditLogs', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            entity: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            entityId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            action: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    isIn: {
                        args: [values(VALID_ACTIONS)],
                        msg: 'Action must be create, update, or delete'
                    }
                }
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false
            },

        // DEV: We could store `changed_values_previous` and `changed_values_current`
        //   but for simplicity of querying, we are storing all values
        // {id: abc, email: abc2, password: hash2, ...}
            currentValues: {
                type: DataTypes.JSONB,
                allowNull: false
            },
            previousValues: {
                type: DataTypes.JSONB,
                allowNull: false
            }
        });
    },

    down(migration) {
        return migration.dropTable('auditLog');
    }

};
