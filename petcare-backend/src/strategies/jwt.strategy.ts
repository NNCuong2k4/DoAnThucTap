import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-here',
    });
  }

  async validate(payload: any) {
    // Validate user exists and is not banned
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // IMPORTANT: Return object that will be attached to req.user
    // This object should have userId field for consistency
    return {
      userId: payload.sub,  // ← CRITICAL: Set userId here
      sub: payload.sub,     // Keep sub for backward compatibility
      email: payload.email,
      role: payload.role,
    };
  }
}