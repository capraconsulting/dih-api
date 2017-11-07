
export default function (sequelize, DataTypes) {
    const Model = sequelize.define('adminValue', {
        title: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        }
    });
    return Model;
}
