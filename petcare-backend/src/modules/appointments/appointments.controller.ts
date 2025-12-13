import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
  CancelAppointmentDto,
  FilterAppointmentDto,
  GetAvailableSlotsDto,
} from './dto/appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // F5.1: Book appointment (User)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createAppointment(@Req() req, @Body() createDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(req.user.userId, createDto);
  }

  // F5.2: Get my appointments (User)
  @Get('my-appointments')
  @UseGuards(JwtAuthGuard)
  async getMyAppointments(@Req() req, @Query() filterDto: FilterAppointmentDto) {
    return this.appointmentsService.getMyAppointments(req.user.userId, filterDto);
  }

  // F5.7: Get available time slots (Public)
  @Get('available-slots')
  async getAvailableSlots(@Query() dto: GetAvailableSlotsDto) {
    return this.appointmentsService.getAvailableSlots(dto);
  }

  // F5.8: Get statistics (Admin)
  @Get('stats/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics() {
    return this.appointmentsService.getStatistics();
  }

  // F5.5: Get all appointments (Admin)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllAppointments(@Query() filterDto: FilterAppointmentDto) {
    return this.appointmentsService.getAllAppointments(filterDto);
  }

  // F5.3: Get appointment detail
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAppointmentDetail(@Req() req, @Param('id') id: string) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.appointmentsService.getAppointmentDetail(
      req.user.userId,
      id,
      isAdmin,
    );
  }

  // F5.4: Cancel appointment (User)
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelAppointment(
    @Req() req,
    @Param('id') id: string,
    @Body() cancelDto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancelAppointment(
      req.user.userId,
      id,
      cancelDto,
    );
  }

  // F5.6: Update appointment status (Admin)
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateAppointmentStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
      req.user.userId,
      id,
      updateDto,
    );
  }
}