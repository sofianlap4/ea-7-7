import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface VideoAttributes {
  id?: string;
  title: string;
  url: string;
  description?: string;
  courseId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  free?: boolean;
}

type VideoCreationAttributes = Optional<VideoAttributes, 'id' | 'description' | 'courseId' | 'createdAt' | 'updatedAt' | 'free'>;

export default (sequelize: Sequelize) => {
  class Video extends Model<VideoAttributes, VideoCreationAttributes> implements VideoAttributes {
    public id!: string;
    public title!: string;
    public url!: string;
    public description?: string;
    public courseId?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public free?: boolean;
  }

  Video.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // courseId will be added by association
    },
    {
      sequelize,
      modelName: 'Video',
    }
  );

  return Video;
};