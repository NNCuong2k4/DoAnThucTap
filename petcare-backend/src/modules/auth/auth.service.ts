import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { UpdateProfileDto } from '../../dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // ==================== REGISTER ====================
  async register(registerDto: RegisterDto) {
    try {
      const { email, password, name, phone, address } = registerDto;

      // Check if email already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new this.userModel({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'user', // Default role
        isActive: true,
      });

      await user.save();

      this.logger.log(`New user registered: ${email}`);

      // Generate JWT token
      const tokenData = await this.generateToken(user);

      // ✅ FIXED: Return token as string, not object
      return {
        message: 'Đăng ký thành công',
        user: this.sanitizeUser(user),
        token: tokenData.accessToken, // ← Return string directly
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ==================== LOGIN ====================
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user by email
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // Check if user is banned
      if ((user as any).isBanned) {
        throw new UnauthorizedException(
          `Tài khoản đã bị khóa. Lý do: ${(user as any).banReason || 'Vi phạm chính sách'}`,
        );
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
      }

      // BACKWARD COMPATIBLE: Support both 'password' and 'passwordHash'
      const userObj = user.toObject();
      const storedPassword = (userObj as any).password || (userObj as any).passwordHash;
      
      if (!storedPassword) {
        throw new UnauthorizedException('Dữ liệu người dùng không hợp lệ');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, storedPassword);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      this.logger.log(`User logged in: ${email} | Role: ${user.role}`);

      // Generate JWT token
      const tokenData = await this.generateToken(user);

      // ✅ FIXED: Return token as string, not object
      return {
        message: 'Đăng nhập thành công',
        user: this.sanitizeUser(user),
        token: tokenData.accessToken, // ← Return string directly
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  // ==================== GET PROFILE ====================
  async getProfile(userId: string) {
    try {
      this.logger.log(`Getting profile for user: ${userId}`);
      
      // Find user and exclude password fields
      const user = await this.userModel
        .findById(userId)
        .select('-password -passwordHash');
      
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      const userObj = user.toObject();

      return {
        message: 'Lấy thông tin người dùng thành công',
        user: {
          id: userObj._id,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone || null,
          address: userObj.address || null,
          dateOfBirth: userObj.dateOfBirth || null,
          avatar: userObj.avatar || null,
          role: userObj.role,
          isActive: userObj.isActive || true,
          isBanned: userObj.isBanned || false,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ==================== UPDATE PROFILE ====================
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      this.logger.log(`Updating profile for user: ${userId}`);
      this.logger.debug(`Update data: ${JSON.stringify(updateProfileDto)}`);

      // Find user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      // Update fields if provided
      if (updateProfileDto.name !== undefined) {
        user.name = updateProfileDto.name;
        this.logger.debug(`Updated name: ${updateProfileDto.name}`);
      }
      
      if (updateProfileDto.phone !== undefined) {
        user.phone = updateProfileDto.phone;
        this.logger.debug(`Updated phone: ${updateProfileDto.phone}`);
      }
      
      if (updateProfileDto.address !== undefined) {
        user.address = updateProfileDto.address;
        this.logger.debug(`Updated address: ${updateProfileDto.address}`);
      }
      
      if (updateProfileDto.dateOfBirth !== undefined) {
        try {
          user.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
          this.logger.debug(`Updated dateOfBirth: ${user.dateOfBirth}`);
        } catch (dateError) {
          this.logger.error(`Invalid date format: ${updateProfileDto.dateOfBirth}`);
          throw new BadRequestException('Định dạng ngày sinh không hợp lệ');
        }
      }
      
      if (updateProfileDto.avatar !== undefined) {
        (user as any).avatar = updateProfileDto.avatar;
        this.logger.debug(`Updated avatar: ${updateProfileDto.avatar}`);
      }

      // CRITICAL FIX: Save with validateModifiedOnly option
      // This prevents password validation errors when updating other fields
      await user.save({ validateModifiedOnly: true });
      
      this.logger.log(`Profile updated successfully ✅`);

      // Return updated user
      const userObj = user.toObject();

      return {
        message: 'Cập nhật thông tin thành công',
        user: {
          id: userObj._id,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone || null,
          address: userObj.address || null,
          dateOfBirth: userObj.dateOfBirth || null,
          avatar: userObj.avatar || null,
          role: userObj.role,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error updating profile: ${error.message}`, error.stack);
      
      // Re-throw known errors
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.',
      );
    }
  }

  // ==================== CHANGE PASSWORD ====================
  async changePassword(
    userId: string, 
    oldPassword: string, 
    newPassword: string
  ) {
    try {
      this.logger.log(`Changing password for user: ${userId}`);

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      // Get stored password (backward compatible)
      const userObj = user.toObject();
      const storedPassword = (userObj as any).password || (userObj as any).passwordHash;

      if (!storedPassword) {
        throw new UnauthorizedException('Dữ liệu người dùng không hợp lệ');
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, storedPassword);
      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Mật khẩu cũ không đúng');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      (user as any).password = hashedNewPassword;

      // Save with validateModifiedOnly
      await user.save({ validateModifiedOnly: true });

      this.logger.log(`Password changed successfully for user: ${userId}`);

      return {
        message: 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      this.logger.error(`Change password error: ${error.message}`);
      throw error;
    }
  }

  // ==================== VALIDATE USER ====================
  async validateUser(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      // Check if user is banned
      if ((user as any).isBanned) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Validate user error: ${error.message}`);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate JWT access token
   * Returns object with accessToken and expiresIn
   */
  private async generateToken(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      userId: user._id.toString(), // Add userId for easier access in guards
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.debug(`Token generated for user: ${user.email}`);

    return {
      accessToken,
      expiresIn: '7d',
    };
  }

  /**
   * Remove sensitive fields from user object
   * Returns sanitized user without password, passwordHash, refreshToken
   */
  private sanitizeUser(user: UserDocument) {
    const userObj = user.toObject();
    const { 
      password, 
      passwordHash, 
      refreshToken, 
      ...sanitized 
    } = userObj as any;
    
    return sanitized;
  }
}