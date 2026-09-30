import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('staff/login')
  async staffLogin(@Req() req: TenantRequest, @Body() body: { email: string; password: string }) {
    return this.authService.loginStaff(req.tenant.id, body);
  }

  @Post('shopper/otp')
  async shopperOtp(@Req() req: TenantRequest, @Body() body: { phone: string }) {
    return this.authService.loginShopper(req.tenant.id, body.phone);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const user = req.user;
    if (!user) return { user: null };
    return this.authService.getStaffProfile(user.sub, req.tenant.id);
  }
}
