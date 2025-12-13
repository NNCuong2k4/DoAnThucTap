import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pet, PetDocument } from '../../schemas/pet.schema';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { AddVaccinationDto, UpdateVaccinationDto } from './dto/add-vaccination.dto';
import { AddMedicalRecordDto, UpdateMedicalRecordDto } from './dto/add-medical-record.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name)
    private petModel: Model<PetDocument>,
  ) {}

  async findAll() {
    return await this.petModel.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async findMyPets(userId: string) {
    return await this.petModel
      .find({
        ownerId: new Types.ObjectId(userId),
        isActive: true,
      })
      .sort({ createdAt: -1 });
  }

  async findOne(userId: string, petId: string, userRole?: string) {
    if (!Types.ObjectId.isValid(petId)) {
      throw new BadRequestException('ID thú cưng không hợp lệ');
    }

    // ✅ FIXED: Admin can access any pet
    if (userRole === 'admin') {
      const pet = await this.petModel.findOne({
        _id: petId,
        isActive: true,
      });

      if (!pet) {
        throw new NotFoundException('Không tìm thấy thú cưng');
      }

      return pet;
    }

    // Regular users must own the pet
    const pet = await this.petModel.findOne({
      _id: petId,
      ownerId: userId,
      isActive: true,
    });

    if (!pet) {
      throw new NotFoundException('Không tìm thấy thú cưng');
    }

    return pet;
  }

  async create(userId: string, createPetDto: CreatePetDto) {
    const petData: any = {
      ...createPetDto,
      ownerId: new Types.ObjectId(userId),
    };

    if (createPetDto.dob) {
      petData.dob = new Date(createPetDto.dob);
    }

    const pet = new this.petModel(petData);
    return await pet.save();
  }

  // ✅ FIXED: Added userRole parameter
  async update(userId: string, petId: string, updatePetDto: UpdatePetDto, userRole?: string) {
    const pet = await this.findOne(userId, petId, userRole);

    Object.keys(updatePetDto).forEach((key) => {
      if (updatePetDto[key] !== undefined) {
        if (key === 'dob' && updatePetDto[key]) {
          pet[key] = new Date(updatePetDto[key]);
        } else {
          pet[key] = updatePetDto[key];
        }
      }
    });

    return await pet.save({ validateModifiedOnly: true });
  }

  // ✅ FIXED: Added userRole parameter
  async delete(userId: string, petId: string, userRole?: string) {
    const pet = await this.findOne(userId, petId, userRole);
    pet.isActive = false;
    await pet.save({ validateModifiedOnly: true });
    return { message: 'Xóa thú cưng thành công' };
  }

  // ✅ FIXED: Allow admin to bypass ownership check
  async verifyOwnership(petId: string, userId: string, userRole?: string): Promise<PetDocument> {
    if (!Types.ObjectId.isValid(petId)) {
      throw new BadRequestException('ID thú cưng không hợp lệ');
    }

    // Admin can access any pet
    if (userRole === 'admin') {
      const pet = await this.petModel.findOne({
        _id: petId,
        isActive: true,
      });

      if (!pet) {
        throw new NotFoundException('Không tìm thấy thú cưng');
      }

      return pet;
    }

    // Regular users must own the pet
    const pet = await this.petModel.findOne({
      _id: petId,
      ownerId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!pet) {
      throw new NotFoundException('Không tìm thấy thú cưng hoặc bạn không có quyền truy cập');
    }

    return pet;
  }

  // ==================== VACCINATIONS ====================

  async getVaccinations(userId: string, petId: string, userRole?: string) {
    const pet = await this.verifyOwnership(petId, userId, userRole);
    return {
      petId: pet._id,
      petName: pet.name,
      vaccinations: pet.vaccinations,
    };
  }

  async addVaccination(
    userId: string,
    petId: string,
    addVaccinationDto: AddVaccinationDto,
    userRole?: string,
  ) {
    const pet = await this.verifyOwnership(petId, userId, userRole);

    const vaccination = {
      _id: new Types.ObjectId(),
      name: addVaccinationDto.name,
      date: new Date(addVaccinationDto.date),
      nextDue: addVaccinationDto.nextDue
        ? new Date(addVaccinationDto.nextDue)
        : undefined,
      notes: addVaccinationDto.notes || '',
    };

    pet.vaccinations.push(vaccination as any);
    await pet.save({ validateModifiedOnly: true });

    return {
      vaccination,
      pet,
    };
  }

  async updateVaccination(
    userId: string,
    petId: string,
    vaccinationId: string,
    updateVaccinationDto: UpdateVaccinationDto,
    userRole?: string,
  ) {
    const pet = await this.verifyOwnership(petId, userId, userRole);

    const vaccination = pet.vaccinations.find(
      (v: any) => v._id.toString() === vaccinationId,
    );

    if (!vaccination) {
      throw new NotFoundException('Không tìm thấy lịch sử tiêm phòng');
    }

    if (updateVaccinationDto.name !== undefined) {
      vaccination.name = updateVaccinationDto.name;
    }
    if (updateVaccinationDto.date !== undefined) {
      vaccination.date = new Date(updateVaccinationDto.date);
    }
    if (updateVaccinationDto.nextDue !== undefined) {
      vaccination.nextDue = new Date(updateVaccinationDto.nextDue);
    }
    if (updateVaccinationDto.notes !== undefined) {
      vaccination.notes = updateVaccinationDto.notes;
    }

    await pet.save({ validateModifiedOnly: true });

    return { vaccination };
  }

  async deleteVaccination(
    userId: string, 
    petId: string, 
    vaccinationId: string,
    userRole?: string,
  ) {
    const pet = await this.verifyOwnership(petId, userId, userRole);

    const vaccinationIndex = pet.vaccinations.findIndex(
      (v: any) => v._id.toString() === vaccinationId,
    );

    if (vaccinationIndex === -1) {
      throw new NotFoundException('Không tìm thấy lịch sử tiêm phòng');
    }

    pet.vaccinations.splice(vaccinationIndex, 1);
    await pet.save({ validateModifiedOnly: true });

    return { message: 'Xóa lịch sử tiêm phòng thành công' };
  }

  // ==================== MEDICAL HISTORY ====================

  async getMedicalHistory(userId: string, petId: string, userRole?: string) {
    const pet = await this.verifyOwnership(petId, userId, userRole);
    return {
      petId: pet._id,
      petName: pet.name,
      medicalHistory: pet.medicalHistory,
    };
  }

  async addMedicalRecord(
    userId: string,
    petId: string,
    addMedicalRecordDto: AddMedicalRecordDto,
    userRole?: string,
  ) {
    const pet = await this.verifyOwnership(petId, userId, userRole);

    const medicalRecord = {
      _id: new Types.ObjectId(),
      date: new Date(addMedicalRecordDto.date),
      description: addMedicalRecordDto.description,
      veterinarian: addMedicalRecordDto.veterinarian || '',
      clinic: addMedicalRecordDto.clinic || '',
      diagnosis: addMedicalRecordDto.diagnosis || [],
      prescription: addMedicalRecordDto.prescription || [],
      documents: addMedicalRecordDto.documents || [],
      followUpDate: addMedicalRecordDto.followUpDate 
        ? new Date(addMedicalRecordDto.followUpDate)
        : null,
      cost: addMedicalRecordDto.cost || 0,
      isActive: true,
    };

    pet.medicalHistory.push(medicalRecord as any);
    await pet.save({ validateModifiedOnly: true });

    return {
      medicalRecord,
      pet,
    };
  }

  // ==================== NEW: UPDATE MEDICAL HISTORY ====================
  
  async updateMedicalRecord(
    userId: string,
    petId: string,
    recordId: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    userRole?: string,
  ) {
    const pet = await this.verifyOwnership(petId, userId, userRole);

    const medicalRecord = pet.medicalHistory.find(
      (record: any) => record._id.toString() === recordId,
    );

    if (!medicalRecord) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh án');
    }

    // Check if record is active
    if (!medicalRecord.isActive) {
      throw new BadRequestException('Không thể cập nhật hồ sơ đã bị xóa');
    }

    // Update fields
    if (updateMedicalRecordDto.date !== undefined) {
      medicalRecord.date = new Date(updateMedicalRecordDto.date);
    }
    if (updateMedicalRecordDto.description !== undefined) {
      medicalRecord.description = updateMedicalRecordDto.description;
    }
    if (updateMedicalRecordDto.veterinarian !== undefined) {
      medicalRecord.veterinarian = updateMedicalRecordDto.veterinarian;
    }
    if (updateMedicalRecordDto.clinic !== undefined) {
      medicalRecord.clinic = updateMedicalRecordDto.clinic;
    }
    if (updateMedicalRecordDto.diagnosis !== undefined) {
      medicalRecord.diagnosis = updateMedicalRecordDto.diagnosis;
    }
    if (updateMedicalRecordDto.prescription !== undefined) {
      medicalRecord.prescription = updateMedicalRecordDto.prescription;
    }
    if (updateMedicalRecordDto.documents !== undefined) {
      medicalRecord.documents = updateMedicalRecordDto.documents;
    }
    if (updateMedicalRecordDto.followUpDate !== undefined) {
      medicalRecord.followUpDate = updateMedicalRecordDto.followUpDate
        ? new Date(updateMedicalRecordDto.followUpDate)
        : (null as any);
    }
    if (updateMedicalRecordDto.cost !== undefined) {
      medicalRecord.cost = updateMedicalRecordDto.cost;
    }

    await pet.save({ validateModifiedOnly: true });

    return { 
      message: 'Cập nhật hồ sơ bệnh án thành công',
      medicalRecord 
    };
  }

  // ==================== NEW: DELETE MEDICAL HISTORY ====================
  
  async deleteMedicalRecord(
    userId: string, 
    petId: string, 
    recordId: string,
    userRole?: string,
  ) {
    const pet = await this.verifyOwnership(petId, userId, userRole);

    const medicalRecord = pet.medicalHistory.find(
      (record: any) => record._id.toString() === recordId,
    );

    if (!medicalRecord) {
      throw new NotFoundException('Không tìm thấy hồ sơ bệnh án');
    }

    // Soft delete: mark as inactive instead of removing
    medicalRecord.isActive = false;
    await pet.save({ validateModifiedOnly: true });

    return { message: 'Xóa hồ sơ bệnh án thành công' };
  }

  // ==================== PHOTO MANAGEMENT ====================

  async addPhoto(userId: string, petId: string, photoUrl: string, userRole?: string) {
    const pet = await this.verifyOwnership(petId, userId, userRole);
    
    pet.photo = photoUrl;
    await pet.save({ validateModifiedOnly: true });

    return {
      message: 'Thêm ảnh thành công',
      data: pet,
    };
  }

  async deletePhoto(userId: string, petId: string, userRole?: string) {
    const pet = await this.verifyOwnership(petId, userId, userRole);
    
    pet.photo = null;
    await pet.save({ validateModifiedOnly: true });

    return {
      message: 'Xóa ảnh thành công',
      data: pet,
    };
  }
}