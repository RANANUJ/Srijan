import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadController {
  constructor(private leadService: LeadService) {}

  // Public endpoint — called from landing page onboarding form
  @Post('capture')
  @ApiOperation({ summary: 'Capture a new brand signup lead from the landing page' })
  capture(@Body() dto: CreateLeadDto) {
    return this.leadService.captureLead(dto);
  }

  // Internal endpoint — list all trial/new leads for provisioning
  @Get()
  @ApiOperation({ summary: 'List all pending trial tenants (internal use)' })
  findAll() {
    return this.leadService.getAllLeads();
  }
}
