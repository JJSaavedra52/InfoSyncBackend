import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Pensum } from './entity/pensum.entity';
import { CreatePensumDto } from './dto/createPensum.dto';

@Injectable()
export class PensumService {
  constructor(
    @InjectRepository(Pensum)
    private pensumRepository: MongoRepository<Pensum>,
  ) {}

  async create(createPensumDto: CreatePensumDto): Promise<Pensum> {
    const pensum = this.pensumRepository.create({
      ...createPensumDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.pensumRepository.save(pensum);
  }

  async findAll(): Promise<Pensum[]> {
    return await this.pensumRepository.find();
  }

  async findOne(id: string): Promise<Pensum | null> {
    if (!id) {
      throw new NotFoundException('ID is required');
    }
    
    try {
      const pensum = await this.pensumRepository.findOne({
        where: { _id: new ObjectId(id) } as any,
      });
      return pensum;
    } catch (error) {
      throw new NotFoundException(`Pensum with ID ${id} not found`);
    }
  }

  async update(id: string, updateData: Partial<CreatePensumDto>): Promise<Pensum> {
    if (!id) {
      throw new NotFoundException('ID is required');
    }

    try {
      await this.pensumRepository.update(
        { _id: new ObjectId(id) } as any,
        { 
          ...updateData, 
          updatedAt: new Date() 
        }
      );
      
      const updatedPensum = await this.findOne(id);
      if (!updatedPensum) {
        throw new NotFoundException(`Pensum with ID ${id} not found`);
      }
      
      return updatedPensum;
    } catch (error) {
      throw new NotFoundException(`Failed to update pensum with ID ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundException('ID is required');
    }

    try {
      const result = await this.pensumRepository.delete({ _id: new ObjectId(id) } as any);
      if (result.affected === 0) {
        throw new NotFoundException(`Pensum with ID ${id} not found`);
      }
    } catch (error) {
      throw new NotFoundException(`Failed to delete pensum with ID ${id}`);
    }
  }
}
