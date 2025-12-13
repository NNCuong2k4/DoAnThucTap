// Copy toàn bộ file từ upload, chỉ sửa line 125

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
  ServiceType,
  AppointmentStatus,
  TimeSlot,
} from '../../schemas/appointment.schema';
import { Pet, PetDocument } from '../../schemas/pet.schema';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
  CancelAppointmentDto,
  FilterAppointmentDto,
  GetAvailableSlotsDto,
} from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
  ) {}

  // Service prices
  private readonly servicePrices = {
    [ServiceType.GROOMING]: 200000,
    [ServiceType.VETERINARY]: 300000,
    [ServiceType.SPA]: 250000,
    [ServiceType.TRAINING]: 500000,
    [ServiceType.HOTEL]: 150000,
  };

  // F5.1: Book appointment (User)
  async createAppointment(userId: string, createDto: CreateAppointmentDto) {
    // Verify pet exists and belongs to user
    const pet = await this.petModel.findById(createDto.petId);
    if (!pet) {
      throw new NotFoundException('Không tìm thấy thú cưng');
    }

    // Check ownership - Pet schema uses ownerId field
    const petOwnerId = pet.ownerId.toString();
    if (petOwnerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền đặt lịch cho thú cưng này');
    }

    // Check appointment date is in future
    const appointmentDate = new Date(createDto.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      throw new BadRequestException('Không thể đặt lịch cho ngày trong quá khứ');
    }

    // Check if slot is available
    const existingAppointment = await this.appointmentModel.findOne({
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      timeSlot: createDto.timeSlot,
      serviceType: createDto.serviceType,
      status: {
        $in: [
          AppointmentStatus.PENDING,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.IN_PROGRESS,
        ],
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Khung giờ này đã được đặt');
    }

    // Get price
    const price = this.servicePrices[createDto.serviceType];

    // Create appointment
    const appointment = new this.appointmentModel({
      userId: new Types.ObjectId(userId),
      petId: new Types.ObjectId(createDto.petId),
      serviceType: createDto.serviceType,
      appointmentDate: new Date(createDto.appointmentDate),
      timeSlot: createDto.timeSlot,
      price,
      notes: createDto.notes,
      customerName: createDto.customerName,
      customerPhone: createDto.customerPhone,
      status: AppointmentStatus.PENDING,
      statusHistory: [
        {
          status: AppointmentStatus.PENDING,
          timestamp: new Date(),
          note: 'Lịch hẹn đã được tạo',
        },
      ],
    });

    await appointment.save();
    await appointment.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'petId', select: 'name species breed age' },
    ]);

    return {
      message: 'Đặt lịch thành công',
      data: appointment,
    };
  }

  // F5.2: Get my appointments (User)
  async getMyAppointments(userId: string, filterDto: FilterAppointmentDto) {
    const { page = 1, limit = 10, status, serviceType, dateFrom, dateTo } = filterDto;

    // ✅ CRITICAL FIX: Convert userId string to ObjectId for query
    const filter: any = { userId: new Types.ObjectId(userId) };

    if (status) {
      filter.status = status;
    }

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    if (dateFrom || dateTo) {
      filter.appointmentDate = {};
      if (dateFrom) {
        filter.appointmentDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.appointmentDate.$lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .populate('petId', 'name species breed age')
        .sort({ appointmentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.appointmentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Lấy danh sách lịch hẹn thành công',
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // F5.3: Get appointment detail
  async getAppointmentDetail(
    userId: string,
    appointmentId: string,
    isAdmin: boolean = false,
  ) {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('ID lịch hẹn không hợp lệ');
    }

    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('userId', 'name email phone')
      .populate('petId', 'name species breed age gender weight');

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }

    // Check ownership (unless admin)
    if (!isAdmin && (appointment.userId as any)._id?.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem lịch hẹn này');
    }

    return {
      message: 'Lấy thông tin lịch hẹn thành công',
      data: appointment,
    };
  }

  // F5.4: Cancel appointment (User)
  async cancelAppointment(
    userId: string,
    appointmentId: string,
    cancelDto: CancelAppointmentDto,
  ) {
    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }

    // Check ownership
    if (appointment.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy lịch hẹn này');
    }

    // Check if can cancel
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Không thể hủy lịch hẹn ở trạng thái ${appointment.status}`,
      );
    }

    // Check if cancelling at least 24 hours before appointment
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24 && appointment.status === AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(
        'Không thể hủy lịch hẹn đã xác nhận trong vòng 24 giờ trước giờ hẹn',
      );
    }

    // Update appointment
    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelReason = cancelDto.reason;
    appointment.cancelledAt = new Date();

    appointment.statusHistory.push({
      status: AppointmentStatus.CANCELLED,
      timestamp: new Date(),
      note: `Lịch hẹn bị hủy. Lý do: ${cancelDto.reason}`,
      updatedBy: new Types.ObjectId(userId),
    });

    await appointment.save();

    return {
      message: 'Hủy lịch hẹn thành công',
      data: appointment,
    };
  }

  // Rest of the methods remain the same...
  // (getAllAppointments, updateAppointmentStatus, getAvailableSlots, getStatistics, validateStatusTransition)

  async getAllAppointments(filterDto: FilterAppointmentDto) {
    const {
      page = 1,
      limit = 20,
      status,
      serviceType,
      dateFrom,
      dateTo,
      userId,
      petId,
    } = filterDto;

    const filter: any = {};

    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (userId) filter.userId = userId;
    if (petId) filter.petId = petId;

    if (dateFrom || dateTo) {
      filter.appointmentDate = {};
      if (dateFrom) filter.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.appointmentDate.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .populate('userId', 'name email phone')
        .populate('petId', 'name species breed')
        .sort({ appointmentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.appointmentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Lấy danh sách lịch hẹn thành công',
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async updateAppointmentStatus(
    adminId: string,
    appointmentId: string,
    updateDto: UpdateAppointmentStatusDto,
  ) {
    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Không thể cập nhật lịch hẹn đã hủy');
    }

    this.validateStatusTransition(appointment.status, updateDto.status);

    appointment.status = updateDto.status;

    if (updateDto.status === AppointmentStatus.COMPLETED) {
      appointment.completedAt = new Date();
      appointment.isPaid = true;
    }

    if (updateDto.veterinarianNotes) {
      appointment.veterinarianNotes = updateDto.veterinarianNotes;
    }

    appointment.statusHistory.push({
      status: updateDto.status,
      timestamp: new Date(),
      note: updateDto.note || `Lịch hẹn chuyển sang trạng thái ${updateDto.status}`,
      updatedBy: new Types.ObjectId(adminId),
    });

    await appointment.save();

    return {
      message: 'Cập nhật trạng thái lịch hẹn thành công',
      data: appointment,
    };
  }

  async getAvailableSlots(dto: GetAvailableSlotsDto) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const bookedAppointments = await this.appointmentModel.find({
      appointmentDate: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      serviceType: dto.serviceType,
      status: {
        $in: [
          AppointmentStatus.PENDING,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.IN_PROGRESS,
        ],
      },
    });

    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);
    const allSlots = Object.values(TimeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return {
      message: 'Lấy danh sách khung giờ thành công',
      data: {
        date: dto.date,
        serviceType: dto.serviceType,
        availableSlots,
        bookedSlots,
        totalSlots: allSlots.length,
        availableCount: availableSlots.length,
      },
    };
  }

  async getStatistics() {
    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      inProgressAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      appointmentsByService,
    ] = await Promise.all([
      this.appointmentModel.countDocuments(),
      this.appointmentModel.countDocuments({ status: AppointmentStatus.PENDING }),
      this.appointmentModel.countDocuments({ status: AppointmentStatus.CONFIRMED }),
      this.appointmentModel.countDocuments({ status: AppointmentStatus.IN_PROGRESS }),
      this.appointmentModel.countDocuments({ status: AppointmentStatus.COMPLETED }),
      this.appointmentModel.countDocuments({ status: AppointmentStatus.CANCELLED }),
      this.appointmentModel.aggregate([
        { $match: { status: AppointmentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      this.appointmentModel.aggregate([
        {
          $group: {
            _id: '$serviceType',
            count: { $sum: 1 },
            revenue: { $sum: '$price' },
          },
        },
      ]),
    ]);

    return {
      message: 'Lấy thống kê thành công',
      data: {
        totalAppointments,
        appointmentsByStatus: {
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          inProgress: inProgressAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
        totalRevenue: totalRevenue[0]?.total || 0,
        appointmentsByService: appointmentsByService.map((item) => ({
          serviceType: item._id,
          count: item.count,
          revenue: item.revenue,
        })),
      },
    };
  }

  private validateStatusTransition(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ) {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus];
    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái ${currentStatus} sang ${newStatus}`,
      );
    }
  }
}