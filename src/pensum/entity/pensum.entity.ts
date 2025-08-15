import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity('pensums')
export class Pensum {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  courses?: string[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
