
export default function (sequelize, DataTypes) {
    const DestinationCoordinator = sequelize.define('destinationCoordinator', {
        destinationId: {
            type: DataTypes.INTEGER,
            unique: 'compositeIndex'
        },
        userId: {
            type: DataTypes.INTEGER,
            unique: 'compositeIndex'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        getterMethods: {
            isActive() {
                // Check for endDate as it can be null
                // Then see if the current time is within the range
                return (this.endDate ? this.endDate >= new Date() : true)
                && this.startDate <= new Date();
            }
        }
    }
);

    return DestinationCoordinator;
}
