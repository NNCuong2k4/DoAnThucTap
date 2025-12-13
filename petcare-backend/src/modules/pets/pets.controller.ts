import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreatePetDto } from './dto/create-pet.dto';
import { UserRole } from '../../schemas/user.schema';
import { UpdatePetDto } from './dto/update-pet.dto';
import { AddVaccinationDto, UpdateVaccinationDto } from './dto/add-vaccination.dto';
import { AddMedicalRecordDto, UpdateMedicalRecordDto } from './dto/add-medical-record.dto';

@Controller('pets')
@UseGuards(JwtAuthGuard, RolesGuard)  // ✅ ADD RolesGuard
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  // ⭐ NEW: Get user's pets (PRIORITY HIGH)
  @Get('my-pets')
  @HttpCode(HttpStatus.OK)
  async getMyPets(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    const pets = await this.petsService.findMyPets(userId);

    return {
      message:
        pets.length > 0
          ? 'Lấy danh sách thú cưng thành công'
          : 'Chưa có thú cưng nào',
      pets,
      total: pets.length,
    };
  }

  // Get all pets (Admin only)
  @Get()
  @Roles(UserRole.ADMIN)  // ✅ REMOVED duplicate @Roles
  async getAllPets() {
    const pets = await this.petsService.findAll();

    return {
      message: 'Lấy danh sách tất cả thú cưng thành công',
      pets,
      total: pets.length,
    };
  }

  // Get pet by ID
  @Get(':id')
  async getPetById(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const pet = await this.petsService.verifyOwnership(id, userId, userRole);

    return {
      message: 'Lấy thông tin thú cưng thành công',
      pet,
    };
  }

  // Create new pet
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPet(@Body() createPetDto: CreatePetDto, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    const pet = await this.petsService.create(userId, createPetDto);

    return {
      message: 'Tạo thú cưng thành công',
      pet,
    };
  }

  // Update pet - ✅ FIXED: Pass role to service
  @Put(':id')
  async updatePet(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const pet = await this.petsService.update(userId, id, updatePetDto, userRole);

    return {
      message: 'Cập nhật thông tin thú cưng thành công',
      pet,
    };
  }

  // Delete pet - ✅ FIXED: Pass role to service
  @Delete(':id')
  async deletePet(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    return await this.petsService.delete(userId, id, userRole);
  }

  // ==================== VACCINATIONS ====================

  // Get pet's vaccinations
  @Get(':petId/vaccinations')
  async getVaccinations(@Param('petId') petId: string, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const result = await this.petsService.getVaccinations(userId, petId, userRole);

    return {
      message: 'Lấy lịch sử tiêm phòng thành công',
      petId: result.petId,
      petName: result.petName,
      vaccinations: result.vaccinations,
    };
  }

  // ⭐ NEW: Add vaccination (PRIORITY MEDIUM)
  @Post(':petId/vaccinations')
  @HttpCode(HttpStatus.CREATED)
  async addVaccination(
    @Param('petId') petId: string,
    @Body() addVaccinationDto: AddVaccinationDto,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const result = await this.petsService.addVaccination(
      userId,
      petId,
      addVaccinationDto,
      userRole,
    );

    return {
      message: 'Thêm lịch sử tiêm phòng thành công',
      vaccination: result.vaccination,
      pet: result.pet,
    };
  }

  // ⭐ NEW: Update vaccination (PRIORITY LOW)
  @Put(':petId/vaccinations/:vaccinationId')
  async updateVaccination(
    @Param('petId') petId: string,
    @Param('vaccinationId') vaccinationId: string,
    @Body() updateVaccinationDto: UpdateVaccinationDto,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const result = await this.petsService.updateVaccination(
      userId,
      petId,
      vaccinationId,
      updateVaccinationDto,
      userRole,
    );

    return {
      message: 'Cập nhật tiêm phòng thành công',
      vaccination: result.vaccination,
    };
  }

  // ⭐ NEW: Delete vaccination (PRIORITY LOW)
  @Delete(':petId/vaccinations/:vaccinationId')
  async deleteVaccination(
    @Param('petId') petId: string,
    @Param('vaccinationId') vaccinationId: string,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    return await this.petsService.deleteVaccination(userId, petId, vaccinationId, userRole);
  }

  // ==================== MEDICAL HISTORY ====================

  // Get pet's medical history
  @Get(':petId/medical-history')
  async getMedicalHistory(@Param('petId') petId: string, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const result = await this.petsService.getMedicalHistory(userId, petId, userRole);

    return {
      message: 'Lấy lịch sử bệnh án thành công',
      petId: result.petId,
      petName: result.petName,
      medicalHistory: result.medicalHistory,
    };
  }

  // Add medical record
  @Post(':petId/medical-history')
  @HttpCode(HttpStatus.CREATED)
  async addMedicalRecord(
    @Param('petId') petId: string,
    @Body() addMedicalRecordDto: AddMedicalRecordDto,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const result = await this.petsService.addMedicalRecord(
      userId,
      petId,
      addMedicalRecordDto,
      userRole,
    );

    return {
      message: 'Thêm bệnh án thành công',
      medicalRecord: result.medicalRecord,
      pet: result.pet,
    };
  }

  // ==================== NEW: UPDATE MEDICAL HISTORY ====================
  
  @Put(':petId/medical-history/:recordId')
  async updateMedicalRecord(
    @Param('petId') petId: string,
    @Param('recordId') recordId: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    const result = await this.petsService.updateMedicalRecord(
      userId,
      petId,
      recordId,
      updateMedicalRecordDto,
      userRole,
    );

    return {
      message: result.message,
      medicalRecord: result.medicalRecord,
    };
  }

  // ==================== NEW: DELETE MEDICAL HISTORY ====================
  
  @Delete(':petId/medical-history/:recordId')
  @HttpCode(HttpStatus.OK)
  async deleteMedicalRecord(
    @Param('petId') petId: string,
    @Param('recordId') recordId: string,
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;  // ✅ ADD role
    return await this.petsService.deleteMedicalRecord(userId, petId, recordId, userRole);
  }

  // ==================== PHOTO MANAGEMENT ====================
  
  @Post(':id/photo')
  @HttpCode(HttpStatus.OK)
  async uploadPhoto(
    @Param('id') id: string,
    @Body() body: { photoUrl: string },
    @Request() req,
  ) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;
    return await this.petsService.addPhoto(userId, id, body.photoUrl, userRole);
  }

  @Delete(':id/photo')
  @HttpCode(HttpStatus.OK)
  async deletePhoto(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    const userRole = req.user.role;
    return await this.petsService.deletePhoto(userId, id, userRole);
  }
}